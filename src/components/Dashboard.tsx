import { CreateSiteForm } from "./create-site-form";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { UpdateSiteForm } from "./update-site-form";

type DashboardProps = {
	organization: any;
	sites: Site[];
	createSite: any;
	updateSite: any;
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
		<div className="max-w-screen-lg w-full mx-auto flex flex-col items-start justify-center gap-2">
			<div className="w-full flex justify-end">
				<CreateSiteForm {...props} />
			</div>
			<div className="grid grid-cols-3 gap-4">
				{props.sites.map((site: Site) => (
					<Card key={site.id}>
						<CardHeader>
							<CardTitle>
								<a
									href={`http://${site.domain}`}
									target="_blank"
									rel="noopener noreferrer"
									className="group flex items-center gap-2"
								>
									<span className="group-hover:underline">
										{`${site.domain}`}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											className="inline h-4 w-4 opacity-0 group-hover:opacity-100 ml-1"
										>
											<title>Link Out</title>
											<path
												fill="none"
												stroke="currentColor"
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M13.5 10.5L21 3m-5 0h5v5m0 6v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"
											/>
										</svg>
									</span>
								</a>
							</CardTitle>
							<CardDescription>
								Updated: {new Date(site.updated_at).toLocaleString()}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<UpdateSiteForm updateSite={props.updateSite} siteId={site.id} />
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
};

export default Dashboard;
