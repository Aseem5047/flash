"use client";

import React, { ReactNode } from "react";
import StreamVideoProvider from "@/providers/streamClientProvider";
import MyCallUI from "@/components/meeting/MyCallUI";

const RootLayout = ({ children }: { children: ReactNode }) => {
	return (
		<StreamVideoProvider>
			<div className="relative min-h-screen">
				{/* MyCallUI positioned at the top right */}
				<div className="absolute top-4 right-4 z-50">
					<MyCallUI />
				</div>
				{children}
			</div>
		</StreamVideoProvider>
	);
};

export default RootLayout;
