import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import "@stream-io/video-react-sdk/dist/css/styles.css";

export const metadata: Metadata = {
	title: "FlashCall",
	description:
		"A workspace for your team, powered by Stream and authentication via Clerk.",
	icons: {
		icon: "/icons/logo",
	},
};

import "@smastrom/react-rating/style.css";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<ClerkProvider
				appearance={{
					layout: {
						socialButtonsVariant: "auto",
						logoImageUrl: "/icons/logoDesktop.png",
					},
				}}
			>
				<TooltipProvider>
					<body className="no-scrollbar">
						<Toaster />
						{children}
					</body>
				</TooltipProvider>
			</ClerkProvider>
		</html>
	);
}
