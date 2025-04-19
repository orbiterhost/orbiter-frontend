import { getAccessToken } from "@/utils/auth";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

const Invites = () => {
  const [inviteId, setInviteId] = useState("");
  const [orgName, setOrgName] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();
  useEffect(() => { 
    //  Load Invite Data    
    if (window.location.search.split("=")[1]) {
      setInviteId(window.location.search.split("=")[1]);
      loadInviteData(window.location.search.split("=")[1]);
    }
  }, []);

  const loadInviteData = async (id: string) => {
    const accessToken = await getAccessToken();
    const res = await fetch(
      `${import.meta.env.VITE_BASE_URL}/members/invites/${id}`,
      {
        //  @ts-ignore
        headers: {
          "X-Orbiter-Token": accessToken,
          "Source": "web-app"
        },
      }
    );

    const data = await res.json();
    const { organization_name, role } = data.data;
    setOrgName(organization_name);
    setRole(role);
  };

  const acceptInvite = async () => {
    try {
      setLoading(true);
      const accessToken = await getAccessToken();
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/members/invites/${inviteId}`,
        {
          method: "POST",
          //  @ts-ignore
          headers: {
            "X-Orbiter-Token": accessToken,
            "Source": "web-app"
          },
          body: null,
        }
      );

      if (!res.ok) {
        console.log({
          status: res.status,
          statusText: res.statusText,
        });
        throw new Error("Trouble accepting invite");
      }
      setLoading(false);
      window.location.href = '/';
    } catch (error) {
      console.log(error);
      toast({
        title: "Trouble accepting invite",
        variant: "destructive",
      });
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col justify-center items-center w-3/4 m-auto">
      <h1 className="text-xl mb-2">
        You've been invited an organization named: {orgName}
      </h1>
      <p className="mb-2">
        If you accept the invite, you will be granted the role of {role}
      </p>
      <Button disabled={loading} onClick={acceptInvite}>{loading ? "Accepting..." : "Accept Invite"}</Button>
    </div>
  );
};

export default Invites;
