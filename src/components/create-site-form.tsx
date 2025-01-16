import { useEffect, useState } from "react";
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
import { CustomFileDropzone } from "./ui/dropzone";
import { Label } from "./ui/label";
import { Loader2, Plus } from "lucide-react";

type DashboardProps = {
  organization: any;
  sites: any[];
  createSite: any;
  updateSite: any;
  loading: boolean;
  createSiteFromCid: (cid: string, subdomain: string) => Promise<void>;
};

export function CreateSiteForm(props: DashboardProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [domain, setDomain] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [cid, setCid] = useState("");
  const [isValid, setIsValid] = useState(false)
  const [hasValidFiles, setHasValidFiles] = useState(false);

  // Modify the domain onChange handler
  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDomain = e.target.value;
    setDomain(newDomain);
  };

  const handleFileValidityChange = (fileValid: boolean) => {
    setHasValidFiles(fileValid);
  };

  useEffect(() => {
    setIsValid(domain.trim().length > 0 && hasValidFiles);
  }, [domain, hasValidFiles]);

  useEffect(() => {
    const localCid = localStorage.getItem("orbiter-cid");

    if (localCid) {
      setCid(localCid);
      setHasValidFiles(true);
      setOpen(true);
    }
  }, []);

  async function submit() {
    try {
      if (cid) {
        await props.createSiteFromCid(cid, domain.toLowerCase()!);

        localStorage.removeItem("orbiter-cid");
        setOpen(false);
        setDomain("");
        const url = new URL(window.location.href);
        url.searchParams.delete("cid");
        window.history.pushState({}, '', url);
      }

      if (!files.length) {
        console.log("Select a file!");
        return;
      }

      if (files.length === 1) {
        await props.createSite(files[0], domain);
      } else {
        await props.createSite(files, domain);
      }
      setOpen(false);
      setFiles([]);
      setDomain("");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Dialog
      onOpenChange={(open) => {
        // Only allow closing via the close button
        if (!props.loading) {
          setOpen(open);
        }
      }}
      open={open}
    >
      <DialogTrigger>
        <Button>
          <Plus />
          Create Site
        </Button>
      </DialogTrigger>
      <DialogContent
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Upload a Site</DialogTitle>
          <DialogDescription>
            Choose a file or a folder to upload, as well as a subdomain for the
            site
          </DialogDescription>
        </DialogHeader>
        {cid ? (
          <div>
            <p>Complete your site creation</p>
          </div>
        ) : (
          <CustomFileDropzone
            disabled={props.loading}
            files={files}
            setFiles={setFiles}
            setIsValid={handleFileValidityChange}
          />
        )}

        <Label>Subdomain</Label>
        <div className="relative mb-5">
          <Input
            disabled={props.loading}
            value={domain}
            onChange={handleDomainChange}
            type="text"
            spellCheck={false}
            className="w-full rounded pr-32 text-transparent bg-clip-text" // Make input text transparent
          />
          <div className="absolute inset-y-0 left-0 flex items-center px-3 text-black pointer-events-none">
            {domain ? (
              <span className="text-gray-950">{domain}</span>
            ) : (
              <span className="text-gray-400">subdomain</span>
            )}
            <span>.orbiter.website</span>
          </div>
        </div>
        {props.loading ? (
          <Button disabled>
            <Loader2 className="animate-spin" /> Creating Site...
          </Button>
        ) : (
          <Button disabled={!isValid} onClick={submit}>Create</Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
