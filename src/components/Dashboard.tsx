import { useRef } from "react";

type DashboardProps = {
    organization: any;
    sites: any[];
    createSite: any;
}

const Dashboard = (props: DashboardProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;
  
      if (files.length === 1) {
        // Single file selected
        const file = files[0];
        props.createSite(file);
      } else {
        // Multiple files selected (directory)
        props.createSite(files);
      }
    };
  
    const handleCreateClick = () => {
      fileInputRef.current?.click();
    };
  return (
    <div>
        <p>Org name: </p>
        <p>{props.organization?.organizations?.name}</p>
        <div>
            <h1>Sites</h1>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelection}
              style={{visibility: 'hidden'}}
              webkitdirectory=""
              directory=""
              multiple
            />
            <button onClick={handleCreateClick}>Create new site</button>            
            {
                props.sites.map((s: any) => {
                    return (
                        <div key={s.id}>
                            <p>{s.name}</p>
                            <a href={`http://${s.domain}`} target="_blank" rel="noopener noreferrer">{`http://${s.domain}`}</a>
                        </div>
                    )
                })
            }
        </div>
    </div>
  )
}

export default Dashboard