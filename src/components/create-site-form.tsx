import { useCallback, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { CustomFileDropzone } from "./ui/dropzone";
import { Label } from "./ui/label";

type DashboardProps = {
	organization: any;
	sites: any[];
	createSite: any;
	updateSite: any;
};

export function CreateSiteForm(props: DashboardProps) {
	const [files, setFiles] = useState<File[]>([]);
	const [domain, setDomain] = useState<string>();

	async function submit() {
		if (!files.length) {
			console.log("Select a file!");
			return;
		}

		if (files.length === 1) {
			props.createSite(files[0], domain);
		} else {
			props.createSite(files, domain);
		}
	}

	return (
		<Dialog>
			<DialogTrigger>
				<Button>Create Site</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Upload a Site</DialogTitle>
					<DialogDescription>
						Choose a file or a folder to upload, as well as a subdomain for the
						site
					</DialogDescription>
				</DialogHeader>
				<CustomFileDropzone files={files} setFiles={setFiles} />
				<Label>Subdomain</Label>
				<Input
					value={domain}
					onChange={(e) => setDomain(e.target.value)}
					placeholder="cool-site"
					type="text"
				/>
				<Button onClick={submit}>Create</Button>
			</DialogContent>
		</Dialog>
	);
}
