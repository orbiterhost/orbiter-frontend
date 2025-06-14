import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { UpdateSiteForm } from "./update-site-form";
import {
  ChartAreaIcon,
  CircleCheck,
  Loader2,
  Settings,
  Trash,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { CustomDomainForm } from "./custom-domain-form";
import { useToast } from "@/hooks/use-toast";
import { Site } from "@/utils/types";
import { getAccessToken } from "@/utils/auth";
import { PlanDetails } from "@/App";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { UpdateVersionForm } from "./update-version-form";
import { SiteInfoModal } from "./site-info-modal";
import { UpsellModal } from "./upsell-modal";
import { AddEnsForm } from "./add-ens-form";
import "viem/window";
import { Link } from "react-router";
import { UpdateFunctionForm } from "./update-function-form";

type SiteCardProps = {
  site: Site;
  loading: boolean;
  updateSite: (files: File[], siteId: string) => Promise<void>;
  deleteSite: (siteId: string) => Promise<void>;
  handleAddCustomDomain: (
    customDomain: string,
    siteId: string
  ) => Promise<void>;
  deleteCustomDomain: (customDomain: string, siteId: string) => Promise<void>;
  planDetails: PlanDetails;
};

type SiteVersion = {
  id: string;
  site_id: string;
  created_at: string;
  organization_id: string;
  cid: string;
  domain: string;
  site_contract: string;
  version_number: number;
  deployed_by: string;
};

type FunctionDetails = {
  scriptName: string;
  created_on: string;
  modified_on: string;
  isDeployed: boolean;
  apiUrl: string;
  apiEndpoint: string;
  siteId: string;
  siteDomain: string;
  customDomain: string;
  script: string;
  environment: Record<string, string>;
  bindings: Array<{
    name: string;
    text: string;
    type: string;
  }>;
  lastUpdated: string;
  deployedName: string;
};

export const SiteCard = ({
  site,
  loading,
  updateSite,
  deleteSite,
  handleAddCustomDomain,
  deleteCustomDomain,
  planDetails,
}: SiteCardProps) => {
  const [isSiteReady, setIsSiteReady] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [customDomain, setCustomDomain] = useState("");
  
  // Lazy loading states
  const [versions, setVersions] = useState<SiteVersion[] | undefined>(undefined);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [versionsLoaded, setVersionsLoaded] = useState(false);
  
  const [functionDetails, setFunctionDetails] = useState<FunctionDetails | null>(null);
  const [functionLoading, setFunctionLoading] = useState(false);
  const [functionLoaded, setFunctionLoaded] = useState(false);

  const { toast } = useToast();

  console.log({ plan: planDetails.planName });

  // Only load versions when needed
  const loadVersions = async () => {
    if (versionsLoaded || versionsLoading || planDetails.planName === "free") {
      return;
    }

    setVersionsLoading(true);
    try {
      const accessToken = await getAccessToken();
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/sites/${site.domain}/versions`,
        {
          method: "GET",
          headers: {
            "X-Orbiter-Token": `${accessToken}`,
            "Content-Type": "Application/json",
            Source: "web-app",
          },
        }
      );
      const data = await response.json();
      setVersions(data.data);
      setVersionsLoaded(true);
    } catch (e) {
      console.log("Error loading versions:", e);
    } finally {
      setVersionsLoading(false);
    }
  };

// Only load function details when needed
const loadFunctionDetails = async () => {
  if (functionLoaded || functionLoading || planDetails.planName === "free") {
    return;
  }

  setFunctionLoading(true);
  try {
    const accessToken = await getAccessToken();
    const response = await fetch(
      `${import.meta.env.VITE_BASE_URL}/functions/${site.id}`,
      {
        method: "GET",
        headers: {
          "X-Orbiter-Token": `${accessToken}`,
          "Content-Type": "application/json", // Fixed casing
          Source: "web-app",
        },
      }
    );

    // Handle 404 gracefully - function might not exist yet
    if (response.status === 404) {
      console.log('Function not found for site:', site.id, '- this is normal for new sites');
      setFunctionDetails(null);
      setFunctionLoaded(true);
      return;
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const responseText = await response.text();
    
    if (!responseText.trim()) {
      setFunctionDetails(null);
      setFunctionLoaded(true);
      return;
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (jsonError) {
      console.error('Failed to parse function details response:', jsonError);
      setFunctionDetails(null);
      setFunctionLoaded(true);
      return;
    }

    if (data.data) {
      setFunctionDetails(data.data);
    } else {
      setFunctionDetails(null);
    }
    setFunctionLoaded(true);
  } catch (e) {
    console.log("Error loading function details:", e);
    setFunctionDetails(null);
    setFunctionLoaded(true); // Still mark as loaded to prevent infinite loading
  } finally {
    setFunctionLoading(false);
  }
};

  useEffect(() => {
    const checkSiteStatus = async () => {
      console.log("Checking site status");
      try {
        const response = await fetch(`https://${site.domain}`, {
          method: "HEAD",
        });
        if (response.status === 200) {
          setIsSiteReady(true);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error checking site status:', error);
        setIsSiteReady(false);
        return false;
      }
    };

    const checkCustomDomainStatus = async () => {
      console.log("Checking custom domain status");
      const accessToken = await getAccessToken();

      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/sites/${site.id}/verify_domain`,
        {
          method: "POST",
          // @ts-expect-error - Headers type mismatch
          headers: {
            "X-Orbiter-Token": accessToken,
            "Content-Type": "Application/json",
            Source: "web-app",
          },
          body: JSON.stringify({
            customDomain: site.custom_domain,
          }),
        }
      );

      const data = await response.json();

      if (data?.data?.isVerified && data?.data?.sslIssued) {
        setIsSiteReady(true);
        return true;
      }
      return false;
    };

    if (
      site.custom_domain &&
      (!site.ssl_issued || !site.domain_ownership_verified)
    ) {
      const interval = setInterval(async () => {
        const isReady = await checkCustomDomainStatus();
        if (isReady) {
          clearInterval(interval);
        }
      }, 30000);
      checkCustomDomainStatus();
      return () => clearInterval(interval);
    } else {
      const interval = setInterval(async () => {
        const isReady = await checkSiteStatus();
        if (isReady) {
          clearInterval(interval);
        }
      }, 1000);
      checkSiteStatus();
      return () => clearInterval(interval);
    }
  }, [site.domain, site.custom_domain]);

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>, siteId: string) => {
    e.preventDefault();
    try {
      setDeleting(true);
      await deleteSite(siteId);
      setDeleting(false);
    } catch (error) {
      console.log(error);
      setDeleting(false);
    }
  };

  function truncate(text: string) {
    if (text.length > 22) {
      return text.slice(0, 22) + "...";
    }
    return text;
  }

  const addCustomDomain = async (domain?: string) => {
    const domainToUse = domain ? domain : customDomain;
    try {
      const data = await handleAddCustomDomain(domainToUse, site.id);
      if (!domain) {
        toast({
          title: "Custom domain ready",
        });
      }

      return data;
    } catch (error) {
      console.log(error);
      toast({
        title: "Problem creating site",
        variant: "destructive",
      });
    }
  };

  const updateFunction = async (functionCode: string, envVars: Record<string, string>, siteId: string) => {
    console.log('Updating function with:', { functionCode, envVars, siteId });
    
    try {
      const accessToken = await getAccessToken();
      
      // Convert envVars to bindings format
      const bindings = Object.entries(envVars).map(([name, text]) => ({
        name,
        text,
        type: "secret_text" // Default type for environment variables
      }));
  
      const payload = {
        script: functionCode,
        bindings
      };
  
      console.log('Sending payload:', payload);
  
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/functions/deploy/${siteId}`, {
        method: "POST",
        headers: {
          "X-Orbiter-Token": accessToken,
          "Content-Type": "application/json", // Fixed casing
          Source: "web-app",
        },
        body: JSON.stringify(payload),   
      });
  
      // Always get the response text first to avoid JSON parsing errors
      const responseText = await response.text();
      console.log('Raw response:', responseText);
  
      // Check if the response is ok
      if (!response.ok) {
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: responseText
        });
        
        if (response.status === 404) {
          throw new Error(`Function deployment endpoint not found for site ${siteId}.`);
        } else if (response.status === 400) {
          throw new Error(`Bad request: ${responseText}`);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText} - ${responseText}`);
        }
      }
  
      // Try to parse JSON only if we have a response body
      if (!responseText.trim()) {
        throw new Error('Server returned empty response');
      }
  
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('JSON Parse Error:', jsonError);
        console.error('Response that failed to parse:', responseText);
        throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 100)}...`);
      }
  
      console.log('Function update response:', data);
      
      if (data.data) {
        setFunctionDetails(data.data);
      }
  
      // Show success message
      toast({
        title: "Function updated successfully",
        description: "Your serverless function has been deployed.",
      });
      
      return data;
    } catch (error) {
      console.error('Error updating function:', error);
      
      // Show user-friendly error message
      toast({
        title: "Failed to update function",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      
      throw error; // Re-throw so the calling component can handle it
    }
  };

  return (
    <Dialog>
      <Card className="min-w-[335px] flex flex-row items-center">
        <CardContent className="flex items-start gap-1 justify-between w-full pt-6">
          <div className="flex flex-col">
            <a
              href={`https://${
                site.custom_domain ? site.custom_domain : site.domain
              }`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 font-bold"
            >
              <span className="flex group-hover:underline">
                {site.custom_domain
                  ? site.custom_domain
                  : truncate(site.domain)}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="inline h-4 w-4 opacity-0 group-hover:opacity-100 ml-1"
                >
                  <title>Link Out</title>
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13.5 10.5L21 3m-5 0h5v5m0 6v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"
                  />
                </svg>
              </span>
            </a>
            <p className="text-gray-500 text-sm">
              Updated: {new Date(site.updated_at).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-1">
            <HoverCard>
              <HoverCardTrigger>
                {isSiteReady ? (
                  <CircleCheck className="text-green-500" />
                ) : (
                  <Loader2 className="animate-spin text-yellow-400" />
                )}
              </HoverCardTrigger>
              <HoverCardContent className="w-full">
                <p className="text-sm">
                  {isSiteReady ? "DNS Configured" : "DNS Pending"}
                </p>
                {functionDetails && (
                  <p className="text-sm mt-2">
                    Function: {functionDetails.scriptName}
                  </p>
                )}
              </HoverCardContent>
            </HoverCard>
            <Popover>
              <PopoverTrigger>
                <Settings />
              </PopoverTrigger>
              <PopoverContent className="w-full flex flex-col items-start gap-2">
                <UpdateSiteForm
                  loading={loading}
                  updateSite={updateSite}
                  siteId={site.id}
                />              
                {planDetails.planName !== "free" ? (
                  <CustomDomainForm
                    loading={loading}
                    updateSite={updateSite}
                    siteId={site.id}
                    customDomain={customDomain}
                    setCustomDomain={setCustomDomain}
                    addCustomDomain={addCustomDomain}
                    siteInfo={site}
                    deleteCustomDomain={deleteCustomDomain}
                  />
                ) : (
                  <UpsellModal feature="custom domain" />
                )}
                {planDetails.planName !== "free" ? (
                  <UpdateFunctionForm 
                    updateFunction={updateFunction} 
                    siteId={site.id} 
                    loading={loading || functionLoading} 
                    functionDetails={functionDetails}
                    onLoadFunctionDetails={loadFunctionDetails}
                    functionLoaded={functionLoaded}
                  />
                ) : (
                  <UpsellModal feature="functions" />
                )}
                {planDetails.planName !== "free" ? (
                  <UpdateVersionForm
                    loading={loading || versionsLoading}
                    updateSite={updateSite}
                    siteId={site.id}
                    versions={versions}
                    siteDomain={site.domain}
                    onLoadVersions={loadVersions}
                    versionsLoaded={versionsLoaded}
                  />
                ) : (
                  <UpsellModal feature="versions" />
                )}
                {planDetails.planName === "orbit" ? (
                  <Link to={`/analytics/${site.id}`}>
                    <Button variant="ghost" className="h-7 flex items-center">
                      <ChartAreaIcon /> <span>Analytics</span>
                    </Button>
                  </Link>
                ) : (
                  <UpsellModal feature="analytics" />
                )}
                {window.ethereum && (
                  <AddEnsForm loading={loading} siteId={site.id} />
                )}
                <SiteInfoModal {...site} />
                <DialogTrigger asChild>
                  <Button className="h-7 w-full justify-start" variant="ghost">
                    <Trash /> {deleting ? "Deleting..." : "Delete"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Are you sure you want to delete?</DialogTitle>
                    <DialogDescription>
                      Websites cannot be restored after they are deleted. Make
                      sure you have your content backed up!
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleDelete(e, site.id)}
                      type="submit"
                      variant="destructive"
                      className="w-full"
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>
    </Dialog>
  );
};