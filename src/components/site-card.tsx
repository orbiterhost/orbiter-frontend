import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { UpdateSiteForm } from "./update-site-form";
import { CircleCheck, Loader2 } from "lucide-react";

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

type SiteCardProps = {
	site: Site;
	loading: boolean;
	updateSite: (files: File[], siteId: string) => Promise<void>;
};

export const SiteCard = ({ site, loading, updateSite }: SiteCardProps) => {
	const [isSiteReady, setIsSiteReady] = useState(false);

	useEffect(() => {
		const checkSiteStatus = async () => {
			try {
				const response = await fetch(`http://${site.domain}`, {
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

		const interval = setInterval(async () => {
			const isReady = await checkSiteStatus();
			if (isReady) {
				clearInterval(interval);
			}
		}, 1000);

		checkSiteStatus();

		return () => clearInterval(interval);
	}, [site.domain]);

	return (
		<Card className="min-w-[335px]">
			<CardHeader className="flex flex-row items-center gap-2">
				{isSiteReady ? (
					<CircleCheck className="text-green-500" />
				) : (
					<Loader2 className="animate-spin text-yellow-400" />
				)}
				<div className="flex flex-col">
					<CardTitle>
						<a
							href={`http://${site.domain}`}
							target="_blank"
							rel="noopener noreferrer"
							className="group flex items-center gap-2"
						>
							<span className="group-hover:underline">
								{site.domain}
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
			<CardContent>
				<UpdateSiteForm
					loading={loading}
					updateSite={updateSite}
					siteId={site.id}
				/>
			</CardContent>
		</Card>
	);
};
