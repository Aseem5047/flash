import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import Razorpay from "razorpay";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import * as Sentry from "@sentry/nextjs";

import { logEvent } from "firebase/analytics";
import { analytics } from "@/lib/firebase";
import { trackEvent } from "./mixpanel";
import GetRandomImage from "@/utils/GetRandomImage";

const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const key_secret = process.env.NEXT_PUBLIC_RAZORPAY_SECRET;

if (!key_id || !key_secret) {
	throw new Error(
		"Razorpay key_id and key_secret must be defined in environment variables"
	);
}

export const razorpay = new Razorpay({
	key_id: key_id,
	key_secret: key_secret,
});

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Base URL's

export const frontendBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
export const backendBaseUrl = process.env.NEXT_PUBLIC_BASE_URL_BACKEND;
// export const backendBaseUrl = "https://backend.flashcall.me/api/v1";

// setBodyBackgroundColor
export const setBodyBackgroundColor = (color: string) => {
	document.body.style.backgroundColor = color;
};

export const resetBodyBackgroundColor = () => {
	document.body.style.backgroundColor = "";
};

// default profile images based on
export const placeholderImages = {
	male: "https://firebasestorage.googleapis.com/v0/b/flashcallchat.appspot.com/o/assets%2FM_preview.png?alt=media&token=33e4f14e-2e14-4c8a-a785-60c762c9ce50",
	female:
		"https://firebasestorage.googleapis.com/v0/b/flashcallchat.appspot.com/o/assets%2FF_preview.png?alt=media&token=63a66328-04ea-4800-8b5f-4ee8f3c6ea67",
	other:
		"https://firebasestorage.googleapis.com/v0/b/flashcallchat.appspot.com/o/assets%2FOthers_preview.png?alt=media&token=07e9bb20-d4fd-45d4-b997-991715464805",
};

export const getProfileImagePlaceholder = (gender?: string): string => {
	const normalizedGender = gender?.toLowerCase() as "male" | "female" | "other";

	if (normalizedGender && placeholderImages[normalizedGender]) {
		return placeholderImages[normalizedGender];
	}

	// If gender is not provided or invalid, return a random image
	return GetRandomImage();
};

export const handleError = (error: unknown) => {
	console.error(error);
	throw new Error(typeof error === "string" ? error : JSON.stringify(error));
};

export const formatDateTime = (dateString: Date) => {
	const dateTimeOptions: Intl.DateTimeFormatOptions = {
		weekday: "short", // abbreviated weekday name (e.g., 'Mon')
		month: "short", // abbreviated month name (e.g., 'Oct')
		day: "numeric", // numeric day of the month (e.g., '25')
		hour: "numeric", // numeric hour (e.g., '8')
		minute: "numeric", // numeric minute (e.g., '30')
		hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
	};

	const dateOptions: Intl.DateTimeFormatOptions = {
		weekday: "short", // abbreviated weekday name (e.g., 'Mon')
		month: "short", // abbreviated month name (e.g., 'Oct')
		year: "numeric", // numeric year (e.g., '2023')
		day: "numeric", // numeric day of the month (e.g., '25')
	};

	const timeOptions: Intl.DateTimeFormatOptions = {
		hour: "numeric", // numeric hour (e.g., '8')
		minute: "numeric", // numeric minute (e.g., '30')
		hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
	};

	const formattedDateTime: string = new Date(dateString).toLocaleString(
		"en-US",
		dateTimeOptions
	);

	const formattedDate: string = new Date(dateString).toLocaleString(
		"en-US",
		dateOptions
	);

	const formattedTime: string = new Date(dateString).toLocaleString(
		"en-US",
		timeOptions
	);

	return {
		dateTime: formattedDateTime,
		dateOnly: formattedDate,
		timeOnly: formattedTime,
	};
};

export const calculateTotalEarnings = (transactions: any) => {
	return transactions.reduce((total: number, transaction: any) => {
		if (transaction.type === "credit") {
			return total + transaction.amount;
		} else if (transaction.type === "debit") {
			return total - transaction.amount;
		}
		return total.toFixed(2); // Default case if type is invalid
	}, 0);
};

export const analyticEvent = ({ action, category, label, value }: any) => {
	(window as any).gtag("event", action, {
		event_category: category,
		event_label: label,
		value: value,
	});
};

export const isValidUrl = (url: string) => {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
};

