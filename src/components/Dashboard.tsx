import { CreateSiteForm } from "./create-site-form";
import { SiteCard } from "./site-card";
import { PlanDetails } from "@/App";
import { useToast } from "@/hooks/use-toast";
import { getAccessToken } from "@/utils/auth";
import { Organization, Site } from "@/utils/types";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Check, Copy } from "lucide-react";
import { UpsellModal } from "./upsell-modal";
import {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import APIKeyCreator from "./api-key-creator";

type DashboardProps = {
  organization: any;
  sites: Site[];
  createSite: any;
  updateSite: any;
  loading: boolean;
  deleteSite: (siteId: string) => Promise<void>;
  createSiteFromCid: (cid: string, subdomain: string) => Promise<void>;
  initialLoading: boolean;
  planDetails: PlanDetails;
  loadSites: () => Promise<void>;
  selectedOrganization: Organization | null;
};

const Dashboard = (props: DashboardProps) => {
  const [selectedTemplateCid, setSelectedTemplateCid] = useState("");
  const [copiedField, setCopiedField] = useState<string>("");

  let maxSites: any;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => {
      setCopiedField("");
    }, 2000);
  };

  useEffect(() => {
    setSelectedTemplateCid("");
  }, []);

  const { toast } = useToast();

  if (props.planDetails.planName === "launch" || props.planDetails.planName === "orbit") {
    maxSites = <span className="text-xl">∞</span>;
  } else {
    maxSites = "2";
  }

  const handleAddCustomDomain = async (customDomain: string, siteId: string) => {
    try {
      const accessToken = await getAccessToken();

      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/sites/${siteId}/custom_domain`, {
        method: "POST",
        //  @ts-ignore
        headers: {
          "Content-Type": "application/json",
          "X-Orbiter-Token": accessToken,
          Source: "web-app",
        },
        body: JSON.stringify({
          customDomain,
        }),
      });

      const data = await res.json();

      props.loadSites();
      return data.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const deleteCustomDomain = async (customDomain: string, siteId: string) => {
    try {
      const accessToken = await getAccessToken();

      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/sites/${siteId}/custom_domain`, {
        method: "DELETE",
        //  @ts-ignore
        headers: {
          "Content-Type": "application/json",
          "X-Orbiter-Token": accessToken,
          Source: "web-app",
        },
        body: JSON.stringify({
          customDomain,
        }),
      });

      console.log(await res.json());

      props.loadSites();
    } catch (error) {
      console.log(error);
      toast({
        title: "Problem removing custom domain",
        variant: "destructive",
      });
    }
  };

  // const useTemplate = (t: Template) => {
  //   setSelectedTemplateCid(t.cid);
  // }

  return (
    <div className="sm:max-w-screen-lg max-w-screen-sm w-full mx-auto flex flex-col items-start justify-center gap-2">
      <div className="sm:w-full w-[350px] mx-auto flex justify-end items-center sm:gap-4 gap-8 px-6 lg:px-0 pt-4">
        {props.sites.length > 0 && (
          <p className="font-bold">
            Sites: {props.sites.length} / {maxSites}
          </p>
        )}
        {props.planDetails.planName === "free" && props.sites.length === 2 ? (
          <UpsellModal feature="sites" />
        ) : (
          <CreateSiteForm {...props} />
        )}
      </div>
      {!props.initialLoading && props.sites.length === 0 && (
        <>
          <div className="w-3/4 md:w-4/5 lg:w-full m-auto flex flex-col items-center gap-4">
            {selectedTemplateCid && (
              <CreateSiteForm
                {...props}
                templateCid={selectedTemplateCid}
                setSelectedTemplateCid={setSelectedTemplateCid}
              />
            )}
            <div className="mt-8 space-y-8">
              <Stepper defaultValue={2} orientation="vertical">
                <StepperItem key={1} step={1} className="relative items-start not-last:flex-1">
                  <StepperTrigger className="items-start rounded pb-12 last:pb-0">
                    <StepperIndicator />
                    <div className="mt-0.5 space-y-0.5 px-2 text-left">
                      <StepperTitle>Create an API Key</StepperTitle>
                      <StepperDescription>
                        Click the button below to make a new API key and save it somewhere safe
                        <APIKeyCreator />
                      </StepperDescription>
                    </div>
                  </StepperTrigger>
                  <StepperSeparator className="absolute inset-y-0 top-[calc(1.5rem+0.125rem)] left-3 -order-1 m-0 -translate-x-1/2 group-data-[orientation=horizontal]/stepper:w-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/stepper:flex-none group-data-[orientation=vertical]/stepper:h-[calc(100%-1.5rem-0.25rem)]" />
                </StepperItem>
                <StepperItem key={2} step={2} className="relative items-start not-last:flex-1">
                  <StepperTrigger className="items-start rounded pb-12 last:pb-0">
                    <StepperIndicator />
                    <div className="mt-0.5 space-y-0.5 px-2 text-left">
                      <StepperTitle>Install the CLI</StepperTitle>
                      <StepperDescription>
                        Run the following command in your terminal to install the Orbiter CLI
                        <div className="flex items-center justify-between p-2 mt-4 bg-gray-100 rounded">
                          <code className="font-mono text-sm truncate max-w-[300px]">
                            npm i -g orbiter-cli
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy("npm i -g orbiter-cli", "key")}
                          >
                            {copiedField === "key" ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </StepperDescription>
                    </div>
                  </StepperTrigger>
                  <StepperSeparator className="absolute inset-y-0 top-[calc(1.5rem+0.125rem)] left-3 -order-1 m-0 -translate-x-1/2 group-data-[orientation=horizontal]/stepper:w-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/stepper:flex-none group-data-[orientation=vertical]/stepper:h-[calc(100%-1.5rem-0.25rem)]" />
                </StepperItem>

                <StepperItem key={3} step={3} className="relative items-start not-last:flex-1">
                  <StepperTrigger className="items-start rounded pb-12 last:pb-0">
                    <StepperIndicator />
                    <div className="mt-0.5 space-y-0.5 px-2 text-left">
                      <StepperTitle>Authorize the CLI</StepperTitle>
                      <StepperDescription>
                        Run the command below and paste in your API key when prompted
                        <div className="flex items-center justify-between p-2 mt-4 bg-gray-100 rounded">
                          <code className="font-mono text-sm truncate max-w-[300px]">
                            orbiter auth
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy("orbiter auth", "auth")}
                          >
                            {copiedField === "auth" ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </StepperDescription>
                    </div>
                  </StepperTrigger>
                  <StepperSeparator className="absolute inset-y-0 top-[calc(1.5rem+0.125rem)] left-3 -order-1 m-0 -translate-x-1/2 group-data-[orientation=horizontal]/stepper:w-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/stepper:flex-none group-data-[orientation=vertical]/stepper:h-[calc(100%-1.5rem-0.25rem)]" />
                </StepperItem>
                <StepperItem key={4} step={4} className="relative items-start not-last:flex-1">
                  <StepperTrigger className="items-start rounded pb-12 last:pb-0">
                    <StepperIndicator />
                    <div className="mt-0.5 space-y-0.5 px-2 text-left">
                      <StepperTitle>Creat a New App</StepperTitle>
                      <StepperDescription>
                        Run the command below to start a new Orbiter app
                        <div className="flex items-center justify-between p-2 mt-4 bg-gray-100 rounded">
                          <code className="font-mono text-sm truncate max-w-[300px]">
                            orbiter new
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy("orbiter new", "new")}
                          >
                            {copiedField === "new" ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </StepperDescription>
                    </div>
                  </StepperTrigger>
                  <StepperSeparator className="absolute inset-y-0 top-[calc(1.5rem+0.125rem)] left-3 -order-1 m-0 -translate-x-1/2 group-data-[orientation=horizontal]/stepper:w-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=horizontal]/stepper:flex-none group-data-[orientation=vertical]/stepper:h-[calc(100%-1.5rem-0.25rem)]" />
                </StepperItem>
              </Stepper>
            </div>
          </div>
        </>
      )}
      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 mx-auto lg:mx-0 gap-4 my-4">
        {[...props.sites]
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .map((site) => (
            <SiteCard
              key={site.id}
              site={site}
              loading={props.loading}
              updateSite={props.updateSite}
              deleteSite={props.deleteSite}
              handleAddCustomDomain={handleAddCustomDomain}
              deleteCustomDomain={deleteCustomDomain}
              planDetails={props.planDetails}
            />
          ))}
      </div>
    </div>
  );
};

export default Dashboard;
