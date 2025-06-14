import { useState, useEffect } from "react";
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
  versions: SiteVersion[] | undefined;
  siteDomain: string;
  onLoadVersions: () => Promise<void>;
  versionsLoaded: boolean;
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
  siteDomain,
  onLoadVersions,
  versionsLoaded
}: UpdateSiteProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<VersionOption | undefined>();

  const versionOptions: VersionOption[] = versions ? versions.map((version) => ({
    value: version.id,
    label: version.version_number.toString(),
    data: version
  })) : [];

  // Load versions when dialog opens
  useEffect(() => {
    if (open && !versionsLoaded) {
      onLoadVersions();
    }
  }, [open, versionsLoaded, onLoadVersions]);

  async function submit() {
    try {
      if (!selectedVersion) {
        console.log("Select a version!");
        return;
      }
      await updateSite(files, siteId, selectedVersion.data.cid);
      setOpen(false);
      setFiles([]);
      setSelectedVersion(undefined);
    } catch (error) {
      console.error("Error updating site:", error);
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading) {
      setOpen(newOpen);
      if (!newOpen) {
        setFiles([]);
        setSelectedVersion(undefined);
      }
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
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
            Choose a version to deploy to your site
          </DialogDescription>
        </DialogHeader>
        
        {!versionsLoaded ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="animate-spin mr-2" />
            <span>Loading versions...</span>
          </div>
        ) : versions && versions.length > 0 ? (
          <>
            <VersionCombobox
              versions={versionOptions}
              value={selectedVersion?.value ?? ''}
              onVersionSelect={setSelectedVersion}
            />
            {selectedVersion?.value && (
              <a
                target="_blank"
                href={`https://${siteDomain}?orbiterVersionCid=${selectedVersion.data.cid}`}>
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
          </>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No versions found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}