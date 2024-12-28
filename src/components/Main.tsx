import Dashboard from "./Dashboard";
import { Nav } from "./nav";

type MainProps = {
	organizations: any[];
	sites: any[];
	createSite: any;
	updateSite: any;
};

const Main = (props: MainProps) => {
	return (
		<div className="min-h-screen w-full flex flex-col">
			<Nav organizations={props.organizations} />
			<div className="w-full border-gray-400 border-b-2"></div>
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
