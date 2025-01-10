import { useEffect, useState } from "react";
import { signOut, getUserLocal } from "../utils/auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import type { Session, User } from "@supabase/supabase-js";
import { Combobox } from "./ui/comobobox";
import logo from "../assets/black_logo.png";
import { NavLink } from "react-router";
import { ChartAreaIcon, DollarSign, LayoutGrid, LogOut } from "lucide-react";
import { AUTHORIZED_IDS } from "./Main";

type NavProps = {
  session: Session;
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

export function Nav({ organizations, session }: NavProps) {
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
    <div className="w-full flex gap-6 justify-between items-center py-6 px-10">
      <Popover>
        <div className="flex items-center gap-4">
          <NavLink to="/" end>
            <img className="w-24" src={logo} alt="logo" />
          </NavLink>
          {organizations.length > 1 && <Combobox organizations={orgsData} />}
        </div>
        <PopoverTrigger>
          <Avatar>
            <AvatarImage src={user?.user_metadata.avatar_url} />
            <AvatarFallback>{user?.email?.[0] || "U"}</AvatarFallback>
          </Avatar>
        </PopoverTrigger>
        <PopoverContent className="mr-8 flex flex-col w-48">
          <NavLink to="/" end className="w-full">
            <Button variant="ghost" className="w-full justify-start">
              <LayoutGrid />
              Dashboard
            </Button>
          </NavLink>
          <NavLink to="/billing" end className="w-full">
            <Button variant="ghost" className="w-full justify-start">
              <DollarSign />
              Billing
            </Button>
          </NavLink>
          {AUTHORIZED_IDS.includes(session?.user?.id) && (
            <NavLink to="/admin" end className="w-full">
              <Button variant="ghost" className="w-full justify-start">
                <ChartAreaIcon />
                Admin
              </Button>
            </NavLink>
          )}
          <Button
            variant="ghost"
            onClick={signOut}
            className="w-full justify-start"
          >
            <LogOut />
            Sign out
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
