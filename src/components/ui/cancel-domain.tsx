import { Loader2, Trash2 } from "lucide-react";
import { Button } from "./button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";

export function CancelDomain({ handleDelete, isDeleting }: { handleDelete: any, isDeleting: boolean }) {
  return (
    <Dialog>
      <DialogTrigger>
        <Button
          variant="destructive"
          className="flex-1"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Cancel Domain
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Are you sure you want to cancel?</DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={handleDelete}
            variant="destructive"
            disabled={isDeleting}
            className="flex-1"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Canceling...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Cancel Domain
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
