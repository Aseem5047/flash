"use client";

import { useCall } from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { useCallTimerContext } from "@/lib/context/CallTimerContext";

import EndCallDecision from "./EndCallDecision";
import { useUser } from "@clerk/nextjs";

const EndCallButton = () => {
	const call = useCall();
	const [showDialog, setShowDialog] = useState(false);
	const { setAnyModalOpen, totalTimeUtilized } = useCallTimerContext();
	const { user } = useUser();

	if (!call) {
		throw new Error(
			"useStreamCall must be used within a StreamCall component."
		);
	}

	const isMeetingOwner =
		user?.publicMetadata?.userId === call?.state?.createdBy?.id;

	const endCall = async () => {
		setShowDialog(true); // Show the confirmation dialog
		setAnyModalOpen(true);
	};

	const handleDecisionDialog = async () => {
		await call.endCall();
		setShowDialog(false);
		// isMeetingOwner && router.push(`/feedback/${call?.id}/${totalTimeUtilized}`);
		// toast({
		// 	title: "Call Ended",
		// 	description: "The call Ended. Redirecting ...",
		// });
	};

	const handleCloseDialog = () => {
		setShowDialog(false);
		setAnyModalOpen(false);
	};

	return (
		<>
			<Button
				onClick={endCall}
				className="bg-red-500 font-semibold hover:opacity-80"
			>
				End Call
			</Button>

			{showDialog && (
				<EndCallDecision
					handleDecisionDialog={handleDecisionDialog}
					setShowDialog={handleCloseDialog}
				/>
			)}
		</>
	);
};

export default EndCallButton;
