import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { UpdateSiteForm } from "./update-site-form";
import { CircleCheck, Loader2, Settings } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";

type Site = {
	id: string;
	created_at: string;
	organization_id: string;
	cid: string;
	domain: string;
	site_contract: string;
	updated_at: string;
	deployed_by: string | null;
	custom_domain?: string;
	domain_ownership_verified?: boolean;
	ssl_issued?: boolean;
};

type SiteCardProps = {
	site: Site;
	loading: boolean;
	updateSite: (files: File[], siteId: string) => Promise<void>;
	deleteSite: (siteId: string) => Promise<void>;
};

export const SiteCard = ({ site, loading, updateSite, deleteSite }: SiteCardProps) => {
	const [isSiteReady, setIsSiteReady] = useState(false);
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		const checkSiteStatus = async () => {
			try {
				const response = await fetch(`https://${site.domain}`, {
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

	const handleDelete = async (e: any, siteId: string) => {
		try {
			setDeleting(true);
			await deleteSite(siteId);
			setDeleting(false);
		} catch (error) {
			console.log(error);
			setDeleting(false);			
		}
	}

	return (
		<Card className="min-w-[335px] flex flex-row">
			<CardHeader className="flex items-center gap-2">
				<div className="flex flex-col">
					<CardTitle className="tracking-tighter">
						<a
							href={`https://${site.custom_domain ? site.custom_domain : site.domain}`}
							target="_blank"
							rel="noopener noreferrer"
							className="group flex items-center gap-2"
						>
							<span className="group-hover:underline">
								{site.custom_domain ? site.custom_domain : site.domain}
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
			<CardContent className="flex items-center gap-2 justify-end">
				<HoverCard>
					<HoverCardTrigger>
						{isSiteReady ? (
							<CircleCheck className="text-green-500" />
						) : (
							<Loader2 className="animate-spin text-yellow-400" />
						)}
					</HoverCardTrigger>
					<HoverCardContent className="w-full">
						<p className="text-sm">
							{isSiteReady ? "DNS Configured" : "DNS Pending"}
						</p>
					</HoverCardContent>
				</HoverCard>
				<Popover>
					<PopoverTrigger>
						<Settings />
					</PopoverTrigger>
					<PopoverContent className="w-full flex flex-col gap-2">
						<UpdateSiteForm
							loading={loading}
							updateSite={updateSite}
							siteId={site.id}
						/>
						<Button onClick={(e: any) => handleDelete(e, site.id)} className="h-7" variant="destructive">
							{deleting ? "Deleting..." : "Delete"}
						</Button>
					</PopoverContent>
				</Popover>
			</CardContent>
		</Card>
	);
};
