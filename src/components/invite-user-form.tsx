import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Loader2, Plus } from "lucide-react";
import { Organization } from "@/utils/types";
import { getAccessToken } from "@/utils/auth";
import { useToast } from "@/hooks/use-toast";

type InviteUserFormProps = {
  organization: Organization | null;
  loadMembers: () => Promise<void>;
};

export function InviteUserForm(props: InviteUserFormProps) {
  const [email, setEmail] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("member");

  const { toast } = useToast();

  const sendInvite = async () => {
    setLoading(true);
    try {
      const accessToken = await getAccessToken();
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/members/invite`,
        {
          method: "POST",
          //  @ts-ignore
          headers: {
            "X-Orbiter-Token": accessToken,
            "content-Type": "application/json",
            "Source": "web-app"
          },
          body: JSON.stringify({
            email,
            firstName,
            lastName,
            role,
          }),
        }
      );

      if (!res.ok) {
        console.log({
          status: res.status,
          statusText: res.statusText,
        });
        const errorRes = await res.json();

        toast({
          title: errorRes.message,
          variant: "destructive",
        });
        throw new Error("Trouble inviting user");
      } else {
        toast({
            title: "Invite sent!",            
          });
        setLoading(false);
        props.loadMembers();
        setEmail("")
        setFirstName("")
        setLastName("")
        setOpen(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      //  @TODO need a toast
    }
  };

  return (
    <Dialog
      onOpenChange={(newOpen) => {
        if (!loading) {            
          setOpen(newOpen);
          if(newOpen === false) {
            setEmail("")
            setFirstName("")
            setLastName("")
          }
        }
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Invite a Member</DialogTitle>
          <DialogDescription>
            Provide details to invite someone to your organization
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              type="text"
              spellCheck={false}
              className="w-full rounded"
            />
          </div>

          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              type="text"
              spellCheck={false}
              className="w-full rounded"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              spellCheck={false}
              className="w-full rounded"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <Label>Role</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <h4 className="font-semibold mb-2">Role permissions</h4>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Admin:</span> create site,
                        update site, delete site, manage domains, add teammates,
                        remove teammates, manage billing
                      </p>
                      <p>
                        <span className="font-medium">Member:</span> create
                        site, update site
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <RadioGroup value={role} onValueChange={setRole} className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="member" id="member" />
                <Label htmlFor="member">Member</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="admin" id="admin" />
                <Label htmlFor="admin">Admin</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {loading ? (
          <Button disabled className="w-full">
            <Loader2 className="animate-spin mr-2" /> Inviting...
          </Button>
        ) : (
          <Button
            className="w-full"
            disabled={!email || !firstName || !lastName || !role}
            onClick={sendInvite}
          >
            Invite
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
