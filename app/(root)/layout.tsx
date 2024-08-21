"use client";

import React, { ReactNode } from "react";
const ClientRootLayout = ({ children }: { children: ReactNode }) => {
	return <div className="relative min-h-screen w-full">{children}</div>;
};

export default ClientRootLayout;
