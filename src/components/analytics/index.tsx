import { PlanDetails } from "@/App";
import { Organization } from "@/utils/types";
import { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import SiteAnalyticsByDay from "./Charts/SiteAnalyticsByDay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import Pages from "./Charts/Pages";
import Referrers from "./Charts/Referrers";
import WorldMap from "./Charts/WorldMap";

type AnalyticsProps = {
  planDetails: PlanDetails;
  userSession: Session;
  selectedOrganization: Organization | null;
};

const Analytics = (props: AnalyticsProps) => {
  const [period, setPeriod] = useState("seven");
  useEffect(() => {
    if (
      props.planDetails &&
      props.planDetails.planName &&
      props.planDetails.planName !== "orbit"
    ) {
      // window.location.replace("/");
    }
  }, [props.planDetails]);

  return (
    <div className="w-full pb-20 mt-10">
      <div className="w-3/4 m-auto flex justify-between items-center">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Site Analytics
        </h1>
        <div>
          <Tabs defaultValue="seven" className="w-full">
            <TabsList>
              <TabsTrigger onClick={() => setPeriod("seven")} value="seven">
                Last 7 days
              </TabsTrigger>
              <TabsTrigger onClick={() => setPeriod("thirty")} value="thirty">
                Last 30 days
              </TabsTrigger>
              <TabsTrigger onClick={() => setPeriod("ninety")} value="ninety">
                Last 90 days
              </TabsTrigger>
            </TabsList>
            <TabsContent value="seven"></TabsContent>
            <TabsContent value="thirty"></TabsContent>
            <TabsContent value="ninety"></TabsContent>
          </Tabs>
        </div>
      </div>
      <SiteAnalyticsByDay period={period} />
      <div className="mt-10 flex flex-col md:flex-row w-3/4 m-auto items-start justify-start">
        <Pages period={period} />
        <Referrers period={period} />
      </div>
    <WorldMap period={period} />
    </div>
  );
};

export default Analytics;
