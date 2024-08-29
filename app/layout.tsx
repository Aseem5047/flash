import "@stream-io/video-react-sdk/dist/css/styles.css";
import "@smastrom/react-rating/style.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import React from "react";
import { Metadata } from "next";
import MovePageToTop from "@/components/shared/MovePageToTop";
import { Analytics } from "@vercel/analytics/react";
import { GoogleTagManager } from "@next/third-parties/google";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";

export const metadata: Metadata = {
	title: "FlashCall",
	description: "Application Connecting People",

	openGraph: {
		type: "article",
		url: "https://app.flashcall.me",
		title: "Flashcall.me",
		description: "Book your first consultation",
		images: "/icons/logoDarkCircle.png",
		siteName: "Flashcall.me",
		locale: "en_US",
	},

	metadataBase: new URL("https://app.flashcall.me"),
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<GoogleAnalytics />
			<GoogleTagManager gtmId={`${process.env.NEXT_PUBLIC_MEASUREMENT_ID}`} />
			<TooltipProvider>
				<body className="overflow-y-scroll no-scrollbar">
					<Analytics />
					<Toaster />
					<MovePageToTop />
					{children}
				</body>
			</TooltipProvider>
		</html>
	);
}
