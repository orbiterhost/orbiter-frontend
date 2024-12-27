import "./index.css";
import { useState, useEffect } from "react";
import Authenticate from "./components/Authenticate";
import { getAccessToken, supabase } from "./utils/auth";
import { Session } from "@supabase/supabase-js";
import Main from "./components/Main";
import {
  createOrganizationAndMembership,
  getOrgMemebershipsForUser,
  loadSites,
} from "./utils/db";
import { uploadSite } from "./utils/pinata";

export default function App() {
  const [userSession, setSession] = useState<Session | null>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const loadOrgs = async () => {
      const memberships = await getOrgMemebershipsForUser();
      if (memberships && memberships?.length === 0) {
        //  Create org and membership for user because this is a new user
        await createOrganizationAndMembership();
        const memberships = await getOrgMemebershipsForUser();
        setOrganizations(memberships || []);
        handleLoadSites(memberships || []);
      } else if (memberships) {
        setOrganizations(memberships);
        //  Load Sites
        handleLoadSites(memberships);
      }
    };
    if (userSession) {
      loadOrgs();
    }
  }, [userSession]);

  const createSite = async (files: any) => {
    const accessToken = await getAccessToken();

    //  Generate one-time use key
    //  Upload site
    const cid = await uploadSite(files);
    console.log(cid);
    //  Create subdomain and contract
    await fetch(`${import.meta.env.VITE_BASE_URL}/sites`, {
      method: "POST",
      //  @ts-ignore
      headers: {
        "Content-Type": "application/json",
        "X-Orbiter-Token": accessToken,
      },
      body: JSON.stringify({
        orgId: organizations[0].organizations.id,
        cid
      })
    });
    
    handleLoadSites(organizations);
  };

  const updateSite = async (files: any, siteId: string) => {
    const accessToken = await getAccessToken();

    //  Generate one-time use key
    //  Upload site
    const cid = await uploadSite(files);
    console.log(cid);
    //  Create subdomain and contract
    await fetch(`${import.meta.env.VITE_BASE_URL}/sites/${siteId}`, {
      method: "PUT",
      //  @ts-ignore
      headers: {
        "Content-Type": "application/json",
        "X-Orbiter-Token": accessToken,
      },
      body: JSON.stringify({
        cid
      })
    });
    
    handleLoadSites(organizations);
  };

  const handleLoadSites = async (membershipData: any[]) => {
    const sites = await loadSites(membershipData[0].organizations.id);
    setSites(sites?.data || []);
  };

  if (!userSession) {
    return <Authenticate />;
  } else {
    return (
      <Main
        organizations={organizations}
        sites={sites}
        createSite={createSite}
        updateSite={updateSite}
      />
    );
  }
}
