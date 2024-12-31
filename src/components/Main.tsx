import Dashboard from "./Dashboard";
import { Nav } from "./nav";
import { Separator } from "@/components/ui/separator";

type MainProps = {
	organizations: any[];
	sites: any[];
	createSite: any;
	updateSite: any;
	loading: boolean;
	deleteSite: (siteId: string) => Promise<void>;
	createSiteFromCid: (cid: string, subdomain: string) => Promise<void>;
};

const Main = (props: MainProps) => {
	return (
		<div className="min-h-screen w-full flex flex-col gap-2">
			<Nav organizations={props.organizations} />
			<Separator />
			{props.organizations.length > 0 && (
				<Dashboard
					updateSite={props.updateSite}
					organization={props.organizations[0]}
					sites={props.sites}
					createSite={props.createSite}
					loading={props.loading}
					deleteSite={props.deleteSite}
					createSiteFromCid={props.createSiteFromCid}
				/>
			)}
		</div>
	);
};

export default Main;
