import "./index.css";
import { useState, useEffect, useRef } from "react";
import { getAccessToken, supabase } from "./utils/auth";
import { Session } from "@supabase/supabase-js";
import Main from "./components/Main";
import {
  createOrganizationAndMembership,
  getOrgMemebershipsForUser,
  loadSites,
} from "./utils/db";
import { uploadSite } from "./utils/pinata";
import { LoginForm } from "./components/login-form";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import authHero from "./assets/auth-hero.jpg";
import logo from "./assets/black_logo.png";
import { Invite, Membership, Organization } from "./utils/types";
import { debounce } from "lodash";

export type PlanDetails = {
  planName: string;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  status: string;
  nextPlan?: string | null;
};

export default function App() {
  const [userSession, setSession] = useState<Session | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true); // Add this new state
  const [planDetails, setPlanDetails] = useState<PlanDetails>({
    planName: "free",
    currentPeriodStart: 0,
    currentPeriodEnd: 0,
    status: "active",
  });
  const [members, setMembers] = useState<Membership[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const currentUrlParams = new URLSearchParams(window.location.search);
    const cid = currentUrlParams.get("cid");
    if (cid) {
      localStorage.setItem("orbiter-cid", cid as string);
    }
  }, []);

  const prevOrgRef = useRef<string | null>(null);

  useEffect(() => {
    const loadOrgs = async () => {
      console.log("loading...");
      const memberships = await getOrgMemebershipsForUser();
      if (!memberships) return;

      // Prevent unnecessary state updates
      if (JSON.stringify(organizations) !== JSON.stringify(memberships)) {
        setOrganizations(memberships);
      }

      const orgs = memberships.length > 0 
        ? memberships.map((m: Membership) => m.organizations)
        : [];

      const localOrg = localStorage.getItem("orbiter-org");
      const foundLocalOrgMatch = orgs?.find((o) => o.id === localOrg);
      const ownedOrg = orgs?.find((o) => o.owner_id === userSession?.user?.id) || null;

      const newSelectedOrg = foundLocalOrgMatch || ownedOrg;

      // Only update if selection actually changes
      if (selectedOrganization?.id !== newSelectedOrg?.id) {
        setSelectedOrganization(newSelectedOrg);
      }
    };

    if (userSession) {
      loadOrgs();
    }
  }, [userSession]);

  // Debounced function to update Supabase user metadata
  const updateUserOrg = useRef(
    debounce(async (orgId) => {
      const { data, error } = await supabase.auth.updateUser({
        data: { orgId },
      });

      if (error) {
        console.error("Error updating org id in metadata:", error);
      } else {
        console.log("Org ID updated:", data);
      }
    }, 500) // Debounce by 500ms
  ).current;

  useEffect(() => {
    console.log("Selected org:", selectedOrganization);
    if (selectedOrganization) {
      loadMembers();

      // Only update Supabase if the orgId actually changes
      if (prevOrgRef.current !== selectedOrganization.id) {
        prevOrgRef.current = selectedOrganization.id;
        updateUserOrg(selectedOrganization.id);
      }
    }
  }, [selectedOrganization]);

  const loadMembers = async () => {
    try {
      const accessToken = await getAccessToken();

      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/members`,
        {
          //  @ts-ignore
          headers: {
            "X-Orbiter-Token": accessToken,
          },
        }
      );

      const data = await res.json();
      setMembers(data.data.members);
      setInvites(data.data.invites);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedOrganization) {
      localStorage.setItem("orbiter-org", selectedOrganization.id);
      handleLoadSites(selectedOrganization?.id);
      fetchPlanDetails(selectedOrganization?.id);
    }
  }, [selectedOrganization]);

  const fetchPlanDetails = async (orgId: string) => {
    const accessToken = await getAccessToken();
    const res = await fetch(
      `${import.meta.env.VITE_BASE_URL}/billing/${orgId}/plan`,
      {
        method: "GET",
        //  @ts-ignore
        headers: {
          "Content-Type": "application/json",
          "X-Orbiter-Token": accessToken,
        },
      }
    );

    const planInfo = await res.json();
    if (planInfo && planInfo.data) {
      setPlanDetails(planInfo?.data);
    }
  };

  const createSiteFromCid = async (cid: string, subdomain: string) => {
    try {
      setLoading(true);
      const accessToken = await getAccessToken();
      await fetch(`${import.meta.env.VITE_BASE_URL}/sites`, {
        method: "POST",
        //  @ts-ignore
        headers: {
          "Content-Type": "application/json",
          "X-Orbiter-Token": accessToken,
        },
        body: JSON.stringify({
          orgId: selectedOrganization?.id,
          cid: cid,
          subdomain: subdomain,
        }),
      });

      handleLoadSites(selectedOrganization?.id || "");
      setLoading(false);
      toast({
        title: "Site created!",
      });
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast({
        title: "Problem creating site",
        variant: "destructive",
      });
    }
  };

  const createSite = async (files: any, subdomain: string) => {
    setLoading(true);
    try {
      const accessToken = await getAccessToken();

      //  Generate one-time use key
      //  Upload site
      const cid = await uploadSite(files);
      if (!cid) {
        toast({
          title: "Problem uploading files",
          variant: "destructive",
        });
      }
      //  Create subdomain and contract
      const createSiteRequest = await fetch(
        `${import.meta.env.VITE_BASE_URL}/sites`,
        {
          method: "POST",
          //  @ts-ignore
          headers: {
            "Content-Type": "application/json",
            "X-Orbiter-Token": accessToken,
          },
          body: JSON.stringify({
            orgId: selectedOrganization?.id,
            cid: cid,
            subdomain: subdomain,
          }),
        }
      );

      if (!createSiteRequest.ok) {
        const data = await createSiteRequest.json();
        throw Error(data.message);
      }

      handleLoadSites(selectedOrganization?.id || "");
      setLoading(false);
      toast({
        title: "Site created!",
      });
    } catch (error) {
      console.log(error);
      //	@TODO add error toast
      setLoading(false);
      toast({
        title: "Problem creating site",
        description: `${error}`,
        variant: "destructive",
      });
    }
  };

  const updateSite = async (files: any, siteId: string, cid?: string) => {
    setLoading(true);
    try {
      const accessToken = await getAccessToken();

      //  Generate one-time use key
      //  Upload site
      if (!cid) {
        cid = await uploadSite(files);
        console.log(cid);
      }

      await fetch(`${import.meta.env.VITE_BASE_URL}/sites/${siteId}`, {
        method: "PUT",
        //  @ts-ignore
        headers: {
          "Content-Type": "application/json",
          "X-Orbiter-Token": accessToken,
        },
        body: JSON.stringify({
          cid,
        }),
      });

      handleLoadSites(selectedOrganization?.id || "");
      toast({
        title: "Site updated!",
      });
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast({
        title: "Problem updating site",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleLoadSites = async (orgId: string) => {
    try {
      const sites = await loadSites(orgId);
      setSites(sites?.data || []);
    } finally {
      setInitialLoading(false); // Set to false when data is loaded
    }
  };

  const deleteSite = async (siteId: string) => {
    try {
      const accessToken = await getAccessToken();
      await fetch(`${import.meta.env.VITE_BASE_URL}/sites/${siteId}`, {
        method: "DELETE",
        //	@ts-ignore
        headers: {
          "Content-Type": "application/json",
          "X-Orbiter-Token": accessToken,
        },
        body: "",
      });

      handleLoadSites(selectedOrganization?.id || "");
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const selectPlan = async (priceId: string) => {
    try {
      const accessToken = await getAccessToken();
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/billing/${
          selectedOrganization?.id
        }/plan`,
        {
          method: "POST",
          //  @ts-ignore
          headers: {
            "Content-Type": "application/json",
            "X-Orbiter-Token": accessToken,
          },
          body: JSON.stringify({
            priceId,
          }),
        }
      );
      const sessionRes = await res.json();
      const url = sessionRes?.data?.url;
      if (url) {
        window.location.replace(url);
      }
    } catch (error) {
      toast({
        title: "Problem Selecting Plan",
        description: `${error}`,
        variant: "destructive",
      });
      console.log(error);
    }
  };

  console.log({ selectedOrganization });

  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!userSession) {
    return (
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <a
              href="https://orbiter.host"
              className="flex items-center gap-2 font-medium"
            >
              <div className="flex w-24 items-center justify-center rounded-md">
                <img className="w-full" src={logo} alt="logo" />
              </div>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <LoginForm />
            </div>
          </div>
        </div>
        <div className="relative hidden bg-muted lg:block">
          <img
            src={authHero}
            alt="Heo"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full mx-auto">
      {organizations?.length > 0 && (
        <Main
          userSession={userSession}
          organizations={organizations}
          sites={sites}
          createSite={createSite}
          createSiteFromCid={createSiteFromCid}
          updateSite={updateSite}
          deleteSite={deleteSite}
          loading={loading}
          initialLoading={initialLoading}
          planDetails={planDetails}
          selectPlan={selectPlan}
          loadSites={handleLoadSites}
          selectedOrganization={selectedOrganization}
          setSelectedOrganization={setSelectedOrganization}
          members={members}
          loadMembers={loadMembers}
          invites={invites}
        />
      )}
      <Toaster />
    </div>
  );
}
