import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCalls, CallingState } from "@stream-io/video-react-sdk";
import MyIncomingCallUI from "./MyIncomingCallUI";
import MyOutgoingCallUI from "./MyOutgoingCallUI";

const MyCallUI = () => {
	const router = useRouter();
	const calls = useCalls();

	useEffect(() => {
		// Add event listeners for call state changes
		calls.forEach((call) => {
			const handleCallEnded = () => router.push("/");
			call.on("call.ended", handleCallEnded);
			call.on("call.rejected", handleCallEnded);

			// Cleanup listeners on component unmount
			return () => {
				call.off("call.ended", handleCallEnded);
				call.off("call.rejected", handleCallEnded);
			};
		});
	}, [calls, router]);

	// Filter incoming ringing calls
	const incomingCalls = calls.filter(
		(call) =>
			call.isCreatedByMe === false &&
			call.state.callingState === CallingState.RINGING
	);

	// Filter outgoing ringing calls
	const outgoingCalls = calls.filter(
		(call) =>
			call.isCreatedByMe === true &&
			call.state.callingState === CallingState.RINGING
	);

	// Handle incoming call UI
	const [incomingCall] = incomingCalls;
	if (incomingCall) {
		return (
			<div className="bg-white p-4 shadow-lg rounded-md">
				<MyIncomingCallUI
					call={incomingCall}
					onAccept={() => router.push(`/meeting/${incomingCall.id}`)}
				/>
			</div>
		);
	}

	// Handle outgoing call UI
	const [outgoingCall] = outgoingCalls;
	if (outgoingCall) {
		return (
			<div className="bg-white p-4 shadow-lg rounded-md">
				<MyOutgoingCallUI call={outgoingCall} />
			</div>
		);
	}

	return null; // No ringing calls
};

export default MyCallUI;
