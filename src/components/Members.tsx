import { PlanDetails } from "@/App";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { getAccessToken } from "@/utils/auth";
import { Invite, Membership, Organization } from "@/utils/types";
import { NavLink } from "react-router";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { EllipsisVerticalIcon } from "lucide-react";
import { InviteUserForm } from "./invite-user-form";
import { Session } from "@supabase/supabase-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useToast } from "@/hooks/use-toast";

type MembersProps = {
  planDetails: PlanDetails;
  organization: Organization | null;
  userSession: Session;
  loadMembers: () => Promise<void>;
  members: Membership[];
  invites: Invite[];
};

const Members = (props: MembersProps) => {
  let { planDetails, userSession } = props;

  const { toast } = useToast();

  const removeMember = async (member: Membership) => {
    try {
      const accessToken = await getAccessToken();

      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/members/${member.user?.id}`,
        {
          method: "DELETE",
          //  @ts-ignore
          headers: {
            "X-Orbiter-Token": accessToken,
            "Source": "web-app"
          },
        }
      );

      if (!res.ok) {
        toast({
          title: "Trouble removing member",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Member removed!",
        });
      }

      props.loadMembers();
    } catch (error) {
      console.log(error);
    }
  };

  const getPlanLimits = () => {
    if (planDetails && planDetails.planName) {
      return planDetails.planName === "launch" ? (
        "3"
      ) : (
        <span className="text-xl">∞</span>
      );
    }
  };

  const deleteInvite = async (invite: Invite) => {
    const accessToken = await getAccessToken();

    const res = await fetch(
      `${import.meta.env.VITE_BASE_URL}/members/invites/${invite.id}`,
      {
        method: "DELETE",
        //  @ts-ignore
        headers: {
          "X-Orbiter-Token": accessToken,
          "Source": "web-app"
        },
      }
    );

    if (!res.ok) {
      toast({
        title: "Trouble removing invite",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Invite removed!",
      });
    }

    props.loadMembers();
  };

  const resendInvite = async (invite: Invite) => {
    const accessToken = await getAccessToken();

    const res = await fetch(
      `${import.meta.env.VITE_BASE_URL}/members/resend_invite/${invite.id}`,
      {
        method: "POST",
        //  @ts-ignore
        headers: {
          "X-Orbiter-Token": accessToken,
          "Source": "web-app"
        },
      }
    );

    if (!res.ok) {
      toast({
        title: "Trouble re-sending invite",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Re-sent invite!",
      });
    }

    props.loadMembers();
  };

  return (
    <div className="sm:max-w-screen-lg max-w-screen-sm w-full mx-auto flex flex-col items-start justify-center">
      {planDetails.planName === "free" ? (
        <div className="w-full mt-20">
          <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-5xl text-center">
            Collaborators are available on paid plans
          </h1>
          <div className="text-center mt-10">
            <NavLink to="/billing">
              <Button>Upgrade now!</Button>
            </NavLink>
          </div>
        </div>
      ) : (
        <div className="w-3/4 m-auto lg:w-full  mt-10">
          <div className="w-full flex justify-end items-center gap-12 px-6 lg:px-0">
            <p className="font-bold">
              Members: {props.members.length} / {getPlanLimits()}
            </p>
            <InviteUserForm
              organization={props.organization}
              loadMembers={props.loadMembers}
            />
          </div>
          <Tabs defaultValue="members" className="w-full">
            <TabsList>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="invites">Invites</TabsTrigger>
            </TabsList>
            <TabsContent value="members">
              <ul role="list" className="divide-y divide-gray-100 mt-8">
                {props.members &&
                  props.members.map((person: Membership) => (
                    <li
                      key={person?.user?.email}
                      className="flex justify-between gap-x-6 py-5"
                    >
                      <div className="flex min-w-0 gap-x-4">
                        <Avatar>
                          <AvatarImage src={person?.user?.avatar} />
                          <AvatarFallback>
                            {person?.user?.email?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-auto">
                          <p className="text-sm/6 font-semibold text-gray-900">
                            {person?.user?.name}
                          </p>
                          <p className="mt-1 truncate text-xs/5 text-gray-500">
                            {person?.user?.email}
                          </p>
                        </div>
                      </div>
                      <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                        <p className="text-sm/6 text-gray-900">{person.role}</p>
                        <p className="mt-1 text-xs/5 text-gray-500">
                          Added{" "}
                          <time dateTime={person.created_at}>
                            {new Date(person.created_at).toLocaleString()}
                          </time>
                        </p>
                      </div>
                      {person.role !== "OWNER" &&
                      person?.user?.id !== userSession.user.id ? (
                        <Popover>
                          <PopoverTrigger>
                            <EllipsisVerticalIcon />
                          </PopoverTrigger>
                          <PopoverContent className="w-full flex flex-col items-start gap-2">
                            <Button
                              variant="link"
                              onClick={() => removeMember(person)}
                            >
                              Remove Member
                            </Button>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <Popover>
                          <PopoverTrigger
                            className="text-gray-300"
                            disabled={true}
                          >
                            <EllipsisVerticalIcon />
                          </PopoverTrigger>
                        </Popover>
                      )}
                    </li>
                  ))}
              </ul>
            </TabsContent>
            <TabsContent value="invites">
              <ul role="list" className="divide-y divide-gray-100 mt-8">
                {props.invites &&
                  props.invites.map((person: Invite) => (
                    <li
                      key={person?.id}
                      className="flex justify-between gap-x-6 py-5"
                    >
                      <div className="flex min-w-0 gap-x-4">
                        <Avatar>
                          <AvatarFallback>
                            {person?.first_name?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-auto">
                          <p className="text-sm/6 font-semibold text-gray-900">
                            {`${person?.first_name} ${person.last_name}`}
                          </p>
                          <p className="mt-1 truncate text-xs/5 text-gray-500">
                            {person?.invite_email}
                          </p>
                        </div>
                      </div>
                      <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                        <p className="text-sm/6 text-gray-900">{person.role}</p>
                        <p className="mt-1 text-xs/5 text-gray-500">
                          Invited{" "}
                          <time dateTime={person.created_at}>
                            {new Date(person.created_at).toLocaleString()}
                          </time>
                        </p>
                      </div>
                      <Popover>
                        <PopoverTrigger>
                          <EllipsisVerticalIcon />
                        </PopoverTrigger>
                        <PopoverContent className="w-full flex flex-col items-start gap-2">
                          <Button
                            variant="link"
                            onClick={() => resendInvite(person)}
                          >
                            Re-send Invite
                          </Button>
                          <Button
                            variant="link"
                            onClick={() => deleteInvite(person)}
                          >
                            Remove Invite
                          </Button>
                        </PopoverContent>
                      </Popover>
                    </li>
                  ))}
              </ul>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default Members;
