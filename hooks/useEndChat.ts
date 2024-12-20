import { useCurrentUsersContext } from "@/lib/context/CurrentUsersContext";
import { db } from "@/lib/firebase";
import { creatorUser } from "@/types";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { trackEvent } from "@/lib/mixpanel";

interface User2 {
	_id: string;
	clientId: string;
	creatorId: string;
	request: string;
	fullName: string;
	photo: string;
	User_First_Seen: string;
	phone: string;
}

interface Chat {
	startedAt: number;
	callId?: string;
	endedAt?: number;
	messages: {
		senderId: string;
		text: string;
		createdAt: number;
		tip: string;
		img: string;
		audio: string;
		seen: boolean;
	}[];
}

const useEndChat = () => {
	const router = useRouter();
	const { currentUser, userType } = useCurrentUsersContext();
	const { chatId } = useParams();
	const [user2, setUser2] = useState<User2>();
	const [chat, setChat] = useState<Chat | undefined>();
	const [chatEnded, setChatEnded] = useState(false);
	const [chatRatePerMinute, setChatRatePerMinute] = useState(0);
	const [endedAt, setEndedAt] = useState<number>();
	const [startedAt, setStartedAt] = useState<number>();
	const [loading, setLoading] = useState(false);
	const hasChatEnded = useRef(false);
	const [creatorPhone, setCreatorPhone] = useState("");

	// Function to update expert's status
	// const updateExpertStatus = async (phone: string, status: string) => {
	// 	try {
	// 		const response = await fetch("/api/set-status", {
	// 			method: "POST",
	// 			headers: {
	// 				"Content-Type": "application/json",
	// 			},
	// 			body: JSON.stringify({ phone, status }),
	// 		});

	// 		const data = await response.json();
	// 		if (!response.ok) {
	// 			throw new Error(data.message || "Failed to update status");
	// 		}

	// 		console.log("Expert status updated to:", status);
	// 	} catch (error) {
	// 		Sentry.captureException(error);
	// 		console.error("Error updating expert status:", error);
	// 	}
	// };

	useEffect(() => {
		const getCreator = () => {
			const storedCreator = localStorage.getItem("currentCreator");
			if (storedCreator) {
				const parsedCreator: creatorUser = JSON.parse(storedCreator);
				if (parsedCreator.chatRate) {
					setChatRatePerMinute(parseInt(parsedCreator.chatRate, 10));
					setCreatorPhone(parsedCreator?.phone);
				}
			}
		};

		if (chatId) getCreator();
	}, []);

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
		if (hasChatEnded.current === true) return;

		if (chatEnded) {
			hasChatEnded.current = true;
			// if (userType === 'client')
			// updateExpertStatus(creatorPhone, "Online");
			if (userType === "creator") router.replace(`/home`);
			else {
				localStorage.removeItem("chatRequestId");
				localStorage.removeItem("chatId");
				localStorage.removeItem("user2");
				router.replace(`/chat-ended/${chatId}/${chat?.callId}/${user2?.clientId}`);
			}
		}
	}, [chatEnded]);

	useEffect(() => {
		const storedUser = localStorage.getItem("user2");
		if (storedUser) {
			setUser2(JSON.parse(storedUser));
		}
	}, [chatId]);

	const handleEnd = async (
		chatId: string | string[],
		user2: User2 | undefined,
		endedBy: string
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

			localStorage.removeItem("chatRequestId");
			localStorage.removeItem("chatId");
			localStorage.removeItem("user2");

			trackEvent("BookCall_Chat_Ended", {
				Client_ID: user2?.clientId,
				User_First_Seen: user2?.User_First_Seen,
				Creator_ID: user2?.creatorId,
				Time_Duration_Available: (endedAt! - startedAt!).toString(),
				Walletbalace_Available: currentUser?.walletBalance,
				Endedby: endedBy,
			});

			// logEvent(analytics, "call_ended", {
			// 	userId: currentUser?._id,
			// 	// creatorId: creator._id,
			// });
		} catch (error) {
			Sentry.captureException(error);
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
		chatRatePerMinute,
		loading,
	};
};

export default useEndChat;
