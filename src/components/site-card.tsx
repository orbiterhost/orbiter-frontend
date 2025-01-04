import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { UpdateSiteForm } from "./update-site-form";
import { CircleCheck, Loader2, Settings } from "lucide-react";
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
};

export const SiteCard = ({
  site,
  loading,
  updateSite,
  deleteSite,
  handleAddCustomDomain,
  deleteCustomDomain,
}: SiteCardProps) => {
  const [isSiteReady, setIsSiteReady] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [customDomain, setCustomDomain] = useState("");

  const { toast } = useToast();

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
    if (text.length > 24) {
      return text.slice(0, 24) + "...";
    }
    return text;
  }

  const addCustomDomain = async (domain?: string) => {
    const domainToUse = domain ? domain : customDomain;
    try {
      const data = await handleAddCustomDomain(domainToUse, site.id);
      toast({
        title: "Custom domain ready",
      });

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
    <Card className="min-w-[335px] flex flex-row">
      <CardHeader className="flex items-center gap-2">
        <div className="flex flex-col">
          <CardTitle className="tracking-tighter">
            <a
              href={`https://${
                site.custom_domain ? site.custom_domain : site.domain
              }`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2"
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
          </CardTitle>
          <CardDescription>
            Updated: {new Date(site.updated_at).toLocaleString()}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex items-center gap-1 justify-end">
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
          <PopoverContent className="w-full flex flex-col gap-2">
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
            <UpdateSiteForm
              loading={loading}
              updateSite={updateSite}
              siteId={site.id}
            />
            <Button
              onClick={(e: any) => handleDelete(e, site.id)}
              className="h-7"
              variant="destructive"
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </PopoverContent>
        </Popover>
      </CardContent>
    </Card>
  );
};
