import { useCallback, useEffect, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { Button } from "../ui/button";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

import { useToast } from "../ui/use-toast";
import Image from "next/image";
import imageCompression from "browser-image-compression";
import * as Sentry from "@sentry/nextjs";
import { usePathname } from "next/navigation";

type FileUploaderProps = {
	fieldChange: (url: string) => void;
	mediaUrl: string;
	onFileSelect: (file: File) => void;
};

const FileUploader = ({
	fieldChange,
	mediaUrl,
	onFileSelect,
}: FileUploaderProps) => {
	const pathname = usePathname();
	const [fileUrl, setFileUrl] = useState(mediaUrl);
	const [newFileUrl, setNewFileUrl] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const { toast } = useToast();

	// S3 client setup
	const s3Client = new S3Client({
		region: process.env.NEXT_PUBLIC_AWS_REGION!,
		credentials: {
			accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
			secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
		},
	});

	const onDrop = useCallback(
		async (acceptedFiles: FileWithPath[]) => {
			setLoading(true);

			try {
				let file = acceptedFiles[0];

				// Compress and convert the image to WebP format
				const options = {
					maxSizeMB: 0.1,
					maxWidthOrHeight: 1920,
					useWebWorker: true,
					fileType: "image/webp",
				};
				const compressedFile = await imageCompression(file, options);
				onFileSelect(compressedFile);

				const fileName = `${Date.now()}_${compressedFile.name}`;
				const fileStream = compressedFile.stream(); // Use the stream directly

				// S3 bucket params
				const s3Params = {
					Bucket: "flashcall.me",
					Key: `uploads/${fileName}`,
					Body: fileStream,
					ContentType: compressedFile.type,
				};

				// Create an instance of the Upload utility
				const upload = new Upload({
					client: s3Client,
					params: s3Params,
					queueSize: 4,
					leavePartsOnError: false,
				});

				// Execute the upload
				await upload.done();

				// Generate CloudFront URL
				const cloudFrontUrl = `https://dxvnlnyzij172.cloudfront.net/uploads/${fileName}`;

				// Update UI and state
				if (pathname === "/updateDetails") {
					setFileUrl(cloudFrontUrl);
				} else {
					setFileUrl(mediaUrl);
					setNewFileUrl(cloudFrontUrl);
					fieldChange(cloudFrontUrl);
				}

				setLoading(false);
			} catch (error) {
				console.error("Upload error:", error); // Log the error for debugging
				Sentry.captureException(error);
				toast({
					variant: "destructive",
					title: "Unable to Upload Image",
					description: "Please Try Again...",
				});
				setLoading(false);
			}
		},
		[fieldChange, onFileSelect, toast, pathname]
	);

	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
		accept: {
			"image/*": [".png", ".jpeg", ".jpg"],
		},
	});

	useEffect(() => {
		fieldChange(fileUrl);
	}, [fileUrl, fieldChange]);

	if (loading)
		return (
			<div className="flex flex-col items-center justify-center">
				<div
					className={`size-20 md:size-32 rounded-full bg-slate-300 animate-pulse mx-auto`}
				/>
				<div className="flex flex-col items-center justify-normal">
					<Image
						src="/icons/loader.gif"
						width={1000}
						height={1000}
						alt="Loading..."
						className="w-14 h-14"
					/>
				</div>
			</div>
		);

	return (
		<div
			{...getRootProps()}
			className="flex items-center justify-center w-full mx-auto flex-col rounded-xl cursor-pointer"
		>
			<input {...getInputProps()} className="cursor-pointer" />

			{!fileUrl && !loading && !newFileUrl ? (
				<div className="file_uploader-box">
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
			) : (
				<div className="relative flex justify-center items-center">
					{/* Overlay */}
					<div className="absolute inset-0 bg-black/30 rounded-full flex justify-center items-center">
						{/* Icon */}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="size-6 text-white"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
							/>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
							/>
						</svg>
					</div>

					{/* Old Image */}
					{fileUrl && !newFileUrl && (
						<img
							src={fileUrl}
							alt="Current image"
							className={`size-20 md:w-32 md:h-32 rounded-full border-2 border-white object-cover`}
						/>
					)}

					{/* New Image Preview */}
					{newFileUrl && (
						<img
							src={newFileUrl}
							alt="New image preview"
							className={`w-20 h-20 md:w-32 md:h-32 object-cover rounded-full border-2 border-green-500`}
						/>
					)}
				</div>
			)}

			<p className="file_uploader-label">
				{loading ? "" : "Click or drag photo to replace"}
			</p>
		</div>
	);
};

export default FileUploader;
