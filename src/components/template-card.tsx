import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { DownloadIcon, EyeIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Template } from "@/utils/types";
import {
  Dialog,
} from "./ui/dialog";

type TemplateCardProps = {
  template: Template;
  useTemplate: (t: Template) => void;
};

export const TemplateCard = (props: TemplateCardProps) => {

    const handleDownload = () => {
        // Create an anchor element
        const link = document.createElement('a');
        link.href = `https://cdn.orbiter.host/ipfs/${props.template.cid}?download=true`;
        // Set the download attribute to force download instead of navigation
        link.setAttribute('download', 'index.html');
        // Hide the anchor
        link.style.display = 'none';
        // Add to document
        document.body.appendChild(link);
        // Trigger the click
        link.click();
        // Clean up by removing the element
        document.body.removeChild(link);
      };

  return (
    <Dialog>
      <Card className="w-full flex flex-row">
        <CardHeader className="flex items-center gap-2">
          <div className="">
            <CardTitle className="tracking-tighter">
              <a
                href={props.template.hostedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2"
              >
                <span className="flex group-hover:underline items-center justify-center">
                  <span>{props.template.name}</span>
                  <div className="ml-4">
                    <EyeIcon/>
                  </div>                  
                </span>
              </a>
            </CardTitle>
            <div className="w-full my-4">
                <img src={props.template.previewImageUrl} />
            </div>
            <CardDescription>
              <div className="flex items-center justify-end w-full">
                <Button onClick={handleDownload} className="mx-2" variant="link">
                    <DownloadIcon />
                </Button>
                <Button onClick={() => props.useTemplate(props.template)}>Use Template</Button>
              </div>
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </Dialog>
  );
};
