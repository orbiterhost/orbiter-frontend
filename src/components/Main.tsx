import { PlanDetails } from "@/App";
import Billing from "./Billing";
import Dashboard from "./Dashboard";
import { Nav } from "./nav";
import { Separator } from "@/components/ui/separator";
import { BrowserRouter, Routes, Route } from "react-router";

type MainProps = {
  organizations: any[];
  sites: any[];
  createSite: any;
  updateSite: any;
  loading: boolean;
  deleteSite: (siteId: string) => Promise<void>;
  createSiteFromCid: (cid: string, subdomain: string) => Promise<void>;
  initialLoading: boolean;
  planDetails: PlanDetails
  selectPlan: (priceId: string) => Promise<void>;
};

const Main = (props: MainProps) => {
  return (
    <div className="min-h-screen w-full flex flex-col gap-2">
      <BrowserRouter>
        <Nav organizations={props.organizations} />
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
                />
              }
            />
            <Route path="/billing" element={<Billing selectPlan={props.selectPlan} planDetails={props.planDetails} />} />
          </Routes>
        )}
      </BrowserRouter>
    </div>
  );
};

export default Main;
