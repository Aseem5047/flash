import React, { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import ImageModal from "@/lib/imageModal";
import { useCurrentUsersContext } from "@/lib/context/CurrentUsersContext";
import { format, isSameDay } from "date-fns";
import CustomAudioPlayer from "@/lib/CustomAudioPlayer";
import usePlatform from "@/hooks/usePlatform";

interface Chat {
	messages: {
		senderId: string;
		text: string;
		createdAt: number;
		img: string;
		audio: string;
		seen: boolean;
		tip: string;
	}[];
}

interface Img {
	file: File | null;
	url: string | null;
}

interface Props {
	chat: Chat;
	img: Img;
	isImgUploading: boolean;
}

const Messages: React.FC<Props> = ({ chat, img, isImgUploading }) => {
	const { currentUser } = useCurrentUsersContext();
	const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);
	const { getDevicePlatform } = usePlatform();
	const textSizeClass = getDevicePlatform() === "iOS" ? "text-base" : "text-sm";
	const [hasScrolled, setHasScrolled] = useState<boolean>(false);

	const endRef = useRef<HTMLDivElement | null>(null);
	const handleImageClick = (imageUrl: string) => {
		setFullImageUrl(imageUrl);
	};

	const handleCloseModal = () => {
		setFullImageUrl(null);
	};

	// Use useLayoutEffect for immediate DOM interaction on mount
	useLayoutEffect(() => {
		if (!hasScrolled && chat) {
			endRef.current?.scrollIntoView();
			setHasScrolled(true); // Set flag to true after first scroll
		}
	}, [chat]);

	const formatTime = (timestamp: number) => {
		const date = new Date(timestamp);
		const hours = date.getHours().toString().padStart(2, "0");
		const minutes = date.getMinutes().toString().padStart(2, "0");
		return `${hours}:${minutes}`;
	};

	return (
		<div className="flex-1 p-4">
			<div className="mb-4 text-left">
				{chat?.messages?.map((message, index) => {
					const isCurrentUserMessage =
						message.senderId === (currentUser?._id as string);
					const isNextMessageDifferentSender =
						index < chat.messages.length - 1 &&
						chat.messages[index + 1].senderId !== message.senderId;

					// Apply different margin if the next message is from a different sender
					const marginBottom = isNextMessageDifferentSender ? "mb-3" : "mb-1";
					// Check if this message starts a new day compared to the previous one
					const showDateSeparator =
						index === 0 ||
						!isSameDay(
							new Date(message.createdAt),
							new Date(chat.messages[index - 1]?.createdAt)
						);

					return (
						<React.Fragment key={message?.createdAt}>
							{showDateSeparator && (
								<div className="flex justify-center ">
									<div className="text-center bg-gray-400 opacity-50 rounded-lg py-1 px-2 my-2">
										<div
											className={`text-white text-xs font-bold ${textSizeClass} opacity-100`}
										>
											{format(new Date(message.createdAt), "d MMM, yyyy")}
										</div>
									</div>
								</div>
							)}

							<div
								className={`${isCurrentUserMessage
										? "bg-[#DCF8C6] p-[5px] max-w-[60%] min-w-[40%] lg:min-w-[10%] lg:max-w-[40%] w-fit rounded-lg rounded-tr-none ml-auto text-black text-sm relative"
										: "bg-white p-[5px] max-w-[60%] min-w-[40%] lg:min-w-[10%] lg:max-w-[40%] w-fit rounded-lg rounded-tl-none text-black text-sm leading-5 relative"
									} ${marginBottom}`}
								style={{ wordBreak: "break-word", justifyContent: "center" }}
							>
								{message.img && (
									<div
										className="relative mb-2"
										style={{ display: "inline-block" }}
									>
										<img
											src={message.img}
											alt=""
											className="cursor-pointer rounded-md"
											onClick={() => handleImageClick(message.img)}
											style={{
												width: "200px",
												height: "250px",
												objectFit: "cover",
											}} // Define your desired width and height here
										/>
									</div>
								)}

								{fullImageUrl && (
									<ImageModal
										imageUrl={fullImageUrl}
										onClose={handleCloseModal}
									/>
								)}
								{message.audio && (
									<div className="w-full items-center justify-center mb-1">
										<CustomAudioPlayer
											senderId={message.senderId}
											audioSrc={message.audio}
										/>
									</div>
								)}

								{/* Message Text */}
								<div className="flex flex-col items-start">
									{message.text && (
										<div
											style={{ wordBreak: "break-word", marginBottom: "12px" }}
										>
											{message.text}
										</div>
									)}

									{/* Tip Field */}
									{message.tip && (
										<div
											className="flex w-full items-center justify-between p-2 rounded-md mt-2 bg-gray-600"
											style={{
												border: "1px solid #25D366",
												boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
											}}
										>
											<span className="flex items-center">
												{/* <Image
													src="/tip-icon.svg" // Replace with your icon path
													alt="Tip"
													width={20}
													height={20}
													className="mr-2"
												/> */}
												<span className="text-black font-bold">
													{`Sent to ${isCurrentUserMessage? "creator" : "you" }: ₹${message.tip}`}
												</span>
											</span>
											<span className="text-[8px] text-gray-600 mt-3">
												{formatTime(message.createdAt)}
											</span>
										</div>
									)}
								</div>

								<div
									className={
										message.senderId === (currentUser?._id as string)
											? "rotate-90 absolute right-[-4px] top-[-4px] w-0 h-0 rounded-full border-[8px] border-l-[#DCF8C6] border-r-0 border-solid border-transparent"
											: "rotate-90 absolute left-[-4px] top-[-4px] w-0 h-0 rounded-full border-[8px] border-l-white border-r-0 border-solid border-transparent"
									}
								></div>

								<div
									className={
										message.senderId === (currentUser?._id as string)
											? "w-full flex justify-end items-center absolute bottom-1 right-1"
											: "w-full flex justify-end items-center absolute bottom-1 right-1"
									}
								>
									<span className="text-[10px] text-gray-500 mr-2">
										{formatTime(message.createdAt)}
									</span>

									{message.seen &&
										message.senderId === (currentUser?._id as string) && (
											<Image
												src={"/seen1.svg"}
												width={13}
												height={13}
												alt="seen"
											/>
										)}
								</div>
							</div>
						</React.Fragment>
					);
				})}
				<div ref={endRef}></div>
			</div>
		</div>
	);
};

export default Messages;
