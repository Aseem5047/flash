import { useEffect, useState, useMemo, useRef } from "react";
import {
	CallParticipantsList,
	CallingState,
	DeviceSettings,
	PaginatedGridLayout,
	SpeakerLayout,
	SpeakingWhileMutedNotification,
	ToggleAudioPublishingButton,
	ToggleVideoPublishingButton,
	useCall,
	useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Users } from "lucide-react";
import EndCallButton from "../calls/EndCallButton";
import CallTimer from "../calls/CallTimer";
import { useCallTimerContext } from "@/lib/context/CallTimerContext";
import { useToast } from "../ui/use-toast";
import useWarnOnUnload from "@/hooks/useWarnOnUnload";
import { VideoToggleButton } from "../calls/VideoToggleButton";
import { AudioToggleButton } from "../calls/AudioToggleButton";
import SinglePostLoader from "../shared/SinglePostLoader";
import SwitchCameraType from "../calls/SwitchCameraType";
import AudioDeviceList from "../calls/AudioDeviceList";
import CustomParticipantViewUI from "../calls/CustomParticipantViewUI";
import CreatorCallTimer from "../creator/CreatorCallTimer";
import { useCurrentUsersContext } from "@/lib/context/CurrentUsersContext";
import * as Sentry from "@sentry/nextjs";
import { useRouter } from "next/navigation";

type CallLayoutType = "grid" | "speaker-bottom";

