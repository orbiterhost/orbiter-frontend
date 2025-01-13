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
import { Membership, Organization } from "@/utils/types";

type NavProps = {
  session: Session;
  organizations: Membership[];
  selectedOrganization: Organization | null;
  setSelectedOrganization: any;
};

export function Nav({ organizations, session, selectedOrganization, setSelectedOrganization }: NavProps) {
  const [user, setUser] = useState<User>();

  const orgsData = organizations.map((org) => org.organizations);

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
          {organizations.length > 1 && <Combobox organizations={orgsData} selectedOrganization={selectedOrganization} setSelectedOrganization={setSelectedOrganization} />}
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
