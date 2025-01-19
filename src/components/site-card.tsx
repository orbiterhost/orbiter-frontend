import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
} from "./ui/card";
import { UpdateSiteForm } from "./update-site-form";
import { CircleCheck, Loader2, Settings, Trash } from "lucide-react";
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
  const [versions, setVersions] = useState<SiteVersion[] | undefined>([]);

  const { toast } = useToast();

  console.log({ plan: planDetails.planName });

  useEffect(() => {
    async function getVersions() {
      const accessToken = await getAccessToken();
      console.log("Getting versions");
      try {
        const request = await fetch(
          `${import.meta.env.VITE_BASE_URL}/sites/${site.domain}/versions`,
          {
            method: "GET",
            headers: {
              "X-Orbiter-Token": `${accessToken}`,
              "Content-Type": "Application/json",
            },
          }
        );
        const response = await request.json();
        setVersions(response.data);
      } catch (e) {
        console.log(e);
      }
    }
    getVersions();
  }, [site.domain]);

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
      } catch (e) {
        setIsSiteReady(false);
        return false;
      }
    };

    const checkCustomDomainStatus = async () => {
      console.log("Checking custom domain status");
      //  Check status of custom domain DNS
      const accessToken = await getAccessToken();

      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/sites/${site.id}/verify_domain`,
        {
          method: "POST",
          //  @ts-ignore
          headers: {
            "X-Orbiter-Token": accessToken,
            "Content-Type": "Application/json",
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

  const handleDelete = async (e: any, siteId: string) => {
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

  return (
    <Dialog>
      <Card className="min-w-[335px] flex flex-row items-center">
        <CardContent className="flex items-start gap-1 justify-between w-full pt-6">
          <div className="flex flex-col">
            <a
              href={`https://${site.custom_domain ? site.custom_domain : site.domain
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
              </HoverCardContent>
            </HoverCard>
            <Popover>
              <PopoverTrigger>
                <Settings />
              </PopoverTrigger>
              <PopoverContent className="w-full flex flex-col items-start gap-2">
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
                {planDetails.planName !== "free" && versions ? (
                  <UpdateVersionForm
                    loading={loading}
                    updateSite={updateSite}
                    siteId={site.id}
                    versions={versions}
                    siteDomain={site.domain}
                  />
                ) : (
                  <UpsellModal feature="versions" />
                )}
                <UpdateSiteForm
                  loading={loading}
                  updateSite={updateSite}
                  siteId={site.id}
                />
                <SiteInfoModal {...site} />
                <DialogTrigger asChild>
                  <Button
                    className="h-7 w-full justify-start"
                    variant="ghost"
                  >
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
                      onClick={(e: any) => handleDelete(e, site.id)}
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
