"use client";

import React, { ReactNode } from "react";
import StreamVideoProvider from "@/providers/streamClientProvider";
import { WalletBalanceProvider } from "@/lib/context/WalletBalanceContext";
const ClientRootLayout = ({ children }: { children: ReactNode }) => {
	return (
		<StreamVideoProvider>
			<WalletBalanceProvider>
				<div className="relative min-h-screen w-full">{children}</div>
			</WalletBalanceProvider>
		</StreamVideoProvider>
	);
};

export default ClientRootLayout;
