import { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { getAccessToken } from "@/utils/auth";
import { useToast } from "@/hooks/use-toast";

const BanHammer = () => {
  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");

  const { toast } = useToast();

  const banSite = async () => {
    try {
      const accessToken = await getAccessToken();
      const res = await fetch(`${import.meta.env.BASE_URL}/admin/block_site`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Orbiter-Token": accessToken,
        },
        body: JSON.stringify({ domain }),
      });

      if (!res.ok) {
        const message = await res.json().message;
        console.log(message);
        toast({
          title: "Trouble banning site",
          variant: "destructive",
        });
      }

      toast({
        title: "Site has been blocked!",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Trouble banning site",
        variant: "destructive",
      });
    }
  };


  const banUser = async () => {
    try {
      const accessToken = await getAccessToken();
      const res = await fetch(`${import.meta.env.BASE_URL}/admin/block_user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Orbiter-Token": accessToken,
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        console.log(data);
        toast({
          title: "Trouble banning user",
          variant: "destructive",
        });
      }

      toast({
        title: "User has been blocked!",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Trouble banning user",
        variant: "destructive",
      });
    }
  };
  return (
    <div className="w-4/5 m-auto mt-8 mb-20">
    <h3 className="text-2xl text-center">Block Sites & Users</h3>
    <div className="w-full m-auto flex items-center justify-around">
      <div>
        <div>
          <Label htmlFor="domain">Domain</Label>
          <Input
            id="domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            type="text"
            spellCheck={false}
            className="w-full rounded"
            placeholder="https://somebadsite.orbiter.website"
          />
        </div>
        <Button className="mt-4" onClick={banSite}>Block Site</Button>
      </div>
      <div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="text"
            spellCheck={false}
            className="w-full rounded"
            placeholder="baduser@email.com"
          />
        </div>
        <Button className="mt-4" onClick={banSite}>Block User</Button>
      </div>
    </div>
    </div>
  );
};

export default BanHammer;
