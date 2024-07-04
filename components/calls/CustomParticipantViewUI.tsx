"use client";

import { useEffect, useState } from "react";
import { useCall, useParticipantViewContext } from "@stream-io/video-react-sdk";
import { LucidePictureInPicture2, PictureInPicture } from "lucide-react";

const CustomParticipantViewUI = () => {
	const { videoElement } = useParticipantViewContext();
	const [pictureInPictureElement, setPictureInPictureElement] = useState(
		document.pictureInPictureElement
	);
	const call = useCall();
	const [isScaled, setIsScaled] = useState(false);

	console.log(call?.camera?.state?.status);

	useEffect(() => {
		if (!videoElement) return;

		const handlePictureInPicture = () => {
			setPictureInPictureElement(document.pictureInPictureElement);
		};

		const handleVisibilityChange = () => {
			if (
				document.hidden &&
				videoElement !== document.pictureInPictureElement
			) {
				togglePictureInPicture();
			}
		};

		videoElement.addEventListener(
			"enterpictureinpicture",
			handlePictureInPicture
		);
		videoElement.addEventListener(
			"leavepictureinpicture",
			handlePictureInPicture
		);

		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			videoElement.removeEventListener(
				"enterpictureinpicture",
				handlePictureInPicture
			);
			videoElement.removeEventListener(
				"leavepictureinpicture",
				handlePictureInPicture
			);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [videoElement]);

	const togglePictureInPicture = async () => {
		try {
			if (videoElement && pictureInPictureElement !== videoElement) {
				await videoElement.requestPictureInPicture();
			} else {
				await document.exitPictureInPicture();
			}
		} catch (error) {
			console.error("PiP toggle error:", error);
		}
	};

	const handleClick = () => {
		togglePictureInPicture();
		setIsScaled((prev) => !prev);
	};

	if (call?.camera?.state?.status !== "enabled") return null;

	return (
		<>
			<button
				disabled={!document.pictureInPictureEnabled}
				onClick={handleClick}
				className={`cursor-pointer rounded-xl bg-[#ffffff14] p-2 hover:bg-[${
					isScaled ? "#4c535b" : "#ffffff14"
				}] transition-all duration-300 active:scale-75 hover:${
					isScaled ? "scale-110" : "scale-100"
				} flex items-center absolute top-0 left-0`}
			>
				{pictureInPictureElement === videoElement ? (
					<LucidePictureInPicture2 />
				) : (
					<PictureInPicture />
				)}
			</button>
		</>
	);
};

export default CustomParticipantViewUI;
