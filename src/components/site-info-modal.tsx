import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Info, Copy, Check } from "lucide-react";
import { Site } from "@/utils/types";
import { useState } from "react";
import { Label } from "./ui/label";

export function SiteInfoModal({
  id, cid, domain, site_contract, created_at
}: Site) {
  const [copiedField, setCopiedField] = useState<string>("");

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => {
      setCopiedField("");
    }, 2000);
  };

  return (
    <Dialog
    >
      <DialogTrigger className="w-full">
        <Button variant="ghost" className="h-7 w-full justify-start">
          <Info />
          Info
        </Button>
      </DialogTrigger>
      <DialogContent
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Detailed Site Info</DialogTitle>
          <DialogDescription>
            Under the hood details about your site. You don't need to know what they all mean in order to enjoy Orbiter!
          </DialogDescription>
          <div className="flex flex-col gap-2 mt-12 text-sm">
            <Label>Site ID</Label>
            <div className="flex items-center justify-between p-2 bg-gray-100 rounded">
              <code className="font-mono truncate max-w-[300px]">{id}</code>
              <Button variant="ghost" size="sm" onClick={() => handleCopy(id, 'id')}>
                {copiedField === 'id' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Label>Domain</Label>
            <div className="flex items-center justify-between p-2 bg-gray-100 rounded">
              <code className="font-mono truncate max-w-[300px]">{domain}</code>
              <Button variant="ghost" size="sm" onClick={() => handleCopy(domain, 'domain')}>
                {copiedField === 'domain' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Label>CID</Label>
            <div className="flex items-center justify-between p-2 bg-gray-100 rounded">
              <code className="font-mono truncate max-w-[300px]">{cid}</code>
              <Button variant="ghost" size="sm" onClick={() => handleCopy(cid, 'cid')}>
                {copiedField === 'cid' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Label>Contract Address</Label>
            <div className="flex items-center justify-between p-2 bg-gray-100 rounded">
              <code className="font-mono truncate max-w-[300px]">{site_contract}</code>
              <Button variant="ghost" size="sm" onClick={() => handleCopy(site_contract, 'contract')}>
                {copiedField === 'contract' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Label>Created At</Label>
            <div className="flex items-center justify-between p-2 bg-gray-100 rounded">
              <code className="font-mono truncate max-w-[300px]">{created_at}</code>
              <Button variant="ghost" size="sm" onClick={() => handleCopy(created_at, 'created')}>
                {copiedField === 'created' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
