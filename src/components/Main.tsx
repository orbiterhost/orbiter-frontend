import { PlanDetails } from "@/App";
import Billing from "./Billing";
import Dashboard from "./Dashboard";
import { Nav } from "./nav";
import { Separator } from "@/components/ui/separator";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router";
import Admin from "./admin";
import { Session } from "@supabase/supabase-js";
import { useEffect } from "react";
import { Organization } from "@/utils/types";

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
  loadSites: (orgId: string) => Promise<void>;
  selectedOrganization: Organization | null;
  setSelectedOrganization: any;
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
  return (
    <div className="min-h-screen w-full flex flex-col gap-2">
      <BrowserRouter>
        <Nav
          organizations={props.organizations}
          session={props.userSession}
          selectedOrganization={props.selectedOrganization}
          setSelectedOrganization={props.setSelectedOrganization}
        />
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
                />
              }
            />
            <Route
              path="/billing"
              element={
                <Billing
                  selectPlan={props.selectPlan}
                  planDetails={props.planDetails}
                />
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
    </div>
  );
};

export default Main;
