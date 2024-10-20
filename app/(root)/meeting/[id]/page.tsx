"use client";

import { useEffect, useRef, useState } from "react";
import {
	StreamCall,
	StreamTheme,
	useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { useParams, useRouter } from "next/navigation";
import Loader from "@/components/shared/Loader";
import { useToast } from "@/components/ui/use-toast";
import { CallTimerProvider } from "@/lib/context/CallTimerContext";
import MeetingRoom from "@/components/meeting/MeetingRoom";
import { useGetCallById } from "@/hooks/useGetCallById";
import { Cursor, Typewriter } from "react-simple-typewriter";
import SinglePostLoader from "@/components/shared/SinglePostLoader";
import ContentLoading from "@/components/shared/ContentLoading";
import { useCurrentUsersContext } from "@/lib/context/CurrentUsersContext";
import {
	backendBaseUrl,
	getDarkHexCode,
	stopMediaStreams,
	updateExpertStatus,
	updateFirestoreSessions,
} from "@/lib/utils";
import useWarnOnUnload from "@/hooks/useWarnOnUnload";

const MeetingPage = () => {
	const { id } = useParams();
	const router = useRouter();
	const { toast } = useToast();
	const { call, isCallLoading } = useGetCallById(id);
	const { currentUser } = useCurrentUsersContext();
	const creatorURL = localStorage.getItem("creatorURL");

	useWarnOnUnload("Are you sure you want to leave the meeting?", () => {
		if (currentUser?._id) {
			navigator.sendBeacon(
				`${backendBaseUrl}/user/setCallStatus/${currentUser._id}`
			);
		}
	});

	useEffect(() => {
		if (!isCallLoading && !call) {
			toast({
				variant: "destructive",
				title: "Call Not Found",
				description: "Redirecting Back...",
			});
			setTimeout(() => {
				router.replace(`${creatorURL ? creatorURL : "/home"}`);
			}, 1000);
		}
	}, [isCallLoading, call, router, toast]);

	if (isCallLoading) return <Loader />;

	if (!call) {
		return (
			<div className="flex flex-col w-full items-center justify-center h-screen gap-7">
				<ContentLoading />
			</div>
		);
	}

	const isVideoCall = call?.type === "default";
	const expert = call?.state?.members?.find(
		(member) => member.custom.type === "expert"
	);
	const isMeetingOwner = currentUser?._id === call?.state?.createdBy?.id;

	return (
		<main className="h-full w-full">
			<StreamCall call={call}>
				<StreamTheme>
					<CallTimerProvider
						isVideoCall={isVideoCall}
						isMeetingOwner={isMeetingOwner}
						expert={expert}
						call={call}
					>
						<MeetingRoomWrapper toast={toast} router={router} call={call} />
					</CallTimerProvider>
				</StreamTheme>
			</StreamCall>
		</main>
	);
};

const MeetingRoomWrapper = ({ toast, router, call }: any) => {
	const { useCallEndedAt } = useCallStateHooks();
	const callEndedAt = useCallEndedAt();
	const callHasEnded = !!callEndedAt;

	if (callHasEnded) {
		return <CallEnded toast={toast} router={router} call={call} />;
	} else {
		return <MeetingRoom />;
	}
};

const CallEnded = ({ toast, router, call }: any) => {
	const [loading, setLoading] = useState(false);
	const [toastShown, setToastShown] = useState(false);
	const transactionHandled = useRef(false);
	const { currentUser, currentTheme } = useCurrentUsersContext();
	const isMeetingOwner = currentUser?._id === call?.state?.createdBy?.id;

	useEffect(() => {
		const handleCallEnd = async () => {
			if (transactionHandled.current) return;
			transactionHandled.current = true;
			try {
				setLoading(true);
				await updateFirestoreSessions(call?.state?.createdBy?.id as string, {
					status: "payment pending",
				});
				await updateExpertStatus(
					call.state.createdBy?.custom?.phone as string,
					"Payment Pending"
				);
				// Show toast notification
				if (!toastShown) {
					toast({
						variant: "destructive",
						title: "Session Has Ended",
						description: "Checking for Pending Transactions ...",
					});
					setToastShown(true);
				}

				router.replace(`/feedback/${call.id}`);
			} catch (error) {
				console.error("Error handling call end", error);
				const creatorURL = localStorage.getItem("creatorURL");
				router.replace(`${creatorURL ? creatorURL : "/home"}`);
			} finally {
				setLoading(false);
			}
		};

		if (isMeetingOwner && !transactionHandled.current) {
			stopMediaStreams();
			handleCallEnd();
		} else if (!isMeetingOwner) {
			stopMediaStreams();
			router.replace(`/home`);
		}
	}, [call?.id, currentUser?._id]);

	if (loading) {
		return (
			<section className="w-full h-screen flex flex-col items-center justify-center gap-4">
				<ContentLoading />
				<h1
					className="text-xl md:text-2xl font-semibold"
					style={{ color: getDarkHexCode(currentTheme) as string }}
				>
					<Typewriter
						words={["Checking Pending Transactions", "Please Wait ..."]}
						loop={true}
						cursor
						cursorStyle="_"
						typeSpeed={50}
						deleteSpeed={50}
						delaySpeed={2000}
					/>
					<Cursor cursorColor={getDarkHexCode(currentTheme) as string} />
				</h1>
			</section>
		);
	}

	return (
		<div className="flex flex-col w-full items-center justify-center h-screen">
			<SinglePostLoader />
		</div>
	);
};

export default MeetingPage;
