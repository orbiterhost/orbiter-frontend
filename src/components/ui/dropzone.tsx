import type React from "react";
import { useState, useRef, useCallback } from "react";
import { Upload, Folder, File, CircleCheck, CircleX } from "lucide-react";

interface CustomFileDropzoneProps {
  files: File[];
  setFiles: (files: File[]) => void;
  disabled: boolean;
  setIsValid: (isValid: boolean) => void;
}

export function CustomFileDropzone({
  files,
  setFiles,
  disabled,
  setIsValid
}: CustomFileDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [errorMesssage, setErrorMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const maxSize = 15 * 1024 * 1024; // 5MB

  const handleFiles = useCallback(
    (newFiles: FileList | File[]) => {
      setFiles([]);
      setErrorMessage("");
      setIsValid(false)

      const validFiles = Array.from(newFiles).filter((file) => {
        if (file.size > maxSize) {
          console.warn(`File ${file.name} is too large`);
          return false;
        }
        return true;
      });

      // Check if index.html exists among new files or existing files
      const hasIndexHTML = [...files, ...validFiles].some(
        (file) => file.name === "index.html"
      );

      if (!hasIndexHTML) {
        console.warn("No index.html file found");
        setErrorMessage("Missing an index.html file, check your build folder!")
        return;
      }

      setFiles(validFiles);
      setIsValid(true)
    },
    [files, setFiles],
  );

  const onDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragActive(false);

      const items = Array.from(e.dataTransfer.items);
      const allFiles: File[] = [];

      // Function to recursively process directory entries
      const processEntry = async (entry: FileSystemEntry, path = '') => {
        if (entry.isFile) {
          const fileEntry = entry as FileSystemFileEntry;
          return new Promise<void>((resolve) => {
            fileEntry.file((file) => {
              // Create a custom property to store the relative path
              Object.defineProperty(file, 'webkitRelativePath', {
                value: path + file.name,
                writable: true
              });
              allFiles.push(file);
              resolve();
            });
          });
        }
        if (entry.isDirectory) {
          const dirEntry = entry as FileSystemDirectoryEntry;
          const dirReader = dirEntry.createReader();

          return new Promise<void>((resolve) => {
            const readEntries = () => {
              dirReader.readEntries(async (entries) => {
                if (entries.length === 0) {
                  resolve();
                } else {
                  // Add trailing slash to directory names
                  const newPath = path + entry.name + '/';
                  await Promise.all(
                    entries.map((entry) => processEntry(entry, newPath))
                  );
                  readEntries(); // Continue reading if there are more entries
                }
              });
            };
            readEntries();
          });
        }
      };

      // Process all dropped items
      if (items.length > 0) {
        const entries = items
          .map((item) => item.webkitGetAsEntry())
          .filter((entry): entry is FileSystemEntry => entry !== null);

        await Promise.all(entries.map((entry) => processEntry(entry)));
        handleFiles(allFiles);
      } else {
        // Fallback for browsers that don't support directory entries
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const openFileDialog = (isFolder: boolean) => {
    if (isFolder && folderInputRef.current) {
      folderInputRef.current.click();
    } else if (!isFolder && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div>
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragActive
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 hover:border-gray-400"
          }`}
        aria-disabled={disabled}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={onFileInputChange}
          className="hidden"
          disabled={disabled}
        />
        <input
          ref={folderInputRef}
          type="file"
          onChange={onFileInputChange}
          className="hidden"
          //	@ts-ignore
          webkitdirectory=""
          directory=""
          disabled={disabled}
        />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2">Drop Files or Folders Here</p>
        <div className="mt-4 flex justify-center space-x-4">
          <button
            type="button"
            onClick={() => openFileDialog(false)}
            className="px-4 py-2 text-sm bg-white border rounded-md hover:bg-gray-50 flex items-center space-x-2"
            disabled={disabled}
          >
            <File className="h-4 w-4" />
            <span>Select Files</span>
          </button>
          <button
            type="button"
            onClick={() => openFileDialog(true)}
            className="px-4 py-2 text-sm bg-white border rounded-md hover:bg-gray-50 flex items-center space-x-2"
            disabled={disabled}
          >
            <Folder className="h-4 w-4" />
            <span>Select Folder</span>
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Make sure you have an index.html file
        </p>
      </div>
      {errorMesssage && (<p className="text-sm py-2 flex items-center gap-1">
        <div className="w-full flex justify-center">
          <p className="text-sm py-2 flex items-center gap-1">
            <CircleX className="text-red-600 h-4 w-4" />
            {errorMesssage}
          </p>
        </div>
      </p>
      )}

      {files.length > 0 && (
        <div className="w-full flex justify-center">
          <p className="text-sm py-2 flex items-center gap-1">
            <CircleCheck className="text-green-500 h-4 w-4" />
            {files.length} Files Selected
          </p>
        </div>
      )}
    </div>
  );
}
