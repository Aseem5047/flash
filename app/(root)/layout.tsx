"use client";

import { ChatRequestProvider } from "@/lib/context/ChatRequestContext";
import { CurrentUsersProvider } from "@/lib/context/CurrentUsersContext";
import { WalletBalanceProvider } from "@/lib/context/WalletBalanceContext";
import StreamVideoProvider from "@/providers/streamClientProvider";
import React, { ReactNode } from "react";
const ClientRootLayout = ({ children }: { children: ReactNode }) => {
	return (
		<CurrentUsersProvider>
			<StreamVideoProvider>
				<WalletBalanceProvider>
					<ChatRequestProvider>
						<div className="relative min-h-screen w-full">{children}</div>
					</ChatRequestProvider>
				</WalletBalanceProvider>
			</StreamVideoProvider>
		</CurrentUsersProvider>
	);
};

export default ClientRootLayout;
