import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Loader2, CircleCheck, Signature } from "lucide-react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { DomainRecordInfo, Site } from "@/utils/types";
import { CancelDomain } from "./ui/cancel-domain";
import { DeleteDomain } from "./ui/delete-domain";

type CustomDomainFormProps = {
  updateSite: any;
  siteId: string;
  loading: boolean;
  customDomain: string;
  setCustomDomain: any;
  addCustomDomain: (domain?: string) => Promise<void>;
  deleteCustomDomain: (customDomain: string, siteId: string) => Promise<void>;
  siteInfo: Site;
};

export function CustomDomainForm({
  loading,
  customDomain,
  setCustomDomain,
  addCustomDomain,
  deleteCustomDomain,
  siteInfo,
}: CustomDomainFormProps) {
  const [open, setOpen] = useState(false);
  const [domainRecordInfo, setDomainRecordInfo] =
    useState<DomainRecordInfo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (siteInfo.custom_domain) {
      getRecordInfo();
    }
  }, []);

  const getRecordInfo = async () => {
    const record: any = await addCustomDomain(siteInfo.custom_domain as string);
    console.log({ record });
    setDomainRecordInfo(record);
  };

  function isValidDomain(domain: string) {
    const pattern =
      /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return pattern.test(domain);
  }

  async function submit() {
    try {
      if (!isValidDomain(customDomain)) {
        toast({
          title: "Invalid custom domain",
          variant: "destructive",
        });
        return;
      }
      const record: any = await addCustomDomain();
      setDomainRecordInfo(record);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      console.log("Delete");
      await deleteCustomDomain(siteInfo?.custom_domain || "", siteInfo.id);
      setDomainRecordInfo(null);
      toast({
        title: "Custom domain deleted",
        description: "Your custom domain has been removed successfully",
      });
      setOpen(false)
    } catch (error) {
      toast({
        title: "Error deleting domain",
        variant: "destructive",
      });
      setOpen(false)
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog
      onOpenChange={(open) => {
        // Only allow closing via the close button
        if (!loading) {
          setOpen(open);
        }
      }}
      open={open}
    >
      <DialogTrigger>
        <Button variant="ghost" className="h-7">
          <Signature />
          Custom Domain
        </Button>
      </DialogTrigger>
      {domainRecordInfo ? (
        <DialogContent
          onPointerDownOutside={(e) => {
            e.preventDefault();
          }}
          className="sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>Custom Domain</DialogTitle>
            <DialogDescription>
              Domain configuration and status
            </DialogDescription>
          </DialogHeader>

          {/* Status Indicators */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Domain Verification:</span>
              {siteInfo.domain_ownership_verified ? (
                <CircleCheck className="h-4 w-4 text-green-500" />
              ) : (
                <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">SSL Status:</span>
              {siteInfo.ssl_issued ? (
                <CircleCheck className="h-4 w-4 text-green-500" />
              ) : (
                <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label>DNS Record</Label>
            <pre className="relative rounded-lg border bg-muted p-3">
              <p>Type: {domainRecordInfo.recordType}</p>
              <p>Host: {domainRecordInfo.recordHost}</p>
              <p>Value: {domainRecordInfo.recordValue}</p>
            </pre>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => setOpen(false)}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
            {siteInfo.domain_ownership_verified ? (
              <DeleteDomain handleDelete={handleDelete} isDeleting={isDeleting} />
            ) : (
              <CancelDomain handleDelete={handleDelete} isDeleting={isDeleting} />
            )}
          </div>
        </DialogContent>
      ) : (
        <DialogContent
          onPointerDownOutside={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>Custom Domain</DialogTitle>
            <DialogDescription>
              Add a custom domain to your site or update your existing domain
            </DialogDescription>
          </DialogHeader>
          <Label>Domain</Label>
          <div className="relative mb-5">
            <Input
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              type="text"
              spellCheck={false}
              placeholder="mysite.com"
              className="w-full rounded pr-32 text-black bg-clip-text"
            />
          </div>
          {loading ? (
            <Button disabled>
              <Loader2 className="mr-2 animate-spin" /> Adding domain...
            </Button>
          ) : (
            <Button onClick={submit}>Add</Button>
          )}
        </DialogContent>
      )}
    </Dialog>
  );
}
