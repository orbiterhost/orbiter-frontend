import { signUserIn } from "../utils/auth";
import { Button } from "./ui/button";

const Authenticate = () => {
	const signIn = async (method: string) => {
		try {
			const data = await signUserIn(method);
			console.log(data);
		} catch (error: any) {
			console.log(error);
			alert(error.message);
		}
	};

	return (
		<div className="min-h-screen w-full flex flex-col gap-12 items-center justify-center">
			<Button onClick={() => signIn("github")}>Sign in with Github</Button>
			<Button onClick={() => signIn("google")}>Sign in with Google</Button>
		</div>
	);
};

export default Authenticate;
