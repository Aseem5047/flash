"use client";

import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "../ui/button";
import CallFeedback from "../feedbacks/CallFeedback";

const EndCallButton = () => {
	const call = useCall();
	const router = useRouter();
	const [showFeedback, setShowFeedback] = useState(false);

	if (!call)
		throw new Error(
			"useStreamCall must be used within a StreamCall component."
		);

	const { useLocalParticipant } = useCallStateHooks();
	const localParticipant = useLocalParticipant();

	const isMeetingOwner =
		localParticipant &&
		call.state.createdBy &&
		localParticipant.userId === call.state.createdBy.id;

	if (!isMeetingOwner) return null;

	const endCall = async () => {
		setShowFeedback(true); // Show the feedback form
	};

	const handleFeedbackClose = async () => {
		setShowFeedback(false);
		await call.endCall();
		router.push("/"); // Redirect to the homepage
	};

	return (
		<>
			<Button onClick={endCall} className="bg-red-500 font-semibold">
				End Call
			</Button>
			{showFeedback && (
				<CallFeedback
					callId={call.id}
					isOpen={showFeedback}
					onOpenChange={handleFeedbackClose}
				/>
			)}
		</>
	);
};

export default EndCallButton;
