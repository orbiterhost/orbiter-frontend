import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UnlinkEns } from "./ui/unlink-ens"
import { ResetResolver } from "./ui/reset-resolver"
import { Button } from "./ui/button";
import { createWalletClient, custom, createPublicClient, http, isAddressEqual } from 'viem';
import { namehash, normalize } from "viem/ens"
import type { ContractFunctionExecutionError, Hex } from "viem"
import { mainnet } from 'viem/chains';
import { Loader2 } from "lucide-react";
import { Input } from "./ui/input";
import { getAccessToken } from "../utils/auth"
import { useToast } from "@/hooks/use-toast"
import 'viem/window';
import { publicResolverAbi } from "@/utils/contracts";

const WRAPPER_ADDRESS = import.meta.env.VITE_WRAPPER_ADDRESS
const REGISTRY_ADDRESS = import.meta.env.VITE_REGISTRY_ADDRESS
const ORBITER_RESOLVER = import.meta.env.VITE_ORBITER_RESOLVER
const PUBLIC_RESOLVER = import.meta.env.VITE_PUBLIC_RESOLVER

type AddEnsProps = {
  siteId: string;
  loading: boolean;
};

export function AddEnsForm({
  siteId,
  loading,
}: AddEnsProps) {
  const [open, setOpen] = useState(false);
  const [ensName, setEnsName] = useState("");
  const [ensVerified, setEnsVerified] = useState(false)
  const [resolverVerified, setResolverVerified] = useState(false)
  const [updatingEns, setUpdatingEns] = useState(false)
  const [addingResolver, setAddingResolver] = useState(false)
  const [updatingResolver, setUpdatingResolver] = useState(false)
  const [addingEns, setAddingEns] = useState(false)
  const [updateTrigger, setUpdateTrigger] = useState(0)
  const { toast } = useToast()

  const checkResolver = async () => {
    if (!ensName) return;

    try {
      const accessToken = await getAccessToken()
      const req = await fetch(`${import.meta.env.VITE_BASE_URL}/ens/resolver/${ensName}`, {
        headers: {
          "X-Orbiter-Token": `${accessToken}`,
        }
      })
      if (req.ok) {
        setResolverVerified(true)
      } else {
        setResolverVerified(false)
      }
    } catch (error) {
      console.log(error)
      setResolverVerified(false)
    }
  }

  const checkSite = async () => {
    try {
      const accessToken = await getAccessToken()
      const req = await fetch(`${import.meta.env.VITE_BASE_URL}/ens/verify/${siteId}`, {
        headers: {
          "X-Orbiter-Token": `${accessToken}`,
        }
      })
      if (req.ok) {
        const data = await req.json()
        setEnsVerified(true)
        setEnsName(data.ens)
      } else {
        setEnsVerified(false)
        setEnsName("")
      }
    } catch (error) {
      console.log(error)
      setEnsVerified(false)
      setEnsName("")
    }
  }

  useEffect(() => {
    checkSite()
  }, [siteId, updateTrigger])

  useEffect(() => {
    checkResolver()
  }, [ensName, ensVerified, updateTrigger])

  async function submit() {
    try {
      if (!window.ethereum) {
        toast({
          title: "No Wallet Detected",
          description: "Please make sure a wallet browser extension is installed or access the site from a mobile wallet browser",
          variant: "destructive"
        })
        return
      }
      setAddingEns(true)
      const walletClient = createWalletClient({
        chain: mainnet,
        transport: custom(window.ethereum)
      });

      const [address] = await walletClient.requestAddresses();

      await walletClient.switchChain({ id: mainnet.id })

      const publicClient = createPublicClient({
        chain: mainnet,
        transport: http()
      });

      const resolvedAddress = await publicClient.getEnsAddress({
        name: ensName,
      });

      if (!resolvedAddress) {
        toast({
          title: "No address found for ENS",
          variant: "destructive"
        })
        setAddingEns(false)
        return
      }

      const match = isAddressEqual(resolvedAddress, address)
      if (!match) {
        toast({
          title: "Connected wallet does not own this ENS name",
          variant: "destructive"
        })
        setAddingEns(false)
        throw new Error('Connected wallet does not own this ENS name');
      }

      const message = `Verify ownership of ${ensName} at ${new Date().toISOString()}`;

      const signature = await walletClient.signMessage({
        account: address,
        message
      });

      const accessToken = await getAccessToken()

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/ens/verify`, {
        method: 'POST',
        headers: {
          "X-Orbiter-Token": `${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ensName,
          message,
          signature,
          address,
          siteId
        })
      });

      const data = await response.json();
      toast({
        title: "ENS Verified!",
        description: `${data.message}`,
      })
      setAddingEns(false)
      setUpdateTrigger(prev => prev + 1)
      return data.verified;
    } catch (error) {
      setAddingEns(false)
      console.log(error);
      toast({
        title: "ENS Verification Failed!",
        description: `${error}`,
      })
    }
  }

  async function update() {
    try {
      setUpdatingEns(true)
      const accessToken = await getAccessToken()

      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/ens/verify`, {
        method: 'PUT',
        headers: {
          "X-Orbiter-Token": `${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ensName: null,
          siteId,
          resolverSet: null
        })
      });

      const data = await response.json();
      toast({
        title: "ENS Update Succesful",
        description: `${data.message}`,
      })
      setUpdatingEns(false)
      setUpdateTrigger(prev => prev + 1)
      return data.verified;
    } catch (error) {
      setUpdatingEns(false)
      toast({
        title: "ENS Update Failed",
        description: `${error}`,
      })
      console.log(error);
    }
  }

  async function setResolver() {
    try {
      if (!window.ethereum) {
        toast({
          title: "No Wallet Detected",
          description: "Please make sure a wallet browser extension is installed",
          variant: "destructive"
        })
        return
      }
      setAddingResolver(true)

      const walletClient = createWalletClient({
        chain: mainnet,
        transport: custom(window.ethereum)
      });

      const publicClient = createPublicClient({
        chain: mainnet,
        transport: http()
      });

      const nameHash = namehash(normalize(ensName))

      const owner = await publicClient.readContract({
        address: PUBLIC_RESOLVER as Hex,
        abi: publicResolverAbi,
        functionName: 'owner',
        args: [nameHash]
      })

      let targetResolver: Hex

      if (owner !== WRAPPER_ADDRESS) {
        targetResolver = REGISTRY_ADDRESS
      } else {
        targetResolver = WRAPPER_ADDRESS
      }

      const [address] = await walletClient.requestAddresses();

      await walletClient.switchChain({ id: mainnet.id })

      const { request } = await publicClient.simulateContract({
        account: address,
        address: targetResolver,
        abi: publicResolverAbi,
        functionName: 'setResolver',
        args: [nameHash, ORBITER_RESOLVER]
      })
      const hash = await walletClient.writeContract(request)

      await publicClient.waitForTransactionReceipt({ hash })

      toast({
        title: "Resolver Set Successfully",
        description: "Your ENS resolver has been set to Orbiter's resolver",
      })

      setAddingResolver(false)
      setUpdateTrigger(prev => prev + 1)
    } catch (error) {
      console.log('Simulation error:', error)
      const revertError = error as ContractFunctionExecutionError
      console.log('Revert reason:', revertError.cause)
      toast({
        title: "Simulation Failed",
        description: `${revertError.shortMessage || revertError.message}`,
        variant: "destructive"
      })
      setAddingResolver(false)
    }
  }

  async function resetResolver() {
    try {
      if (!window.ethereum) {
        toast({
          title: "No Wallet Detected",
          description: "Please make sure a wallet browser extension is installed",
          variant: "destructive"
        })
        return
      }
      setUpdatingResolver(true)

      const walletClient = createWalletClient({
        chain: mainnet,
        transport: custom(window.ethereum)
      });

      const publicClient = createPublicClient({
        chain: mainnet,
        transport: http()
      });

      const nameHash = namehash(normalize(ensName))

      const owner = await publicClient.readContract({
        address: REGISTRY_ADDRESS as Hex,
        abi: publicResolverAbi,
        functionName: 'owner',
        args: [nameHash]
      })

      let targetResolver: Hex

      if (owner !== WRAPPER_ADDRESS) {
        targetResolver = REGISTRY_ADDRESS
      } else {
        targetResolver = WRAPPER_ADDRESS
      }

      const [address] = await walletClient.requestAddresses();

      await walletClient.switchChain({ id: mainnet.id })

      const hash = await walletClient.writeContract({
        account: address,
        address: targetResolver,
        abi: [
          {
            name: 'setResolver',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'node', type: 'bytes32' },
              { name: 'resolver', type: 'address' }
            ],
            outputs: []
          }
        ],
        functionName: 'setResolver',
        args: [nameHash, PUBLIC_RESOLVER]
      })

      await publicClient.waitForTransactionReceipt({ hash })

      toast({
        title: "Resolver Reset Successfully",
        description: "Your ENS resolver has been reset to the public resolver",
      })

      setUpdatingResolver(false)
      setUpdateTrigger(prev => prev + 1)
    } catch (error) {
      console.error(error)
      setUpdatingResolver(false)
      toast({
        title: "Error Resetting Resolver",
        description: "There was an error resetting your ENS resolver",
        variant: "destructive"
      })
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
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m19 12l-5.76 2.579c-.611.28-.917.421-1.24.421s-.629-.14-1.24-.421L5 12m14 0c0-.532-.305-1-.917-1.936L14.58 4.696C13.406 2.9 12.82 2 12 2s-1.406.899-2.58 2.696l-3.503 5.368C5.306 11 5 11.468 5 12m14 0c0 .532-.305 1-.917 1.936l-3.503 5.368C13.406 21.1 12.82 22 12 22s-1.406-.899-2.58-2.696l-3.503-5.368C5.306 13 5 12.532 5 12" color="currentColor"></path></svg>
          Link ENS
        </Button>
      </DialogTrigger>
      <DialogContent
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Link ENS</DialogTitle>
          <DialogDescription>
            If you have an ENS you can link your Orbiter site so the contentHash is the same as your Orbiter site. Make sure the contentHash field on your ENS is blank before proceeding.
          </DialogDescription>
        </DialogHeader>
        {!ensVerified && (
          <>
            <Input
              type="text"
              value={ensName}
              onChange={(e) => setEnsName(e.target.value)}
              placeholder="your-name.eth"
            />
            {addingEns ? (
              <Button disabled>
                <Loader2 className="animate-spin" /> Linking ENS...
              </Button>
            ) : (
              <Button onClick={submit}>Link</Button>
            )}
          </>
        )}
        {ensVerified && (
          <div className="grid grid-cols-3 gap-2">
            <Button className="col-span-2" disabled ><svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 30 30" fill="white">
              <path d="M12.8059 0.278909L4.52032 13.9123C4.45534 14.0192 4.30436 14.0311 4.22376 13.9354C3.49433 13.0693 0.776816 9.38466 4.13946 6.02631C7.20789 2.96181 11.1162 0.776893 12.5647 0.0217387C12.729 -0.0639373 12.9021 0.120655 12.8059 0.278909Z" fill="white" />
              <path d="M12.3428 29.9655C12.5082 30.0812 12.7119 29.8838 12.6011 29.7153C10.7504 26.9004 4.59842 17.5346 3.74859 16.1286C2.91038 14.7419 1.26174 12.4373 1.12421 10.4656C1.11048 10.2687 0.838295 10.2288 0.769825 10.4139C0.6594 10.7124 0.541837 11.0687 0.432269 11.4758C-0.950933 16.614 1.0579 22.0665 5.42067 25.1202L12.3428 29.9655V29.9655Z" fill="white" />
              <path d="M13.4817 29.7198L21.7673 16.0864C21.8323 15.9795 21.9833 15.9676 22.0639 16.0633C22.7933 16.9294 25.5108 20.614 22.1482 23.9724C19.0798 27.0369 15.1715 29.2218 13.723 29.9769C13.5587 30.0626 13.3855 29.878 13.4817 29.7198Z" fill="white" />
              <path d="M13.9441 0.0346591C13.7788 -0.0810829 13.575 0.116302 13.6859 0.284863C15.5366 3.09974 21.6886 12.4655 22.5384 13.8715C23.3766 15.2582 25.0252 17.5628 25.1628 19.5346C25.1765 19.7314 25.4487 19.7714 25.5172 19.5863C25.6276 19.2877 25.7451 18.9314 25.8547 18.5243C27.2379 13.3861 25.2291 7.93365 20.8663 4.87989L13.9441 0.0346591Z" fill="white" />
            </svg>
              {ensName}
            </Button>
            <UnlinkEns handleDelete={update} isDeleting={updatingEns} />
          </div>
        )}
        {ensVerified && !resolverVerified && (
          <>
            {addingResolver ? (
              <Button className="" disabled>
                <Loader2 className="animate-spin" /> Setting Resolver...
              </Button>
            ) : (
              <Button onClick={setResolver}>
                Set Resolver</Button>
            )}
          </>
        )}

        {ensVerified && resolverVerified && (
          <div className="grid grid-cols-3 gap-2">
            <Button className="col-span-2" disabled>
              <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m19 12l-5.76 2.579c-.611.28-.917.421-1.24.421s-.629-.14-1.24-.421L5 12m14 0c0-.532-.305-1-.917-1.936L14.58 4.696C13.406 2.9 12.82 2 12 2s-1.406.899-2.58 2.696l-3.503 5.368C5.306 11 5 11.468 5 12m14 0c0 .532-.305 1-.917 1.936l-3.503 5.368C13.406 21.1 12.82 22 12 22s-1.406-.899-2.58-2.696l-3.503-5.368C5.306 13 5 12.532 5 12" color="currentColor"></path></svg>
              Resolver Set
            </Button>
            <ResetResolver handleDelete={resetResolver} isDeleting={updatingResolver} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
