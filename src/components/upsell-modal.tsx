import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { ChartAreaIcon, History, Signature } from "lucide-react";

type UpsellModalProps = {
  feature: string;
};

export function UpsellModal({ feature }: UpsellModalProps) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  const handleUpgrade = () => {
    window.location.href = "/billing";  // Using href instead of pushState for proper navigation
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {feature === "custom domain" ? (
          <Button variant="ghost" className="h-7 w-full justify-start">
            <Signature />
            Custom Domain
          </Button>
        ) : feature === "analytics" ? (
          <Button variant="ghost" className="h-7 w-full justify-start">
            <ChartAreaIcon />
            Analytics
          </Button>
        ) : (
          <Button variant="ghost" className="h-7">
            <History />
            Versions
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade for access</DialogTitle>
          <DialogDescription>
            {feature === "analytics" ? "This feature is only available on the Orbit plan" : "This feature is only available on paid plans"}
          </DialogDescription>
        </DialogHeader>
        <Button onClick={handleUpgrade} className="mt-4">
          Upgrade now
        </Button>
      </DialogContent>
    </Dialog>
  );
}
