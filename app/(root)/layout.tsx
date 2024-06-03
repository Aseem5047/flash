"use client";

import React, { ReactNode, useEffect, useState } from "react";
import StreamVideoProvider from "@/providers/streamClientProvider";
import MyCallUI from "@/components/meeting/MyCallUI";
import { useUser } from "@clerk/nextjs";

const ClientRootLayout = ({ children }: { children: ReactNode }) => {
	const { user } = useUser();
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) {
		return <>{children}</>;
	}

	return user ? (
		<StreamVideoProvider>
			<div className="relative min-h-screen w-full">
				<MyCallUI />
				{children}
			</div>
		</StreamVideoProvider>
	) : (
		<>{children}</>
	);
};

export default ClientRootLayout;
