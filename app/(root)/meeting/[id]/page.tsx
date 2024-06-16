"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
	StreamCall,
	StreamTheme,
	useCall,
	useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Loader from "@/components/shared/Loader";
import { useToast } from "@/components/ui/use-toast";
import {
	CallTimerProvider,
	useCallTimerContext,
} from "@/lib/context/CallTimerContext";
import MeetingRoom from "@/components/meeting/MeetingRoom";
import { useGetCallById } from "@/hooks/useGetCallById";
import { handleTransaction } from "@/utils/TransactionUtils";
import { Cursor, Typewriter } from "react-simple-typewriter";
import { useWalletBalanceContext } from "@/lib/context/WalletBalanceContext";

const MeetingPage = () => {
	const { id } = useParams();
	const searchParams = useSearchParams();
	const router = useRouter();
	const { toast } = useToast();
	const { call, isCallLoading } = useGetCallById(id);
	const { user } = useUser();

	const [isReloading, setIsReloading] = useState(false);

	useEffect(() => {
		const reload = searchParams.get("reload");
		if (reload) {
			setIsReloading(true);
			const url = new URL(window.location.href);
			url.searchParams.delete("reload");
			window.history.replaceState({}, document.title, url.toString());
			window.location.reload();
		}
	}, [searchParams]);

	useEffect(() => {
		if (!isCallLoading && !call) {
			toast({
				title: "Call Not Found",
				description: "Redirecting to HomePage...",
			});
			setTimeout(() => {
				router.push("/");
			}, 3000);
		}
	}, [isCallLoading, call, router, toast]);

	if (isReloading || isCallLoading) return <Loader />;

	if (!call) {
		return (
			<div className="flex flex-col w-full items-center justify-center h-screen gap-7">
				<Image
					src="/icons/notFound.gif"
					alt="Home"
					width={1000}
					height={1000}
					className="w-96 h-auto rounded-xl object-cover"
				/>
			</div>
		);
	}

	const isVideoCall = call?.type === "default";
	const expert = call?.state?.members?.find(
		(member) => member.custom.type === "expert"
	);
	const isMeetingOwner =
		user?.publicMetadata?.userId === call?.state?.createdBy?.id;

	return (
		<main className="h-full w-full">
			<StreamCall call={call}>
				<StreamTheme>
					<CallTimerProvider
						isVideoCall={isVideoCall}
						isMeetingOwner={isMeetingOwner}
						expert={expert}
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
	const callEndedAt = call?.state?.endedAt;
	const callStartsAt = call?.state?.startsAt;
	const { updateWalletBalance } = useWalletBalanceContext();
	const [loading, setLoading] = useState(false);
	const [toastShown, setToastShown] = useState(false);
	const transactionHandled = useRef(false);

	useEffect(() => {
		if (!callEndedAt || !callStartsAt) {
			if (!toastShown) {
				toast({
					title: "Call Has Ended",
					description: "Call data is missing. Redirecting...",
				});
				setToastShown(true);
			}
			setTimeout(() => {
				router.push("/");
			}, 3000);
			return;
		}

		const handleCallEnd = async () => {
			if (transactionHandled.current) {
				return;
			}

			transactionHandled.current = true;
			setLoading(true);

			const callEndedTime = new Date(callEndedAt);
			const callStartsAtTime = new Date(callStartsAt);
			// const now = new Date();
			// const timeDifferenceInMinutes =
			// 	(now.getTime() - callEndedTime.getTime()) / 60000;
			const duration = (
				(callEndedTime.getTime() - callStartsAtTime.getTime()) /
				1000
			).toFixed(2);

			if (!toastShown) {
				toast({
					title: "Call Has Ended",
					description: "Redirecting ...",
				});
				setToastShown(true);
			}

			await handleTransaction({
				call,
				callId: call?.id,
				duration: duration,
				isVideoCall: call?.type === "default",
				toast,
				router,
			});

			// Update wallet balance after transaction
			updateWalletBalance();
		};

		handleCallEnd();
	}, [router, callEndedAt, callStartsAt, call?.id]);

	if (loading) {
		return (
			<section className="w-full h-screen flex flex-col items-center justify-center gap-4">
				<div className="flex flex-col justify-center items-start gap-5 rounded-lg max-w-lg h-fit w-full mx-auto animate-pulse">
					<div className="flex items-center space-x-4 w-full">
						<div className="rounded-full bg-slate-300 h-12 w-12"></div>
						<div className="flex-1 space-y-4 py-1">
							<div className="h-3 bg-slate-300 rounded w-3/4"></div>
							<div className="space-y-3">
								<div className="grid grid-cols-3 gap-4">
									<div className="h-2 bg-slate-300 rounded col-span-2"></div>
									<div className="h-2 bg-slate-300 rounded col-span-1"></div>
								</div>
								<div className="h-2 bg-slate-300 rounded w-full"></div>
							</div>
						</div>
					</div>
				</div>
				<h1 className="text-2xl font-semibold mt-7">
					<Typewriter
						words={["Checking For Any Pending Requests", "Please Wait ..."]}
						loop={true}
						cursor
						cursorStyle="_"
						typeSpeed={50}
						deleteSpeed={50}
						delaySpeed={2000}
					/>
					<Cursor cursorColor="#50A65C" />
				</h1>
			</section>
		);
	}

	return (
		<div className="flex flex-col w-full items-center justify-center h-screen gap-7">
			<Image
				src="/icons/notFound.gif"
				alt="Home"
				width={1000}
				height={1000}
				className="w-96 h-auto rounded-xl object-cover"
			/>
		</div>
	);
};

export default MeetingPage;
