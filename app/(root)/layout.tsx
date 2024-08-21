"use client";

import React, { ReactNode } from "react";
import { WalletBalanceProvider } from "@/lib/context/WalletBalanceContext";
const ClientRootLayout = ({ children }: { children: ReactNode }) => {
	return <div className="relative min-h-screen w-full">{children}</div>;
};

export default ClientRootLayout;
