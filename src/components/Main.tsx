import { PlanDetails } from "@/App";
import Billing from "./Billing";
import Dashboard from "./Dashboard";
import { Nav } from "./nav";
import { Separator } from "@/components/ui/separator";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router";
import Admin from "./admin";
import { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Invite, Membership, Organization } from "@/utils/types";
import Members from "./Members";
import Invites from "./Invites";
import APIKeys from "./api-keys"
import Analytics from "./analytics";
import { MessageCircleIcon } from "lucide-react";
import { isOnboardingComplete } from "@/utils/db";
import OnboardingSurveyModal from "./OnboardingModal";

export const AUTHORIZED_IDS = [
  "491404e0-0c90-43fe-a86e-4e11014a7e52",
  "f5735334-738c-4d48-a324-226ac182a08b",
  "e931bc05-6164-436b-8960-e31df696217d",
];

type MainProps = {
  userSession: Session;
  organizations: any[];
  sites: any[];
  createSite: any;
  updateSite: any;
  loading: boolean;
  deleteSite: (siteId: string) => Promise<void>;
  createSiteFromCid: (cid: string, subdomain: string) => Promise<void>;
  initialLoading: boolean;
  planDetails: PlanDetails;
  selectPlan: (priceId: string) => Promise<void>;
  loadSites: () => Promise<void>;
  selectedOrganization: Organization | null;
  setSelectedOrganization: any;
  loadMembers: () => Promise<void>;
  members: Membership[];
  invites: Invite[];
};

const ProtectedRoute = ({ userSession, children, fallbackPath = "/" }: any) => {
  let navigate = useNavigate();

  useEffect(() => {
    if (!userSession?.user) {
      console.log("Unauthorized");
      navigate(fallbackPath);
      return;
    }

    const isAuthorized = AUTHORIZED_IDS.includes(userSession.user.id);
    if (!isAuthorized) {
      console.log("Unauthorized");
      navigate(fallbackPath);
      return;
    }
  }, [userSession, navigate, fallbackPath]);

  // Return children if authorized
  return children;
};

// Updated Main component with protected route
const Main = (props: MainProps) => {
  const [onboardingComplete, setOnboardingComplete] = useState(true);
  useEffect(() => {
    const checkOnboarding = async () => {
      const onboardingRes = await isOnboardingComplete();
      setOnboardingComplete(onboardingRes);
    }

    checkOnboarding();
  }, [props.userSession]);
  
  return (
    <div className="min-h-screen w-full flex flex-col gap-2">
      <BrowserRouter>
        <Nav
          organizations={props.organizations}
          session={props.userSession}
          selectedOrganization={props.selectedOrganization}
          setSelectedOrganization={props.setSelectedOrganization}
        />
        {
          !onboardingComplete && 
          <OnboardingSurveyModal userSession={props.userSession} />
        }
        <Separator />
        
        {props.organizations.length > 0 && (
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  updateSite={props.updateSite}
                  organization={props.organizations[0]}
                  sites={props.sites}
                  createSite={props.createSite}
                  loading={props.loading}
                  deleteSite={props.deleteSite}
                  createSiteFromCid={props.createSiteFromCid}
                  initialLoading={props.initialLoading}
                  planDetails={props.planDetails}
                  loadSites={props.loadSites}
                  selectedOrganization={props.selectedOrganization}
                />
              }
            />
            <Route
              path="/billing"
              element={
                <Billing
                  selectPlan={props.selectPlan}
                  planDetails={props.planDetails}
                  userSession={props.userSession}
                  selectedOrganization={props.selectedOrganization}
                />
              }
            />
            <Route
              path="/analytics/:id"
              element={
                <Analytics                  
                  planDetails={props.planDetails}
                  userSession={props.userSession}
                  selectedOrganization={props.selectedOrganization}
                />
              }
            />
            <Route
              path="/members"
              element={
                <Members
                  planDetails={props.planDetails}
                  organization={props.selectedOrganization}
                  userSession={props.userSession}
                  members={props.members}
                  loadMembers={props.loadMembers}
                  invites={props.invites}
                />
              }
            />
            <Route
              path="/invite"
              element={
                <Invites />
              }
            />
            <Route
              path="/api-keys"
              element={
                <APIKeys />
              }
            />
            {/* Protected route example */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute
                  userSession={props.userSession}
                  fallbackPath="/"
                >
                  <Admin />
                </ProtectedRoute>
              }
            />
          </Routes>
        )}
      </BrowserRouter>
      <a href="https://discord.gg/RWThJkbB4W" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center fixed left-10 bottom-10 h-12 w-12 rounded-full bg-gray-800 text-white">
        <MessageCircleIcon />        
      </a>
    </div>
  );
};

export default Main;
