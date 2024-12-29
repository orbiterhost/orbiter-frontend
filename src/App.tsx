import "./index.css";
import { useState, useEffect } from "react";
import { getAccessToken, supabase } from "./utils/auth";
import { Session } from "@supabase/supabase-js";
import Main from "./components/Main";
import {
	createOrganizationAndMembership,
	getOrgMemebershipsForUser,
	loadSites,
} from "./utils/db";
import { uploadSite } from "./utils/pinata";
import { LoginForm } from "./components/login-form";
import { GalleryVerticalEnd } from "lucide-react";
import authHero from "./assets/auth-hero.jpg";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

export default function App() {
	const [userSession, setSession] = useState<Session | null>(null);
	const [organizations, setOrganizations] = useState<any[]>([]);
	const [sites, setSites] = useState<any[]>([]);
	const [loading, setLoading] = useState(false);
	const [authLoading, setAuthLoading] = useState(true);
	const { toast } = useToast();

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
			setAuthLoading(false);
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
			setAuthLoading(false);
		});

		return () => subscription.unsubscribe();
	}, []);

	useEffect(() => {
		const loadOrgs = async () => {
			const memberships = await getOrgMemebershipsForUser();
			if (memberships && memberships?.length === 0) {
				//  Create org and membership for user because this is a new user
				await createOrganizationAndMembership();
				const memberships = await getOrgMemebershipsForUser();
				setOrganizations(memberships || []);
				handleLoadSites(memberships || []);
			} else if (memberships) {
				setOrganizations(memberships);
				//  Load Sites
				handleLoadSites(memberships);
			}
		};
		if (userSession) {
			loadOrgs();
		}
	}, [userSession]);

	const createSite = async (files: any, subdomain: string) => {
		setLoading(true);
		try {
			const accessToken = await getAccessToken();

			//  Generate one-time use key
			//  Upload site
			const cid = await uploadSite(files);
			console.log(cid);
			//  Create subdomain and contract
			await fetch(`${import.meta.env.VITE_BASE_URL}/sites`, {
				method: "POST",
				//  @ts-ignore
				headers: {
					"Content-Type": "application/json",
					"X-Orbiter-Token": accessToken,
				},
				body: JSON.stringify({
					orgId: organizations[0].organizations.id,
					cid: cid,
					subdomain: subdomain,
				}),
			});

			handleLoadSites(organizations);
			setLoading(false);
			toast({
				title: "Site created!",
			});
		} catch (error) {
			console.log(error);
			//	@TODO add error toast
			setLoading(false);
			toast({
				title: "Problem creating site",
				variant: "destructive",
			});
		}
	};

	const updateSite = async (files: any, siteId: string) => {
		setLoading(true);
		try {
			const accessToken = await getAccessToken();

			//  Generate one-time use key
			//  Upload site
			const cid = await uploadSite(files);
			console.log(cid);
			//  Create subdomain and contract
			await fetch(`${import.meta.env.VITE_BASE_URL}/sites/${siteId}`, {
				method: "PUT",
				//  @ts-ignore
				headers: {
					"Content-Type": "application/json",
					"X-Orbiter-Token": accessToken,
				},
				body: JSON.stringify({
					cid,
				}),
			});

			handleLoadSites(organizations);
			toast({
				title: "Site updated!",
			});
			setLoading(false);
		} catch (error) {
			console.log(error);
			toast({
				title: "Problem updating site",
				variant: "destructive",
			});
			setLoading(false);
		}
	};

	const handleLoadSites = async (membershipData: any[]) => {
		const sites = await loadSites(membershipData[0].organizations.id);
		setSites(sites?.data || []);
	};

	if (authLoading) {
		return (
			<div className="h-screen w-full flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (!userSession) {
		return (
			<div className="grid min-h-svh lg:grid-cols-2">
				<div className="flex flex-col gap-4 p-6 md:p-10">
					<div className="flex justify-center gap-2 md:justify-start">
						<a href="#" className="flex items-center gap-2 font-medium">
							<div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
								<GalleryVerticalEnd className="size-4" />
							</div>
							Orbiter
						</a>
					</div>
					<div className="flex flex-1 items-center justify-center">
						<div className="w-full max-w-xs">
							<LoginForm />
						</div>
					</div>
				</div>
				<div className="relative hidden bg-muted lg:block">
					<img
						src={authHero}
						alt="Heo"
						className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen w-full mx-auto">
			{organizations?.length > 0 && (
				<Main
					organizations={organizations}
					sites={sites}
					createSite={createSite}
					updateSite={updateSite}
					loading={loading}
				/>
			)}
			<Toaster />
		</div>
	);
}