export const isValidImageUrl = async (url: string) => {
	try {
		// First, check if the URL is a valid URL
		const parsedUrl = new URL(url);

		// Then, fetch the headers to validate the URL points to an image
		const response = await fetch(parsedUrl.toString(), { method: "HEAD" });

		// Check if the response is OK and if the Content-Type is an image type
		const contentType = response.headers.get("Content-Type");
		if (response.ok && contentType && contentType.startsWith("image/")) {
			return true;
		}

		return false;
	} catch (error) {
		// If any error occurs, return false
		console.error("Invalid image URL:", error);
		return false;
	}
};

export const imageSrc = (creator: any) => {
	const isValidUrl = (url: string) => {
		try {
			new URL(url);
			return true;
		} catch {
			return false;
		}
	};

	if (creator.photo && isValidUrl(creator.photo)) {
		return creator.photo;
	} else {
		return (
			getProfileImagePlaceholder(creator.gender) ??
			"/images/defaultProfileImage.png"
		);
	}
};

export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number
) {
	let timeout: ReturnType<typeof setTimeout>;

	return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
		clearTimeout(timeout);
		timeout = setTimeout(() => func.apply(this, args), wait);
	};
}

export const isValidHexColor = (color: string): boolean => {
	// Check if the color is a valid 6-digit or 3-digit hex code
	return /^#([0-9A-F]{3}){1,2}$/i.test(color);
};

// Regular expression to validate username
const usernameRegex = /^[a-zA-Z0-9_-]+$/;

// Function to validate username
export const validateUsername = (username: string) => {
	if (!usernameRegex.test(username)) {
		return false;
	}
	return true;
};

export const updateFirestoreSessions = async (
	userId: string,
	callId: string,
	status: string,
	members: any[]
) => {
	try {
		const SessionDocRef = doc(db, "sessions", userId);
		const SessionDoc = await getDoc(SessionDocRef);
		if (SessionDoc.exists()) {
			await updateDoc(SessionDocRef, {
				ongoingCall: { id: callId, status: status, members },
			});
		} else {
			await setDoc(SessionDocRef, {
				ongoingCall: { id: callId, status: status, members },
			});
		}
	} catch (error) {
		Sentry.captureException(error);
		console.error("Error updating Firestore Sessions: ", error);
	}
};

// Function to update expert's status
export const updateExpertStatus = async (
	phone: string,
	status: string,
	flag?: string
) => {
	try {
		const response = await fetch("/api/set-status", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ phone, status }),
		});

		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.message || "Failed to update status");
		}

		console.log("Expert status updated to:", status);
	} catch (error) {
		Sentry.captureException(error);
		console.error("Error updating expert status:", error);
	}
};

// Stop camera and microphone
export const stopMediaStreams = () => {
	navigator.mediaDevices
		.getUserMedia({ video: true, audio: true })
		.then((mediaStream) => {
			mediaStream.getTracks().forEach((track) => {
				track.stop();
			});
		})
		.catch((error) => {
			console.error("Error stopping media streams: ", error);
		});
};

// calling options helper functions

// Function to fetch the FCM token
export const fetchFCMToken = async (phone: string) => {
	const fcmTokenRef = doc(db, "FCMtoken", phone);
	const fcmTokenDoc = await getDoc(fcmTokenRef);
	return fcmTokenDoc.exists() ? fcmTokenDoc.data().token : null;
};

// Function to track events
export const trackCallEvents = (
	callType: string,
	clientUser: any,
	creator: any
) => {
	const createdAtDate = clientUser?.createdAt
		? new Date(clientUser.createdAt)
		: new Date();
	const formattedDate = createdAtDate.toISOString().split("T")[0];

	if (callType === "audio") {
		trackEvent("BookCall_Audio_Clicked", {
			Client_ID: clientUser._id,
			User_First_Seen: formattedDate,
			Creator_ID: creator._id,
		});
	} else {
		trackEvent("BookCall_Video_initiated", {
			Client_ID: clientUser._id,
			User_First_Seen: formattedDate,
			Creator_ID: creator._id,
		});
	}

	logEvent(analytics, "call_initiated", {
		clientId: clientUser?._id,
		creatorId: creator._id,
	});
};

// Function to send notification
export const sendNotification = async (
	token: string,
	title: string,
	body: string,
	data: any,
	link?: string
) => {
	try {
		const response = await fetch("/api/send-notification", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ token, title, message: body, data, link }),
		});

		if (!response.ok) {
			throw new Error("Failed to send notification");
		}
	} catch (error) {
		console.error("Error sending notification:", error);
	}
};
