import { getAccessToken } from "@/utils/auth";
import { useState } from "react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Check, Copy, Loader2, PlusIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";


type KeySecret = {
  name: string;
  scope: "Admin" | "Member";
  apiKey: string;
}

const APIKeyCreator = () => {

  const [loading, setLoading] = useState(false)
  const [keyScope, setKeyScope] = useState("")
  const [keyName, setKeyName] = useState("")
  const [keyCreated, setKeyCreated] = useState(false)
  const [tempKey, setTempKey] = useState<KeySecret | null>(null)
  const [open, setOpen] = useState(false)

  const [copiedField, setCopiedField] = useState<string>("");

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => {
      setCopiedField("");
    }, 2000);
  };


  const { toast } = useToast();

  const createAPIKey = async () => {
    try {
      setLoading(true)

      if (keyName.length === 0) {
        toast({
          title: "Must provide a key name",
          variant: 'destructive'
        })
        return
      }
      if (keyScope !== "Admin" && keyScope !== "Member") {
        toast({
          title: "Must select either Admin or Member scope",
          variant: 'destructive'
        })
        return
      }

      const accessToken = await getAccessToken();
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/keys`,
        {
          method: "POST",
          headers: {
            "X-Orbiter-Token": `${accessToken}`,
            "Source": "web-app"
          },
          body: JSON.stringify({
            name: keyName,
            scope: keyScope
          })
        }
      );
      const data = await res.json()
      setTempKey(data)
      if (!res.ok) {
        console.log(data)
        toast({
          title: "Problem creating API Key",
          description: data.toString(),
          variant: 'destructive'
        })
        setLoading(false)
        return
      }
      setLoading(false)
      setKeyCreated(true)
      setKeyScope("")
      setKeyName("")
    } catch (error) {
      console.log(error)
      toast({
        title: "Problem creating API Key",
        description: `${error}`,
        variant: 'destructive'
      })
      setLoading(false)
      setKeyCreated(false)
    }
  };



  return (
    <div className="sm:max-w-screen-lg max-w-screen-sm w-full sm:mx-auto mx-4 flex flex-col items-start justify-center gap-2">
      <Dialog
        onOpenChange={(open) => {
          setOpen(open);
          if (!open) {
            setKeyCreated(false);
            setTempKey(null)
          }
        }}
        open={open}
      >
        <div className="w-full flex items-center justify-start mt-6">
          <DialogTrigger>
            <Button>
              <PlusIcon />
              New Key
            </Button>
          </DialogTrigger>
        </div>
        <DialogContent
          onPointerDownOutside={(e) => {
            e.preventDefault();
          }}
        >
          {!keyCreated ? (
            <>
              <DialogHeader>
                <DialogTitle>Create New API Key</DialogTitle>
                <DialogDescription>Select a scope and provide a name</DialogDescription>
              </DialogHeader>
              <Select onValueChange={(value) => setKeyScope(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Member">Member</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="text"
                placeholder="My Key"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
              />
              {loading ?
                <Button disabled>
                  <Loader2 className="animate-spin" />
                  Creating...
                </Button>
                :
                <Button onClick={createAPIKey}>Create</Button>
              }
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Copy Your Key Info</DialogTitle>
                <DialogDescription>This screen is only shown once!</DialogDescription>
              </DialogHeader>
              <Label>Secret Key</Label>
              <div className="flex items-center justify-between p-2 bg-gray-100 rounded">
                <code className="font-mono text-sm truncate max-w-[300px]">{tempKey?.apiKey}</code>
                <Button variant="ghost" size="sm" onClick={() => handleCopy(tempKey?.apiKey as string, 'key')}>
                  {copiedField === 'key' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default APIKeyCreator;
