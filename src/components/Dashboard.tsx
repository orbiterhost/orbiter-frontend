import { useRef } from "react";

type DashboardProps = {
  organization: any;
  sites: any[];
  createSite: any;
  updateSite: any;
};

const Dashboard = (props: DashboardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelection = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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

  const handleUpdateFileSelection = async (
    event: React.ChangeEvent<HTMLInputElement>, siteId: string
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (files.length === 1) {
      // Single file selected
      const file = files[0];
      props.updateSite(file, siteId);
    } else {
      // Multiple files selected (directory)
      props.updateSite(files, siteId);
    }
  };

  const handleCreateClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpdateClick = () => {
    updateFileInputRef.current?.click();
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
          style={{ visibility: "hidden" }}
          //    @ts-ignore
          webkitdirectory=""
          directory=""
          multiple
        />
        <button onClick={handleCreateClick}>Create new site</button>
        {props.sites.map((s: any) => {
          return (
            <div key={s.id}>
              <p>{s.name}</p>
              <a
                href={`http://${s.domain}`}
                target="_blank"
                rel="noopener noreferrer"
              >{`http://${s.domain}`}</a>
              <button onClick={handleUpdateClick}>Update site</button>
              <input
                type="file"
                ref={updateFileInputRef}
                onChange={(e) => handleUpdateFileSelection(e, s.id)}
                style={{ visibility: "hidden" }}
                //    @ts-ignore
                webkitdirectory=""
                directory=""
                multiple
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
