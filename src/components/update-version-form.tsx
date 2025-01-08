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
import { ExternalLink, History, Loader2 } from "lucide-react";
import { VersionCombobox } from "@/components/ui/version-combobox"

type UpdateSiteProps = {
  updateSite: any;
  siteId: string;
  loading: boolean;
  versions: SiteVersion[]
  siteDomain: string;
};

type SiteVersion = {
  id: string;
  site_id: string;
  created_at: string;
  organization_id: string;
  cid: string;
  domain: string;
  site_contract: string;
  version_number: number;
  deployed_by: string;
};

type VersionOption = {
  value: string;
  label: string;
  data: SiteVersion;
};


export function UpdateVersionForm({
  updateSite,
  siteId,
  loading,
  versions,
  siteDomain
}: UpdateSiteProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<VersionOption | undefined>();

  const versionOptions: VersionOption[] = versions.map((version) => ({
    value: version.cid,
    label: version.version_number.toString(),
    data: version
  }));

  async function submit() {
    try {
      if (!selectedVersion) {
        console.log("Select a version!");
        return;
      }
      await updateSite(files, siteId, selectedVersion.value);
      setOpen(false);
      setFiles([]);
      setSelectedVersion(undefined);
    } catch (error) {
      console.error("Error updating site:", error);
    }
  }

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!loading) {
          setOpen(open);
          if (!open) {
            setFiles([]);
            setSelectedVersion(undefined);
          }
        }
      }}
      open={open}
    >
      <DialogTrigger className="w-full">
        <Button variant="ghost" className="h-7 w-full justify-start">
          <History />
          Versions
        </Button>
      </DialogTrigger>
      <DialogContent
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Update Site</DialogTitle>
          <DialogDescription>
            Choose a file or a folder to upload, as well as a subdomain for the
            site
          </DialogDescription>
        </DialogHeader>
        <VersionCombobox
          versions={versionOptions}
          value={selectedVersion?.value ?? ''}
          onVersionSelect={setSelectedVersion}
        />
        {selectedVersion?.value && (
          <a
            target="_blank"
            href={`https://${siteDomain}?orbiterVersionCid=${selectedVersion.value}`}>
            <Button variant="outline" className="w-full">
              Preview
              <ExternalLink />
            </Button>
          </a>
        )}
        <Button
          onClick={submit}
          disabled={loading || !selectedVersion}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" /> Updating Site...
            </>
          ) : (
            'Update'
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
