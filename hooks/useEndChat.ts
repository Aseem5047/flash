import { useCurrentUsersContext } from "@/lib/context/CurrentUsersContext";
import { analytics, db } from "@/lib/firebase";
import { creatorUser } from "@/types";
import { logEvent } from "firebase/analytics";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface User2 {
	_id: string;
	clientId: string;
	creatorId: string;
	request: string;
	fullName: string;
	photo: string;
}

interface Chat {
	startedAt: number;
	endedAt?: number;
	messages: {
		senderId: string;
		text: string;
		createdAt: number;
		img: string;
		audio: string;
		seen: boolean;
	}[];
}

const useEndChat = () => {
	const router = useRouter();
	const { currentUser } = useCurrentUsersContext();
	const { chatId } = useParams();
	const [user2, setUser2] = useState<User2>();
	const [chat, setChat] = useState<Chat | undefined>();
	const [chatEnded, setChatEnded] = useState(false);
	const [chatRatePerMinute, setChatRatePerMinute] = useState(0);
	const [endedAt, setEndedAt] = useState<number>();
	const [startedAt, setStartedAt] = useState<number>();
	const [loading, setLoading] = useState(false);
	const hasCHatEnded = useRef(false);
	useEffect(() => {
		const storedCreator = localStorage.getItem("currentCreator");
		if (storedCreator) {
			const parsedCreator: creatorUser = JSON.parse(storedCreator);
			if (parsedCreator.chatRate) {
				setChatRatePerMinute(parseInt(parsedCreator.chatRate, 10));
			}
		}
	}, [chatId]);

	useEffect(() => {
		if (chatId) {
			const unSub = onSnapshot(
				doc(db, "chats", chatId as string),
				(res: any) => {
					setChat(res.data());
					setStartedAt(res.data().startedAt as number);
					setChatEnded(res.data()?.status === "ended");
					if (res.data()?.status === "ended") {
						setEndedAt(res.data().endedAt); // Update endedAt using useState
					}
				}
			);
			return () => unSub();
		}
	}, [chatId]);

	useEffect(() => {
		if (hasCHatEnded.current === true) return;

		if (chatEnded) {
			hasCHatEnded.current = true;
			router.replace(`/chat-ended/${chatId}/${user2?.clientId}`);
		}
	}, [chatEnded]);

	useEffect(() => {
		const storedUser = localStorage.getItem("user2");
		if (storedUser) {
			setUser2(JSON.parse(storedUser));
		}
	}, [chatId]);

	const markMessagesAsSeen = async () => {
		if (!chatId) return;
		try {
			const chatRef = doc(db, "chats", chatId as string);
			const chatSnapshot = await getDoc(chatRef);
			if (chatSnapshot.exists()) {
				const chatData = chatSnapshot.data();
				const updatedMessages = chatData.messages.map((message: any) => ({
					...message,
					seen: true,
				}));
				await updateDoc(chatRef, { messages: updatedMessages });
			}
		} catch (error) {
			console.error("Error marking messages as seen:", error);
		}
	};

	const handleEnd = async (
		chatId: string | string[],
		user2: User2 | undefined
	) => {
		try {
			setLoading(true);
			const now = Date.now();

			await updateDoc(doc(db, "chats", chatId as string), {
				endedAt: now,
				status: "ended",
			});
			setEndedAt(now); // Update endedAt state

			await updateDoc(doc(db, "userchats", user2?.clientId as string), {
				online: false,
			});
			await updateDoc(doc(db, "userchats", user2?.creatorId as string), {
				online: false,
			});

			logEvent(analytics, "call_ended", {
				userId: currentUser?._id,
				// creatorId: creator._id,
			});
		} catch (error) {
			console.error("Error ending chat:", error);
		}
	};

	return {
		chatId,
		chatEnded,
		handleEnd,
		user2,
		startedAt,
		endedAt,
		chat,
		markMessagesAsSeen,
		chatRatePerMinute,
		loading,
	};
};

export default useEndChat;
