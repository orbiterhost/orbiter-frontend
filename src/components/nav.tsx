import { useEffect, useState } from "react";
import { signOut, getUserLocal } from "../utils/auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import type { User } from "@supabase/supabase-js";
import { Combobox } from "./ui/comobobox";

type NavProps = {
	organizations: {
		id: number;
		created_at: string;
		role: string;
		user_id: string;
		organization_id: string;
		organizations: {
			id: string;
			name: string;
			created_at: string;
		};
	}[];
};

export function Nav({ organizations }: NavProps) {
	const [user, setUser] = useState<User>();

	const orgsData = organizations.map((org) => ({
		value: org.organization_id,
		label: org.organizations.name,
	}));

	useEffect(() => {
		async function fetchUser() {
			const session = await getUserLocal();
			if (session?.user) {
				setUser(session?.user);
			}
		}
		fetchUser();
	}, []);

	return (
		<div className="w-full flex gap-6 justify-end items-center py-4 px-8">
			<Popover>
				{organizations.length > 1 && <Combobox organizations={orgsData} />}
				<PopoverTrigger>
					<Avatar>
						<AvatarImage src={user?.user_metadata.avatar_url} />
						<AvatarFallback>{user?.email?.[0] || "U"}</AvatarFallback>
					</Avatar>
				</PopoverTrigger>
				<PopoverContent className="max-w-[125px]">
					<Button onClick={signOut}>Sign out</Button>
				</PopoverContent>
			</Popover>
		</div>
	);
}
