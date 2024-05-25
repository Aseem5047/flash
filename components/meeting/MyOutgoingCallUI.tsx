import React from "react";
import { Call } from "@stream-io/video-react-sdk";

const MyOutgoingCallUI = ({ call }: { call: Call }) => {
	return (
		<div className="text-center">
			<h1 className="font-bold text-lg mb-2">Outgoing Call</h1>
			<p className="mb-4">Recipient: {call.id}</p>
			<button
				className="bg-red-500 text-white px-4 py-2 rounded-md"
				onClick={() => call.endCall()}
			>
				Cancel
			</button>
		</div>
	);
};

export default MyOutgoingCallUI;
