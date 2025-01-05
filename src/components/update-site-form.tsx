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
import { CustomFileDropzone } from "./ui/dropzone";
import { CircleFadingArrowUp, Loader2 } from "lucide-react";

type UpdateSiteProps = {
  updateSite: any;
  siteId: string;
  loading: boolean;
};

export function UpdateSiteForm({
  updateSite,
  siteId,
  loading,
}: UpdateSiteProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [open, setOpen] = useState(false);

  async function submit() {
    try {
      if (!files.length) {
        console.log("Select a file!");
        return;
      }

      if (files.length === 1) {
        // Single file selected
        const file = files[0];
        await updateSite(file, siteId);
      } else {
        // Multiple files selected (directory)
        await updateSite(files, siteId);
      }
      setOpen(false);
      setFiles([]);
    } catch (error) {
      console.log(error);
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
      <DialogTrigger className="w-full">
        <Button variant="ghost" className="h-7 w-full justify-start">
          <CircleFadingArrowUp />
          Update Site
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
        <CustomFileDropzone
          disabled={loading}
          files={files}
          setFiles={setFiles}
        />
        {loading ? (
          <Button disabled>
            <Loader2 className="animate-spin" /> Updating Site...
          </Button>
        ) : (
          <Button onClick={submit}>Update</Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
