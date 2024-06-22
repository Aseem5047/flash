"use client";

import { success } from "@/constants/icons";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const Success = ({
	redirect = "payment",
	event = "Amount Added",
}: {
	redirect?: string;
	event?: string;
}) => {
	const router = useRouter();
	useEffect(() => {
		setTimeout(() => {
			router.push(`/${redirect}`);
		}, 4000);
	}, [redirect, router]);

	return (
		<div className="flex flex-col items-center justify-center min-w-full h-full gap-7">
			{success}
			<div className="flex flex-col items-center justify-center gap-2 tracking-wider">
				<span className="font-semibold text-xl">{event} </span>
				<span className="font-semibold text-lg text-green-1">Successfully</span>
			</div>
		</div>
	);
};

export default Success;
