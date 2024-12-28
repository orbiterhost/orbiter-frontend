import Dashboard from "./Dashboard";
import { Nav } from "./nav";
import { Separator } from "@/components/ui/separator";

type MainProps = {
	organizations: any[];
	sites: any[];
	createSite: any;
	updateSite: any;
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
				/>
			)}
		</div>
	);
};

export default Main;
