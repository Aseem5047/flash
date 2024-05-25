import React from "react";
import { Call } from "@stream-io/video-react-sdk";

const MyIncomingCallUI = ({
	call,
	onAccept,
}: {
	call: Call;
	onAccept: () => void;
}) => {
	return (
		<div className="text-center">
			<h1 className="font-bold text-lg mb-2">Incoming Call</h1>
			<p className="mb-4">Caller: {call.id}</p>
			<button
				className="bg-green-500 text-white px-4 py-2 rounded-md mr-2"
				onClick={() => {
					call.accept();
					onAccept();
				}}
			>
				Accept
			</button>
			<button
				className="bg-red-500 text-white px-4 py-2 rounded-md"
				onClick={() => call.reject()}
			>
				Reject
			</button>
		</div>
	);
};

export default MyIncomingCallUI;
