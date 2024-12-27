import { useEffect, useState } from "react";
import { signOut, getUserLocal } from "../utils/auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import type { User } from "@supabase/supabase-js";

type NavProps = {
	organizations: any[];
};

export function Nav({ organizations }: NavProps) {
	const [user, setUser] = useState<User>();

	useEffect(() => {
		async function fetchUser() {
			const session = await getUserLocal();
			if (session?.user) {
				setUser(session?.user);
				console.log(session?.user);
			}
		}
		fetchUser();
	}, []);

	return (
		<div className="w-full flex justify-end items-center p-4">
			<Popover>
				<PopoverTrigger>
					<Avatar>
						<AvatarImage src={user?.user_metadata.avatar_url} />
						<AvatarFallback>{user?.email?.[0] || "U"}</AvatarFallback>
					</Avatar>
				</PopoverTrigger>
				<PopoverContent className="max-w-[125px]">
					<Button onClick={signOut}>Sign out</Button>
					{organizations.length > 1 && (
						<div>
							<p>Org switcher</p>
						</div>
					)}
				</PopoverContent>
			</Popover>
		</div>
	);
}
