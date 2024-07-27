import { useCallback, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { Button } from "../ui/button";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

type FileUploaderProps = {
	fieldChange: (url: string) => void;
	mediaUrl: string;
};

const FileUploader = ({ fieldChange, mediaUrl }: FileUploaderProps) => {
	const [fileUrl, setFileUrl] = useState(mediaUrl);
	const [uploadProgress, setUploadProgress] = useState(0);

	const onDrop = useCallback(
		(acceptedFiles: FileWithPath[]) => {
			const file = acceptedFiles[0];
			const fileRef = ref(storage, `uploads/${file.name}`);
			const uploadTask = uploadBytesResumable(fileRef, file);

			uploadTask.on(
				"state_changed",
				(snapshot) => {
					const progress =
						(snapshot.bytesTransferred / snapshot.totalBytes) * 100;
					setUploadProgress(progress);
					console.log(`Upload is ${progress}% done`);
				},
				(error) => {
					console.error("Upload failed", error);
				},
				() => {
					getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
						setFileUrl(downloadURL);
						console.log("File available at", downloadURL);
						fieldChange(downloadURL); // Pass URL to the parent
					});
				}
			);
		},
		[fieldChange]
	);

	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
		accept: {
			"image/*": [".png", ".jpeg", ".jpg"],
		},
	});

	return (
		<div
			{...getRootProps()}
			className="flex items-center justify-center flex-col rounded-xl cursor-pointer"
		>
			<input {...getInputProps()} className="cursor-pointer" />

			{fileUrl ? (
				<>
					<div className="flex flex-1 items-center justify-center w-full pt-2 ">
						<img src={fileUrl} alt="image" className="file_uploader-img" />
					</div>
					<p className="file_uploader-label">Click or drag photo to replace</p>
				</>
			) : (
				<div className="file_uploader-box ">
					<img
						src="/icons/file-upload.svg"
						width={96}
						height={77}
						alt="file upload"
					/>

					<h3 className="base-medium text-light-2 mb-2 mt-6">
						Drag photo here
					</h3>
					<p className="text-light-4 small-regular mb-6">SVG, PNG, JPG</p>

					<Button type="button" className="shad-button_dark_4">
						Select from computer
					</Button>
				</div>
			)}

			{uploadProgress > 0 && uploadProgress < 100 && "Uploading"}
		</div>
	);
};

export default FileUploader;
