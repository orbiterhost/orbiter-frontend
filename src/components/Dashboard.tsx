import { CreateSiteForm } from "./create-site-form";
import { SiteCard } from "./site-card";
import { PlanDetails } from "@/App";
import { useToast } from "@/hooks/use-toast";
import { getAccessToken } from "@/utils/auth";
import { Organization, Site } from "@/utils/types";
import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { RocketIcon } from "lucide-react";

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
  let maxSites: any;

  useEffect(() => {
    setSelectedTemplateCid("");
  }, [])

  const { toast } = useToast();

  if (props.planDetails.planName === "launch") {
    maxSites = "5";
  } else if (props.planDetails.planName === "orbit") {
    maxSites = <span className="text-xl">∞</span>;
  } else {
    maxSites = "2";
  }

  const handleAddCustomDomain = async (
    customDomain: string,
    siteId: string
  ) => {
    try {
      const accessToken = await getAccessToken();

      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/sites/${siteId}/custom_domain`,
        {
          method: "POST",
          //  @ts-ignore
          headers: {
            "Content-Type": "application/json",
            "X-Orbiter-Token": accessToken,
          },
          body: JSON.stringify({
            customDomain,
          }),
        }
      );

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

      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/sites/${siteId}/custom_domain`,
        {
          method: "DELETE",
          //  @ts-ignore
          headers: {
            "Content-Type": "application/json",
            "X-Orbiter-Token": accessToken,
          },
          body: JSON.stringify({
            customDomain,
          }),
        }
      );

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
      <div className="sm:w-full w-[350px] mx-auto flex justify-end items-center sm:gap-4 gap-8 px-6 lg:px-0">
        {props.sites.length > 0 && (
          <p className="font-bold">
            Sites: {props.sites.length} / {maxSites}
          </p>
        )}
        <CreateSiteForm {...props} />
        <Button className="hidden sm:flex" asChild>
          <a href="https://voyager.orbiter.host" target="_blank">
            <RocketIcon />
            Voyager</a>
        </Button>
      </div>
      {!props.initialLoading && props.sites.length === 0 && (
        <>
          <div className="w-full flex justify-end px-24">
            <p>No sites 🥸 upload one now!</p>
            <svg
              width="88"
              height="165"
              viewBox="0 0 88 165"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M81.6025 1.81033C80.0047 2.69652 75.6006 5.48933 71.8276 8.04047C59.9043 16.0967 54.7483 19.4132 47.2156 23.9515C43.1741 26.3684 39.6159 28.5839 39.2936 28.839C38.4074 29.6178 38.6759 31.4439 39.777 32.2629C40.596 32.8537 40.784 32.8806 42.0596 32.518C43.8588 31.9944 51.1901 28.3154 55.8493 25.6434C57.8365 24.5289 59.5686 23.5219 59.7297 23.4279C59.8909 23.3339 58.2259 25.3211 56.0104 27.7917C43.5634 41.9036 35.0506 54.2967 27.0077 70.0332C19.9048 83.9571 15.3127 95.1955 10.0224 111.684C6.07482 123.943 3.92648 133.879 1.4156 150.931C-0.0479595 160.908 -0.276188 163.674 0.274325 164.332C0.865119 165.043 1.48273 164.922 2.12724 163.969C2.6509 163.15 2.65091 163.083 2.1004 162.693C1.54988 162.264 1.54989 162.035 2.23468 157.255C3.12087 150.703 5.33634 137.639 6.34338 132.778C7.45783 127.595 11.4994 113.577 13.97 106.313C23.8524 77.7269 36.2054 55.2366 52.9222 35.5794C59.4075 27.9528 71.7336 15.2374 73.6134 14.2304C74.2982 13.8678 74.2982 13.9081 73.5194 15.4388C71.9216 18.5942 68.7662 26.2341 67.8129 29.2284C66.6984 32.6791 65.0737 39.9566 63.4759 48.3619C62.5897 52.954 62.4689 54.1356 62.7911 54.8204C63.5028 56.3914 66.0136 56.6196 66.9267 55.1829C67.1549 54.8204 67.8397 52.1484 68.3902 49.2884C71.9484 31.2693 73.5463 26.543 80.4881 13.0085C82.2471 9.51746 83.7106 6.52321 83.7106 6.32181C83.7106 6.09355 84.5968 5.38191 85.671 4.72398C87.8596 3.35442 88.3698 2.37426 87.4971 1.04498C86.6512 -0.257445 85.0533 -0.0694435 81.6025 1.82377V1.81033Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="w-3/4 md:w-4/5 lg:w-full m-auto flex flex-col items-center gap-4">
            <h3 className="text-2xl">Need a jumpstart? Check out <span className="font-bold uppercase">Voyager</span></h3>
            <a href="https://voyager.orbiter.host" target="_blank">
              <Card className="overflow-hidden max-w-xl">
                <img src="https://cdn.orbiter.host/ipfs/bafkreiajqerzvsfzjt4pumsqh3ntairipitvc7ozeqwrucrnaiqhyzaahu" alt="voyager cover" />
              </Card>
            </a>
            <Button asChild>
              <a href="https://voyager.orbiter.host" target="_blank">Launch</a>
            </Button>
            {
              selectedTemplateCid &&
              <CreateSiteForm {...props} templateCid={selectedTemplateCid} setSelectedTemplateCid={setSelectedTemplateCid} />
            }
            <div className="mt-8">
              <p>Alternatively deploy your site with our <a href="https://docs.orbiter.host/cli" className="underline" target="_blank">CLI</a> + <a href="/api-keys" className="underline">API Key!</a></p>
              <pre className="font-mono my-2 p-4 bg-gray-100 rounded-md text-sm max-w-md">
                <code>
                  npm i -g orbiter-cli <br />

                  orbiter auth <br />

                  orbiter deploy
                </code>
              </pre>
            </div>
          </div>
        </>
      )}
      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 mx-auto lg:mx-0 gap-4">
        {[...props.sites].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).map((site) => (

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
