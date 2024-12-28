import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { CustomFileDropzone } from "./ui/dropzone";

type UpdateSiteProps = {
	updateSite: any;
	siteId: string;
};

export function UpdateSiteForm({ updateSite, siteId }: UpdateSiteProps) {
	const [files, setFiles] = useState<File[]>([]);

	async function submit() {
		if (!files.length) {
			console.log("Select a file!");
			return;
		}

		if (files.length === 1) {
			// Single file selected
			const file = files[0];
			updateSite(file, siteId);
		} else {
			// Multiple files selected (directory)
			updateSite(files, siteId);
		}
	}

	return (
		<Dialog>
			<DialogTrigger>
				<Button>Update Site</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Update Site</DialogTitle>
					<DialogDescription>
						Choose a file or a folder to upload, as well as a subdomain for the
						site
					</DialogDescription>
				</DialogHeader>
				<CustomFileDropzone files={files} setFiles={setFiles} />
				<Button onClick={submit}>Update</Button>
			</DialogContent>
		</Dialog>
	);
}
