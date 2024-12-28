import { useRef } from "react";
import { Button } from "./ui/button";
import { CreateSiteForm } from "./create-site-form";

type DashboardProps = {
	organization: any;
	sites: any[];
	createSite: any;
	updateSite: any;
};

const Dashboard = (props: DashboardProps) => {
	const updateFileInputRef = useRef<HTMLInputElement>(null);

	const handleUpdateFileSelection = async (
		event: React.ChangeEvent<HTMLInputElement>,
		siteId: string,
	) => {
		const files = event.target.files;
		if (!files || files.length === 0) return;

		if (files.length === 1) {
			// Single file selected
			const file = files[0];
			props.updateSite(file, siteId);
		} else {
			// Multiple files selected (directory)
			props.updateSite(files, siteId);
		}
	};

	const handleUpdateClick = () => {
		updateFileInputRef.current?.click();
	};
	return (
		<div className="max-w-screen-lg w-full mx-auto flex flex-col items-start justify-center">
			<div>
				<h1>Sites</h1>
				<CreateSiteForm {...props} />
				{props.sites.map((s: any) => {
					return (
						<div key={s.id}>
							<p>{s.name}</p>
							<a
								href={`http://${s.domain}`}
								target="_blank"
								rel="noopener noreferrer"
							>{`http://${s.domain}`}</a>
							<button onClick={handleUpdateClick}>Update site</button>
							<input
								type="file"
								ref={updateFileInputRef}
								onChange={(e) => handleUpdateFileSelection(e, s.id)}
								style={{ visibility: "hidden" }}
								//    @ts-ignore
								webkitdirectory=""
								directory=""
								multiple
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default Dashboard;
