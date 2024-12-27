import { signOut } from "../utils/auth"
import Dashboard from "./Dashboard";

type MainProps = {
    organizations: any[];
    sites: any[];
    createSite: any;
    updateSite: any;
}

const Main = (props: MainProps) => {
    console.log(props)
  return (
    <div>
        <div>
            <button onClick={signOut}>Sign out</button>
        </div>
        {
            props.organizations.length > 1 ?
            <div>
                <p>Org switcher</p>
            </div> : 
            props.organizations.length > 0 &&
            <Dashboard updateSite={props.updateSite} organization={props.organizations[0]} sites={props.sites} createSite={props.createSite} />
        }
    </div>
  )
}

export default Main