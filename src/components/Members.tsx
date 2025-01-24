import { PlanDetails } from "@/App";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { getAccessToken } from "@/utils/auth";
import { Membership, Organization } from "@/utils/types";
import { NavLink } from "react-router";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { EllipsisVerticalIcon } from "lucide-react";
import { InviteUserForm } from "./invite-user-form";
import { Session } from "@supabase/supabase-js";

type MembersProps = {
  planDetails: PlanDetails;
  organization: Organization | null;
  userSession: Session;
  loadMembers: () => Promise<void>;
  members: Membership[];
};

const Members = (props: MembersProps) => {
  let { planDetails, userSession } = props;

  const removeMember = async (member: Membership) => {
    try {
      const accessToken = await getAccessToken();

      await fetch(
        `${import.meta.env.VITE_BASE_URL}/organizations/${
          props?.organization?.id
        }/members/${member.user?.id}`,
        {
          method: "DELETE",
          //  @ts-ignore
          headers: {
            "X-Orbiter-Token": accessToken,
          },
        }
      );

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
        <div className="w-full mt-10">
          <div className="w-full flex justify-end items-center gap-12 px-6 lg:px-0">
            <p className="font-bold">
              Members: {props.members.length} / {getPlanLimits()}
            </p>
            <InviteUserForm
              organization={props.organization}
              loadMembers={props.loadMembers}
            />
          </div>
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
                    {person.created_at ? (
                      <p className="mt-1 text-xs/5 text-gray-500">
                        Added{" "}
                        <time dateTime={person.created_at}>
                          {new Date(person.created_at).toLocaleString()}
                        </time>
                      </p>
                    ) : (
                      <div className="mt-1 flex items-center gap-x-1.5">
                        <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                          <div className="size-1.5 rounded-full bg-emerald-500" />
                        </div>
                        <p className="text-xs/5 text-gray-500">Online</p>
                      </div>
                    )}
                  </div>
                  {person.role !== "OWNER" &&
                    person?.user?.id !== userSession.user.id && (
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
                    )}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Members;
