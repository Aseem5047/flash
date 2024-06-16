"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
	CallParticipantsList,
	CallStatsButton,
	CallingState,
	PaginatedGridLayout,
	SpeakerLayout,
	SpeakingWhileMutedNotification,
	useCall,
	useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { useSearchParams } from "next/navigation";
import { Users } from "lucide-react";
import EndCallButton from "../calls/EndCallButton";
import { AudioToggleButton } from "../calls/AudioToggleButton";
import { VideoToggleButton } from "../calls/VideoToggleButton";
import { useUser } from "@clerk/nextjs";
import CallTimer from "../calls/CallTimer";
import { useCallTimerContext } from "@/lib/context/CallTimerContext";

const MeetingRoom = () => {
	const searchParams = useSearchParams();
	const isPersonalRoom = !!searchParams.get("personal");
	const [showParticipants, setShowParticipants] = useState(false);
	const { useCallCallingState, useCallEndedAt, useParticipantCount } =
		useCallStateHooks();
	const [hasJoined, setHasJoined] = useState(false);
	const { user } = useUser();
	const call = useCall();
	const callEndedAt = useCallEndedAt();
	const callHasEnded = !!callEndedAt;

	const isVideoCall = useMemo(() => call?.type === "default", [call]);

	const callingState = useCallCallingState();
	const participantCount = useParticipantCount();

	const { anyModalOpen } = useCallTimerContext();

	// const callStartedAt = call?.state.startsAt;

	// const callStartedTime = new Date(callStartedAt!);

	// console.log(callStartedTime.toLocaleString());

	useEffect(() => {
		const joinCall = async () => {
			if (!hasJoined && callingState !== CallingState.JOINED && !callHasEnded) {
				try {
					await call?.join();
					setHasJoined(true);
				} catch (error: any) {
					if (error.message !== "Illegal State: Already joined") {
						// console.warn("Error joining call:", error);
						console.clear();
					}
				}
			}
		};

		if (!hasJoined && call) {
			call.camera.disable();
			call.microphone.disable();
			joinCall();
		}
	}, [callingState, call, hasJoined, callHasEnded]);
	useEffect(() => {
		let timeoutId: NodeJS.Timeout;

		if (participantCount < 2 || anyModalOpen) {
			timeoutId = setTimeout(() => {
				call?.endCall();
			}, 60000); // 1 minute
		}

		return () => clearTimeout(timeoutId);
	}, [participantCount, anyModalOpen, call]);

	const CallLayoutMobile = useCallback(
		() => <SpeakerLayout participantsBarPosition="bottom" />,
		[]
	);

	const CallLayout = useCallback(() => <PaginatedGridLayout />, []);

	// if (callingState !== CallingState.JOINED) return <Loader />;

	const isMeetingOwner =
		user?.publicMetadata?.userId === call?.state?.createdBy?.id;

	return (
		<section className="relative h-screen w-full overflow-hidden pt-4 text-white bg-dark-2">
			<div className="relative flex size-full items-center justify-center">
				<div className="hidden md:flex size-full max-w-[1000px] items-center">
					<CallLayout />
				</div>
				<div className="flex md:hidden size-full max-w-[500px] items-center">
					<CallLayoutMobile />
				</div>
				{showParticipants && (
					<div className="h-fit w-full fixed right-0 top-0 md:top-2 md:right-2 md:max-w-[400px] rounded-xl ml-2 p-4 z-20 bg-black">
						<CallParticipantsList onClose={() => setShowParticipants(false)} />
					</div>
				)}
			</div>
			{!callHasEnded && isMeetingOwner && <CallTimer />}
			<div className="fixed bottom-0 pb-4 flex flex-wrap-reverse w-full items-center justify-center gap-2 px-4">
				<SpeakingWhileMutedNotification>
					<AudioToggleButton />
				</SpeakingWhileMutedNotification>
				{isVideoCall && <VideoToggleButton />}
				<CallStatsButton />
				<button onClick={() => setShowParticipants((prev) => !prev)}>
					<div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
						<Users size={20} className="text-white" />
					</div>
				</button>
				{!isPersonalRoom && <EndCallButton />}
			</div>
		</section>
	);
};

export default MeetingRoom;
