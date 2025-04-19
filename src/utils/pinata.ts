import { PinataSDK } from "pinata-web3";
import { supabase } from "./auth";

export const pinata = new PinataSDK({
  pinataJwt: "",
  pinataGateway: "",
});

export const getKey = async () => {
    const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  const result = await fetch(`${import.meta.env.VITE_BASE_URL}/keys/upload_key`, {
    method: "POST",
    //  @ts-ignore
    headers: {
      "Content-Type": "application/json",
      "X-Orbiter-Token": sessionData.session?.access_token,
      "Source": "web-app"
    },
    body: JSON.stringify({}),
  });

  const keyData = await result.json();
  return keyData;
}

export const uploadSite = async (files: any) => {
    try {
        const keyData = await getKey();
        const JWT = keyData.data;

        const { data } = await supabase.auth.getSession();

        const user = data.session?.user;

        let upload;
        if(files.length > 1) {
            upload = await pinata.upload.fileArray(files).key(JWT).group(import.meta.env.VITE_GROUP_ID).addMetadata({
                keyValues: {
                    userId: user?.id || ""
                }
            })
        } else {
            upload = await pinata.upload.file(files).key(JWT).group(import.meta.env.VITE_GROUP_ID).addMetadata({
                keyValues: {
                    userId: user?.id || ""
                }
            })
        }

        return upload.IpfsHash
    } catch (error) {
        console.log("Upload error: ", error)
        throw error;
    }
}