// Custom hook to track screen size
const useScreenSize = () => {
	const [isMobile, setIsMobile] = useState(false);

	const handleResize = () => {
		setIsMobile(window.innerWidth < 768);
	};

	useEffect(() => {
		handleResize(); // Set initial value
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return isMobile;
};

const MeetingRoom = () => {
	const [showParticipants, setShowParticipants] = useState(false);
	const {
		useCallCallingState,
		useCallEndedAt,
		useParticipantCount,
		useParticipants,
	} = useCallStateHooks();
	const hasAlreadyJoined = useRef(false);
	const [showAudioDeviceList, setShowAudioDeviceList] = useState(false);
	const { currentUser } = useCurrentUsersContext();
	const call = useCall();
	const callEndedAt = useCallEndedAt();
	const callHasEnded = !!callEndedAt;
	const { toast } = useToast();
	const isVideoCall = useMemo(() => call?.type === "default", [call]);
	const [endCallTimeoutId, setEndCallTimeoutId] =
		useState<NodeJS.Timeout | null>(null);
	const callingState = useCallCallingState();
	const participantCount = useParticipantCount();
	const participants = useParticipants();
	const { anyModalOpen } = useCallTimerContext();
	const [layout, setLayout] = useState<CallLayoutType>("grid");

	const router = useRouter();

	useWarnOnUnload("Are you sure you want to leave the meeting?", () => {
		call?.endCall();
	});

	const isMobile = useScreenSize();

	const handleCallRejected = async () => {
		// await call?.endCall().catch((err) => console.warn(err));
		toast({
			variant: "destructive",
			title: "Call Ended",
			description: "Less than 2 Participants",
		});
	};

	useEffect(() => {
		if (isMobile) {
			setLayout("speaker-bottom");
		} else {
			setLayout("grid");
		}
	}, [isMobile]);

	useEffect(() => {
		console.log("3 ... ", callingState);
		const joinCall = async () => {
			console.log("4 ... ", callingState);
			if (
				!call ||
				!currentUser ||
				hasAlreadyJoined.current ||
				callingState === CallingState.JOINED ||
				callingState === CallingState.JOINING ||
				callHasEnded
			) {
				return;
			}
			try {
				const localSessionKey = `meeting_${call.id}_${currentUser._id}`;

				if (localStorage.getItem(localSessionKey)) {
					toast({
						variant: "destructive",
						title: "Already in Call",
						description: "You are already in this meeting in another tab.",
					});
					router.replace("/home");
					return;
				}
				if (callingState === CallingState.IDLE) {
					await call?.accept();
					await call?.join();
					localStorage.setItem(localSessionKey, "joined");
					hasAlreadyJoined.current = true;
					if (isVideoCall) call?.camera?.enable();
					call?.microphone?.enable();
				}
			} catch (error) {
				console.warn("Error Joining Call ", error);
			}
		};

		if (call) {
			joinCall();
		}
	}, [call, callingState, currentUser, callHasEnded, participantCount]);

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

	useEffect(() => {
		let timeoutId: NodeJS.Timeout;

		if (participants.length < 2) {
			// handleGracePeriodForCallEnd();
			call?.on("call.session_participant_left", handleCallRejected);
		}

		if (participants.length < 2 || anyModalOpen) {
			timeoutId = setTimeout(async () => {
				toast({
					variant: "destructive",
					title: "Call Ended",
					description: "Less than 2 Participants",
				});
				await call?.endCall();
			}, 60000); // 1 minute
		}

		return () => clearTimeout(timeoutId);
	}, [participantCount, anyModalOpen, call]);

	const toggleCamera = async () => {
		if (call && call.camera) {
			try {
				await call.camera.flip();
			} catch (error) {
				Sentry.captureException(error);
				console.error("Error toggling camera:", error);
			}
		}
	};

	const CallLayout = useMemo(() => {
		switch (layout) {
			case "grid":
				return <PaginatedGridLayout />;
			default:
				return (
					<SpeakerLayout
						participantsBarPosition="bottom"
						ParticipantViewUIBar={<CustomParticipantViewUI />}
						ParticipantViewUISpotlight={<CustomParticipantViewUI />}
					/>
				);
		}
	}, [layout]);

	const isMeetingOwner = currentUser?._id === call?.state?.createdBy?.id;

	if (callingState !== CallingState.JOINED) {
		return (
			<section
				className="w-full h-screen flex items-center justify-center"
				style={{ height: "calc(var(--vh, 1vh) * 100)" }}
			>
				<SinglePostLoader />
			</section>
		);
	}

	return (
		<section
			className="relative w-full overflow-hidden pt-4 text-white bg-dark-2"
			style={{ height: "calc(var(--vh, 1vh) * 100)" }}
		>
			<div className="relative flex size-full items-center justify-center transition-all">
				<div className="flex size-full max-w-[95%] md:max-w-[1000px] items-center transition-all">
					{CallLayout}
				</div>

				{showParticipants && (
					<div className="h-fit w-full fixed right-0 top-0 md:top-2 md:right-2 md:max-w-[400px] rounded-xl ml-2 p-4 z-20 bg-black transition-all">
						<CallParticipantsList onClose={() => setShowParticipants(false)} />
					</div>
				)}
			</div>

			{!callHasEnded && isMeetingOwner ? (
				<CallTimer
					handleCallRejected={handleCallRejected}
					isVideoCall={isVideoCall}
				/>
			) : (
				call && <CreatorCallTimer callId={call.id} />
			)}

			{/* Call Controls */}

			<section className="call-controls fixed bg-dark-1 bottom-0 flex w-full items-center justify-start py-2 px-4 transition-all">
				<div className="flex overflow-x-scroll no-scrollbar w-fit px-4 items-center mx-auto justify-start gap-4">
					{/* Audio Button */}
					<SpeakingWhileMutedNotification>
						{isMobile ? <AudioToggleButton /> : <ToggleAudioPublishingButton />}
					</SpeakingWhileMutedNotification>

					{/* Audio Device List */}
					{isMobile && (
						<AudioDeviceList
							showAudioDeviceList={showAudioDeviceList}
							setShowAudioDeviceList={setShowAudioDeviceList}
						/>
					)}

					{/* Video Button */}
					{isVideoCall &&
						(isMobile ? (
							<VideoToggleButton />
						) : (
							<ToggleVideoPublishingButton />
						))}

					{/* Switch Camera */}
					{isVideoCall && isMobile && (
						<SwitchCameraType toggleCamera={toggleCamera} />
					)}

					<Tooltip>
						<TooltipTrigger className="hidden md:block">
							<button onClick={() => setShowParticipants((prev) => !prev)}>
								<div className="cursor-pointer rounded-full bg-[#ffffff14] p-3 hover:bg-[#4c535b] flex items-center">
									<Users size={20} className="text-white" />
								</div>
							</button>
						</TooltipTrigger>
						<TooltipContent className="mb-2 bg-gray-700  border-none">
							<p className="!text-white">Participants</p>
						</TooltipContent>
					</Tooltip>

					{/* End Call Button */}
					<Tooltip>
						<TooltipTrigger>
							<EndCallButton />
						</TooltipTrigger>
						<TooltipContent className="hidden md:block mb-2 bg-red-500  border-none">
							<p className="!text-white">End Call</p>
						</TooltipContent>
					</Tooltip>

					{isVideoCall && (
						<div className="absolute bottom-3 right-4 z-20 w-fit hidden md:flex items-center gap-2">
							<DeviceSettings />
						</div>
					)}
				</div>
			</section>
		</section>
	);
};

export default MeetingRoom;
