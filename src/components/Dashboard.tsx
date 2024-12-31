import { CreateSiteForm } from "./create-site-form";
import { SiteCard } from "./site-card";

type DashboardProps = {
	organization: any;
	sites: Site[];
	createSite: any;
	updateSite: any;
	loading: boolean;
	deleteSite: (siteId: string) => Promise<void>;
};

type Site = {
	id: string;
	created_at: string;
	organization_id: string;
	cid: string;
	domain: string;
	site_contract: string;
	updated_at: string;
	deployed_by: string | null;	
};

const Dashboard = (props: DashboardProps) => {
	return (
		<div className="sm:max-w-screen-lg max-w-screen-sm w-full mx-auto flex flex-col items-start justify-center gap-2">
			<div className="w-full flex justify-end px-6 lg:px-0">
				<CreateSiteForm {...props} />
			</div>
			<div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 mx-auto lg:mx-0 gap-4">
				{props.sites.map((site) => (
					<SiteCard
						key={site.id}
						site={site}
						loading={props.loading}
						updateSite={props.updateSite}
						deleteSite={props.deleteSite}
					/>
				))}
			</div>
		</div>
	);
};

export default Dashboard;
