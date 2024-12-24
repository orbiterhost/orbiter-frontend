import { signInWithGithub, signUserIn } from "../utils/auth"

const Authenticate = () => {
    const signIn = async (method: string) => {
        try {
            const data = await signUserIn(method);
            console.log(data);   
        } catch (error: any) {
            console.log(error);
            alert(error.message);
        }   
    }

  return (
    <div>
        <div>
            <button onClick={() => signIn("github")}>Sign in with Github</button>            
        </div>
        <div>
            <button onClick={() => signIn("google")}>Sign in with Google</button>
        </div>
    </div>
  )
}

export default Authenticate