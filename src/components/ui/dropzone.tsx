"use client";

import React, { useState, useRef, useCallback } from "react";
import { Upload, X } from "lucide-react";

interface CustomFileDropzoneProps {
	files: File[];
	setFiles: (files: File[]) => void;
}

export function CustomFileDropzone({
	files,
	setFiles,
}: CustomFileDropzoneProps) {
	const [isDragActive, setIsDragActive] = useState(false);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const maxFiles = 5;
	const maxSize = 5 * 1024 * 1024;
	const acceptedFileTypes = ["*/*"];

	const handleFiles = useCallback(
		(newFiles: FileList) => {
			const validFiles = Array.from(newFiles).filter((file) => {
				if (file.size > maxSize) {
					console.warn(`File ${file.name} is too large`);
					return false;
				}
				if (
					acceptedFileTypes.length > 0 &&
					!acceptedFileTypes.some((type) =>
						file.type.match(type.replace("*", ".*")),
					)
				) {
					console.warn(`File ${file.name} is not an accepted file type`);
					return false;
				}
				return true;
			});

			const newValidFiles = [...files, ...validFiles].slice(0, maxFiles);
			setFiles(newValidFiles);
		},
		[files, setFiles],
	);

	const onDrop = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			setIsDragActive(false);
			handleFiles(e.dataTransfer.files);
		},
		[handleFiles],
	);

	const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragActive(true);
	}, []);

	const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragActive(false);
	}, []);

	const openFileDialog = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			handleFiles(e.target.files);
		}
	};

	const removeFile = (index: number) => {
		const newFiles = [...files];
		newFiles.splice(index, 1);
		setFiles(newFiles);
	};

	return (
		<div>
			<div
				onDrop={onDrop}
				onDragOver={onDragOver}
				onDragLeave={onDragLeave}
				onClick={openFileDialog}
				className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
					isDragActive
						? "border-blue-500 bg-blue-50"
						: "border-gray-300 hover:border-gray-400"
				}`}
			>
				<input
					ref={fileInputRef}
					type="file"
					multiple
					onChange={onFileInputChange}
					accept={acceptedFileTypes.join(",")}
					className="hidden"
				/>
				<Upload className="mx-auto h-12 w-12 text-gray-400" />
				<p className="mt-2">Drop or Select Files</p>
				<p className="mt-1 text-xs text-gray-500">Up to 25MB</p>
			</div>
			{files.length > 0 && (
				<ul className="mt-4 space-y-2">
					{files.map((file, index) => (
						<li
							key={file.name}
							className="flex items-center justify-between text-black bg-white rounded-md p-2"
						>
							<span className="text-sm truncate">{file.name}</span>
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									removeFile(index);
								}}
								className="text-red-500 hover:text-red-700"
							>
								<X className="h-4 w-4" />
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
