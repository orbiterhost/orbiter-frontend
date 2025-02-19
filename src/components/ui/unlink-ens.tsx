import { Loader2, Unlink } from "lucide-react";
import { Button } from "./button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";

export function UnlinkEns({ handleDelete, isDeleting }: { handleDelete: any, isDeleting: boolean }) {
  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <Button
          variant="destructive"
          className="w-full"
        >
          <Unlink />
          Unlink
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Are you sure you want to unlink your ENS?</DialogTitle>
          <DialogDescription>In ordrder to unlink your ENS it will require resetting the ENS Resolver on your ENS Name which will cost gas</DialogDescription>
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
                Unlinking...
              </>
            ) : (
              <>
                <Unlink />
                Unlink ENS
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
