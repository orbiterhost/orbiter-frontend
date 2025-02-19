import { Loader2, History } from "lucide-react";
import { Button } from "./button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";

export function ResetResolver({ handleDelete, isDeleting }: { handleDelete: any, isDeleting: boolean }) {
  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <Button
          variant="destructive"
          className="w-full"
        >
          <History />
          Reset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>This will reset the resolver to the ENS Public Resolver. If you want to use this ENS with Orbiter again you will need to set it up again. This action does cost gas on Etherum </DialogDescription>
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
                Resetting...
              </>
            ) : (
              <>
                <History />
                Reset Resolver
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
