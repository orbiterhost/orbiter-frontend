import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Code, Loader2, Upload, Eye, EyeOff } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FunctionDetails = {
  scriptName: string;
  created_on: string;
  modified_on: string;
  isDeployed: boolean;
  apiUrl: string;
  apiEndpoint: string;
  siteId: string;
  siteDomain: string;
  customDomain: string;
  script: string;
  environment?: Record<string, string>; // Made optional
  bindings: Array<{
    name: string;
    text: string;
    type: string;
  }>;
  lastUpdated: string;
  deployedName: string;
};

type UpdateFunctionProps = {
  updateFunction: (
    functionCode: string,
    envVars: Record<string, string>,
    siteId: string,
  ) => Promise<void>;
  siteId: string;
  loading: boolean;
  functionDetails: FunctionDetails | null;
  onLoadFunctionDetails: () => Promise<void>;
  functionLoaded: boolean;
};

type EnvVar = {
  id: string;
  key: string;
  value: string;
  isExisting: boolean;
};

export function UpdateFunctionForm({
  updateFunction,
  siteId,
  loading,
  functionDetails,
  onLoadFunctionDetails,
  functionLoaded,
}: UpdateFunctionProps) {
  const [open, setOpen] = useState(false);
  const [functionCode, setFunctionCode] = useState("");
  const [envVars, setEnvVars] = useState<EnvVar[]>([]);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [envFileContent, setEnvFileContent] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const envFileInputRef = useRef<HTMLInputElement>(null);

  // Load function details when dialog opens
  useEffect(() => {
    if (open && !functionLoaded) {
      onLoadFunctionDetails();
    }
  }, [open, functionLoaded, onLoadFunctionDetails]);

  // Update form when function details are loaded
  useEffect(() => {
    if (functionDetails) {
      setFunctionCode(functionDetails.script || "");

      // Convert bindings to envVars format for the UI
      const initialEnvVars: EnvVar[] = [];

      if (functionDetails.bindings && functionDetails.bindings.length > 0) {
        functionDetails.bindings.forEach((binding) => {
          initialEnvVars.push({
            id: `existing-${binding.name}`,
            key: binding.name,
            value: "", // We don't show the actual values for security
            isExisting: true,
          });
        });
      }

      // Fallback to environment if bindings are not available (backward compatibility)
      if (functionDetails.environment && initialEnvVars.length === 0) {
        Object.keys(functionDetails.environment).forEach((key) => {
          initialEnvVars.push({
            id: `existing-${key}`,
            key: key,
            value: "",
            isExisting: true,
          });
        });
      }

      setEnvVars(initialEnvVars);
    } else {
      // Reset to empty state if no function details (new function)
      setFunctionCode(`export default {
  async fetch(request, env, ctx) {
    return new Response('Hello World!');
  },
};`);
      setEnvVars([]);
    }
  }, [functionDetails]);

  async function submit() {
    try {
      // Convert EnvVar[] back to Record<string, string>
      const envVarsObject = envVars.reduce(
        (acc, envVar) => {
          if (envVar.key.trim()) {
            acc[envVar.key] = envVar.value;
          }
          return acc;
        },
        {} as Record<string, string>,
      );

      await updateFunction(functionCode, envVarsObject, siteId);
      setOpen(false);
    } catch (error) {
      console.error("Error updating function:", error);
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading) {
      setOpen(newOpen);
      if (!newOpen) {
        // Reset form state when closing
        setFunctionCode("");
        setEnvVars([]);
        setShowSecrets({});
        setEnvFileContent("");
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setFunctionCode(content);
      };
      reader.readAsText(file);
    }
  };

  const handleEnvFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setEnvFileContent(content);
        parseEnvFile(content);
      };
      reader.readAsText(file);
    }
  };

  const parseEnvFile = (content: string) => {
    const lines = content.split("\n");
    const newEnvVars: EnvVar[] = [...envVars];

    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith("#")) {
        const [key, ...valueParts] = trimmedLine.split("=");
        if (key && valueParts.length > 0) {
          const value = valueParts.join("=").replace(/^["']|["']$/g, ""); // Remove quotes
          const existingIndex = newEnvVars.findIndex((env) => env.key === key.trim());

          if (existingIndex >= 0) {
            // Update existing
            newEnvVars[existingIndex] = { ...newEnvVars[existingIndex], value };
          } else {
            // Add new
            newEnvVars.push({
              id: `parsed-${Date.now()}-${Math.random()}`,
              key: key.trim(),
              value,
              isExisting: false,
            });
          }
        }
      }
    });

    setEnvVars(newEnvVars);
  };

  const handleEnvVarKeyChange = (id: string, newKey: string) => {
    setEnvVars((prev) =>
      prev.map((envVar) => (envVar.id === id ? { ...envVar, key: newKey } : envVar)),
    );
  };

  const handleEnvVarValueChange = (id: string, newValue: string) => {
    setEnvVars((prev) =>
      prev.map((envVar) => (envVar.id === id ? { ...envVar, value: newValue } : envVar)),
    );
  };

  const addEnvVar = () => {
    const newEnvVar: EnvVar = {
      id: `new-${Date.now()}-${Math.random()}`,
      key: "",
      value: "",
      isExisting: false,
    };
    setEnvVars((prev) => [...prev, newEnvVar]);
  };

  const removeEnvVar = (id: string) => {
    setEnvVars((prev) => prev.filter((envVar) => envVar.id !== id));

    setShowSecrets((prev) => {
      const newShowSecrets = { ...prev };
      delete newShowSecrets[id];
      return newShowSecrets;
    });
  };

  const toggleSecretVisibility = (id: string) => {
    setShowSecrets((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger className="w-full">
        <Button variant="ghost" className="h-7 w-full justify-start">
          <Code />
          Functions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{functionDetails ? "Update Function" : "Create Function"}</DialogTitle>
          <DialogDescription>
            {functionDetails
              ? "Update your serverless function code and environment variables"
              : "Create a new serverless function for your site"}
          </DialogDescription>
        </DialogHeader>

        {!functionLoaded ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin mr-2" />
            <span>Loading function details...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Function Code Section */}
            <div>
              <label className="block text-sm font-medium mb-3">Function Code</label>

              <Tabs defaultValue="paste" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="paste">Paste Code</TabsTrigger>
                  <TabsTrigger value="upload">Upload File</TabsTrigger>
                </TabsList>

                <TabsContent value="paste" className="mt-4">
                  <textarea
                    value={functionCode}
                    onChange={(e) => setFunctionCode(e.target.value)}
                    className="w-full h-64 p-3 border rounded-md font-mono text-sm bg-muted resize-none"
                    placeholder="Enter your function code here..."
                  />
                </TabsContent>

                <TabsContent value="upload" className="mt-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".js,.ts,.mjs"
                      className="hidden"
                    />
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload a JavaScript/TypeScript file
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose File
                    </Button>
                  </div>
                  {functionCode && (
                    <div className="mt-4">
                      <p className="text-sm text-green-600 mb-2">File uploaded successfully!</p>
                      <textarea
                        value={functionCode}
                        onChange={(e) => setFunctionCode(e.target.value)}
                        className="w-full h-32 p-3 border rounded-md font-mono text-sm bg-muted resize-none"
                        placeholder="Function code will appear here..."
                      />
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Environment Variables Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium">Environment Variables</label>
              </div>

              <Tabs defaultValue="individual" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="individual">Individual Variables</TabsTrigger>
                  <TabsTrigger value="file">Upload .env File</TabsTrigger>
                </TabsList>

                <TabsContent value="individual" className="mt-4">
                  <div className="space-y-3">
                    {envVars.map((envVar) => (
                      <div key={envVar.id} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={envVar.key}
                          onChange={(e) => handleEnvVarKeyChange(envVar.id, e.target.value)}
                          className="flex-1 p-2 border bg-muted rounded-md text-sm"
                          placeholder="Variable name"
                          disabled={envVar.isExisting}
                        />
                        <div className="flex-1 relative">
                          <input
                            type={showSecrets[envVar.id] ? "text" : "password"}
                            value={envVar.value}
                            onChange={(e) => handleEnvVarValueChange(envVar.id, e.target.value)}
                            className="w-full p-2 border bg-muted rounded-md text-sm pr-10"
                            placeholder={
                              envVar.isExisting
                                ? "Enter new value (current value hidden)"
                                : "Variable value"
                            }
                          />
                          <button
                            type="button"
                            onClick={() => toggleSecretVisibility(envVar.id)}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showSecrets[envVar.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeEnvVar(envVar.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}

                    {envVars.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No environment variables configured
                      </p>
                    )}

                    <Button type="button" variant="outline" onClick={addEnvVar} className="w-full">
                      Add Variable
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="file" className="mt-4">
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        ref={envFileInputRef}
                        onChange={handleEnvFileUpload}
                        accept=".env"
                        className="hidden"
                      />
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-sm text-muted-foreground mb-2">Upload a .env file</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => envFileInputRef.current?.click()}
                      >
                        Choose .env File
                      </Button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Or paste .env content:
                      </label>
                      <textarea
                        value={envFileContent}
                        onChange={(e) => {
                          setEnvFileContent(e.target.value);
                          parseEnvFile(e.target.value);
                        }}
                        className="w-full h-32 p-3 border rounded-md font-mono text-sm bg-muted resize-none"
                        placeholder="KEY1=value1&#10;KEY2=value2&#10;# Comments are supported"
                      />
                    </div>

                    {envVars.length > 0 && (
                      <div className="text-sm text-green-600">
                        Parsed {envVars.length} environment variable(s)
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <Button onClick={submit} disabled={loading || !functionCode.trim()} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" />
                  {functionDetails ? "Updating Function..." : "Creating Function..."}
                </>
              ) : functionDetails ? (
                "Update Function"
              ) : (
                "Create Function"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
