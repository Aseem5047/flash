"use client";

import { tokenProvider } from "@/lib/actions/stream.actions";
import Loader from "@/components/shared/Loader";
import { useUser } from "@clerk/nextjs";
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { ReactNode, useEffect, useState } from "react";
import MyCallUI from "@/components/meeting/MyCallUI";
import { useCurrentUsersContext } from "@/lib/context/CurrentUsersContext";

const API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;

const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
	const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(
		null
	);
	const [loading, setLoading] = useState(true);
	const { currentUser } = useCurrentUsersContext();
	const userId = currentUser?._id as string | undefined;

	useEffect(() => {
		const initializeVideoClient = async () => {
			if (!currentUser || !userId) {
				setLoading(false);
				return;
			}

			if (!API_KEY) throw new Error("Stream API key is missing");

			try {
				const client = new StreamVideoClient({
					apiKey: API_KEY,
					user: {
						id: userId,
						name: currentUser?.username || userId,
						image: currentUser?.photo as string,
					},
					tokenProvider: tokenProvider,
				});
				setVideoClient(client);
			} catch (error) {
				console.error("Failed to initialize StreamVideoClient:", error);
			} finally {
				setLoading(false);
			}
		};

		initializeVideoClient();
	}, [currentUser?._id, userId]);

	// if (loading) {
	// 	return (
	// 		<div className="flex items-center justify-center w-full h-screen">
	// 			<Loader />
	// 		</div>
	// 	);
	// }

	return videoClient ? (
		<StreamVideo client={videoClient}>
			<MyCallUI />
			{children}
		</StreamVideo>
	) : (
		<>{children}</>
	);
};

export default StreamVideoProvider;
