"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
	arrayUnion,
	doc,
	getDoc,
	onSnapshot,
	updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import upload from "../../lib/upload";
import Messages from "@/components/chat/Messages";
import ChatInput from "@/components/chat/ChatInput";
import useUserStatus from "@/hooks/useUserStatus";
import useMediaRecorder from "@/hooks/useMediaRecorder";
import ChatTimer from "./ChatTimer";
import EndCallDecision from "../calls/EndCallDecision";
import useEndChat from "@/hooks/useEndChat";
import { useCurrentUsersContext } from "@/lib/context/CurrentUsersContext";
import CreatorChatTimer from "../creator/CreatorChatTimer";
import Tip from "./Tip";
import useMarkAsSeen from "@/hooks/useMarkAsSeen";

const ChatInterface: React.FC = () => {
	const [text, setText] = useState<string>("");
	const [isImgUploading, setIsImgUploading] = useState(false);
	const [isAudioUploading, setIsAudioUploading] = useState(false);
	const [showDialog, setShowDialog] = useState(false);
	const [receiverId, setReceiverId] = useState(null);
	const [img, setImg] = useState({
		file: null,
		url: "",
	});
	const [audio, setAudio] = useState<{ file: Blob | null; url: string }>({
		file: null,
		url: "",
	});
	const [messages, setMessages] = useState<
		{ text: string | null; img: string | null; audio: string | null, tip: string | null }[]
	>([]);

	useUserStatus();

	const { handleEnd, chat, user2, chatId } = useEndChat();
	const { markMessagesAsSeen } = useMarkAsSeen();
	const { currentUser, userType } = useCurrentUsersContext();
	const {
		audioStream,
		isRecording,
		setMp3Blob,
		mp3Blob,
		startRecording,
		stopRecording,
		setAudioStream,
		mediaRecorderRef,
		setIsRecording,
	} = useMediaRecorder();

	useEffect(() => {
		const updateChatStartedAt = async () => {
			if (!chatId) return; // Exit if chatId is not available

			try {
				// Get the document with the provided chatId
				const chatDocRef = doc(db, "chats", chatId as string);
				const chatDocSnap = await getDoc(chatDocRef);

				if (chatDocSnap.exists()) {
					const chatData = chatDocSnap.data();

					// Check if the status is "active"
					if (!chatData.timerSet) {
						// If status is not active, update startedAt
						await updateDoc(chatDocRef, {
							startedAt: Date.now(),
							endedAt: null,
							timerSet: true,
						});
					}
					// If status is active, do nothing
				} else {
					console.error("No such chat document!");
				}
			} catch (error) {
				console.error("Error fetching or updating chat document: ", error);
			}
		};

		updateChatStartedAt();
	}, [chatId]); // Add chatId as a dependency

	useEffect(() => {
		const fetchReceiverId = async () => {
			try {
				const currentUserChatsRef = doc(
					db,
					"userchats",
					currentUser?._id as string
				);
				const currentUserChatsSnapshot = await getDoc(currentUserChatsRef);

				if (currentUserChatsSnapshot.exists()) {
					const currentUserChatsData = currentUserChatsSnapshot.data();
					const chat = currentUserChatsData.chats.find(
						(c: { chatId: string | string[] }) => c.chatId === chatId
					);
					setReceiverId(chat ? chat.receiverId : null);
				}
			} catch (error) {
				console.error("Error fetching receiver ID:", error);
			}
		};
		fetchReceiverId();
	}, [chatId, currentUser?._id, messages, db]);

	useEffect(() => {
		if (!receiverId) return;
		const unsubscribe = onSnapshot(
			doc(db, "userchats", receiverId),
			(docSnapshot) => {
				if (docSnapshot.exists()) {
					const data = docSnapshot.data();
					if (data.online) {
						markMessagesAsSeen();
						setReceiverId(null);
					}
				}
			}
		);
		return () => unsubscribe();
	}, [receiverId, db]);

	const handleCapturedImg = (e: any) => {
		if (e.target.files && e.target.files[0]) {
			console.log("hehe");
			setImg({
				file: e.target.files[0],
				url: URL.createObjectURL(e.target.files[0]),
			});
			handleSend();
		}
	};

	const handleImg = (e: any) => {
		console.log("hehe");
		if (e.target.files && e.target.files[0]) {
			console.log("hehe2");
			setImg({
				file: e.target.files[0],
				url: URL.createObjectURL(e.target.files[0]),
			});
		}
	};

	const handleAudio = async (): Promise<string | null> => {
		if (audio.file) {
			const audioUrl = await upload(audio.file, "audio");
			return audioUrl;
		}
		return null;
	};

	const handleSendTip = async (tipAmt: string) => {
		if (!tipAmt) {
			console.log("Got nothing");
			return
		};

		try {
			if (!chatId) {
				console.log("invalid chatId");
				return;
			}
			await updateDoc(doc(db, "chats", chatId as string), {
				messages: arrayUnion({
					senderId: currentUser?._id as string,
					createdAt: Date.now(),
					seen: false,
					text,
					tip: tipAmt,
					img: null,
					audio: null,
				}),
			});
			setMessages((prevMessages) => [
				...prevMessages,
				{ text: null, img: null, audio: null, tip: null },
			]);
			const userIDs = [user2?.clientId as string, user2?.creatorId as string];
			userIDs.forEach(async (id) => {
				if (!id) return;
				const userChatsRef = doc(db, "userchats", id);
				const userChatsSnapshot = await getDoc(userChatsRef);
				if (userChatsSnapshot.exists()) {
					const userChatsData = userChatsSnapshot.data();
					const chatIndex = userChatsData.chats.findIndex(
						(c: { chatId: string | string[] }) => c.chatId === chatId
					);
					userChatsData.chats[chatIndex].updatedAt = Date.now();
					await updateDoc(userChatsRef, {
						chats: userChatsData.chats,
					});
				}
			});
		} catch (error) {
			console.error(error);
		} finally {
			setText("");
		}
	}

	const handleSend = async () => {
		console.log("Triggered");
		if (text === "" && !img.file && !audio.file) {
			console.log("Got nothing");
			return
		};
		console.log(text);
		let imgUrl: string | null = null;
		let audioUrl: string | null = null;
		try {
			if (!chatId) {
				console.log("invalid chatId");
				return;
			}
			if (img.file) {
				setIsImgUploading(true);
				imgUrl = await upload(img.file, "image");
				setIsImgUploading(false);
			}
			if (audio.file) {
				setIsAudioUploading(true);
				audioUrl = await handleAudio();
				setIsAudioUploading(false);
			}
			await updateDoc(doc(db, "chats", chatId as string), {
				messages: arrayUnion({
					senderId: currentUser?._id as string,
					createdAt: Date.now(),
					seen: false,
					text,
					img: imgUrl,
					audio: audioUrl,
				}),
			});
			setMessages((prevMessages) => [
				...prevMessages,
				{ text: null, img: imgUrl, audio: audioUrl, tip: null },
			]);
			const userIDs = [user2?.clientId as string, user2?.creatorId as string];
			userIDs.forEach(async (id) => {
				if (!id) return;
				const userChatsRef = doc(db, "userchats", id);
				const userChatsSnapshot = await getDoc(userChatsRef);
				if (userChatsSnapshot.exists()) {
					const userChatsData = userChatsSnapshot.data();
					const chatIndex = userChatsData.chats.findIndex(
						(c: { chatId: string | string[] }) => c.chatId === chatId
					);
					userChatsData.chats[chatIndex].updatedAt = Date.now();
					await updateDoc(userChatsRef, {
						chats: userChatsData.chats,
					});
				}
			});
		} catch (error) {
			console.error(error);
		} finally {
			setImg({
				file: null,
				url: "",
			});
			setAudio({
				file: null,
				url: "",
			});
			setText("");
		}
	};

	useEffect(() => {
		let link;
		if (mp3Blob) {
			link = URL.createObjectURL(mp3Blob);
			setAudio({
				file: mp3Blob,
				url: link,
			});
		}
		handleSendAudio(mp3Blob!, link!);
	}, [mp3Blob]);

	const handleSendAudio = async (audioBlob: Blob, audioUrl: string) => {
		setIsAudioUploading(true);

		let imgUrl = null;

		try {
			const audioUploadUrl = await upload(audioBlob, "audio");
			await updateDoc(doc(db, "chats", chatId as string), {
				messages: arrayUnion({
					senderId: currentUser?._id as string,
					createdAt: Date.now(),
					seen: false,
					text: null,
					img: imgUrl,
					audio: audioUploadUrl,
				}),
			});

			const userIDs = [user2?.clientId as string, user2?.creatorId as string];

			userIDs.forEach(async (id) => {
				const userChatsRef = doc(db, "userchats", id);
				const userChatsSnapshot = await getDoc(userChatsRef);

				if (userChatsSnapshot.exists()) {
					const userChatsData = userChatsSnapshot.data();
					const chatIndex = userChatsData.chats.findIndex(
						(c: { chatId: string | string[] }) => c.chatId === chatId
					);
					userChatsData.chats[chatIndex].updatedAt = Date.now();
					await updateDoc(userChatsRef, {
						chats: userChatsData.chats,
					});
				}
			});
		} catch (error) {
			console.error(error);
		} finally {
			setIsAudioUploading(false);
			setAudio({
				file: null,
				url: "",
			});
			setMp3Blob(null);

			if (audioStream) {
				audioStream.getTracks().forEach((track) => track.stop());
				setAudioStream(null);
			}
			if (mediaRecorderRef.current) {
				mediaRecorderRef.current.stop();
			}
		}
	};

	const toggleRecording = () => {
		if (isRecording) {
			stopRecording();
		} else {
			startRecording();
		}
	};

	const discardAudio = () => {
		setIsAudioUploading(false);
		setIsRecording(false);
		setAudio({
			file: null,
			url: "",
		});

		if (audioStream) {
			audioStream.getTracks().forEach((track) => track.stop());
			setAudioStream(null);
		}
		if (mediaRecorderRef.current) {
			mediaRecorderRef.current.onstop = null;
			mediaRecorderRef.current.stop();
		}
	};

	const endCall = async () => {
		setShowDialog(true);
	};

	const handleDecisionDialog = async () => {
		await handleEnd(chatId as string, user2, userType as string);
		setShowDialog(false);
	};

	const discardImage = () => {
		setIsImgUploading(false);
		setImg({
			file: null,
			url: "",
		});
	};

	const handleCloseDialog = () => {
		setShowDialog(false);
	};

	function maskPhoneNumber(phoneNumber: string) {
		// Remove the '+91' prefix
		if (phoneNumber) {

			let cleanedNumber = phoneNumber.replace('+91', '');

			// Mask the next 5 digits, leaving the first 2 digits unmasked
			let maskedNumber = cleanedNumber.substring(0, 2) + '*****' + cleanedNumber.substring(7);

			return maskedNumber;
		}
	}

	useEffect(() => {
		const handleResize = () => {
			const height = window.innerHeight;
			document.documentElement.style.setProperty("--vh", `${height * 0.01}px`);
		};

		window.addEventListener("resize", handleResize);
		handleResize();

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	return (
		<div className={`flex flex-col h-screen justify-between w-screen bg-cover bg-center overflow-y-auto scrollbar-hide`} style={{ backgroundImage: 'url(/back.png)' }} >
			<div className="fixed top-0 left-0 w-full flex justify-between items-center px-4 py-[2px] bg-gray-500 z-30">
				<div className="flex items-center gap-2">
					<Image
						src={`${user2?.photo ? user2?.photo : 'https://firebasestorage.googleapis.com/v0/b/flashcallchat.appspot.com/o/assets%2FM_preview.png?alt=media&token=750fc704-c540-4843-9cbd-bfc4609780e0'}`}
						alt="profile"
						width={1000}
						height={1000}
						className="size-10 min-w-10 rounded-full object-cover"
					/>
					<div className="flex flex-col">
						<div className="text-white font-bold text-xs md:text-lg">
							{user2?.fullName ? user2?.fullName : maskPhoneNumber(user2?.phone as string)}
						</div>
						{userType === "client" && <ChatTimer />}
						{userType === "creator" && (
							<CreatorChatTimer chatId={chatId as string} />
						)}
						<p className="text-[10px] md:text-sm text-green-500">
							Ongoing chat
						</p>
					</div>
				</div>
				<div className="flex gap-2">
					<Tip
						handleSendTip={handleSendTip}
						setText={setText}
					/>
					<button
						onClick={endCall}
						className="bg-[rgba(255,81,81,1)] text-white p-2 md:px-4 md:py-2 text-[10px] md:text-lg rounded-lg"
					>
						End
					</button>
				</div>
			</div>
			{showDialog && (
				<EndCallDecision
					handleDecisionDialog={handleDecisionDialog}
					setShowDialog={handleCloseDialog}
				/>
			)}
			<div className="mt-auto pt-[50px]">
				{/* Chat Messages */}
				<div className="mb-[56px] z-20">
					<Messages chat={chat!} img={img} isImgUploading={isImgUploading} />
				</div>

				{/* Sticky Chat Input at the Bottom */}
				<div className="fixed bottom-0 w-full z-30 bg-cover bg-center p-safe-bottom" style={{ backgroundImage: 'url(/back.png)' }}>
					<ChatInput
						isRecording={isRecording}
						discardAudio={discardAudio}
						text={text}
						setText={setText}
						handleImg={handleImg}
						handleSend={handleSend}
						toggleRecording={toggleRecording}
						img={img}
						audio={audio}
						audioStream={audioStream!}
						// audioContext={audioContext}
						handleCapturedImg={handleCapturedImg}
						isImgUploading={isImgUploading}
						isAudioUploading={isAudioUploading}
						discardImage={discardImage}
					/>
				</div>
			</div>
		</div>
	);
};

export default ChatInterface;
