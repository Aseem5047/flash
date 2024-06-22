"use client";

import { success } from "@/constants/icons";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

// Update the Success component to use the defined props type
const Success = ({
	redirect,
	event,
}: {
	redirect?: string;
	event?: string;
}) => {
	const router = useRouter();
	useEffect(() => {
		setTimeout(() => {
			router.push(`/${redirect ? redirect : "payment"}`);
		}, 4000);
	}, [router]);

	return (
		<div className="flex flex-col items-center justify-center min-w-full h-full gap-7">
			{success}
			<div className="flex flex-col items-center justify-center gap-2 tracking-wider">
				<span className="font-semibold text-xl">
					{event ? event : "Amount Added"}
				</span>
				<span className="font-semibold text-lg text-green-1">Successfully</span>
			</div>
		</div>
	);
};

export default Success;
