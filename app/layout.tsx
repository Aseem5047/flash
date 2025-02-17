import React from "react";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import "@smastrom/react-rating/style.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "react-datepicker/dist/react-datepicker.css";

import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Metadata } from "next";
import MovePageToTop from "@/components/shared/MovePageToTop";
import Script from "next/script";

export const metadata: Metadata = {
	title: "Flashcall.me",
	description: "Book your first consultation",
	icons: {
		icon: "/icons/logo_icon_dark.png",
	},

	openGraph: {
		type: "website",
		url: "https://flashcall.me",
		title: "FlashCall",
		description: "Book your first consultation",
		images: [
			{
				url: "/icons/logo_icon_dark.png",
				width: 800,
				height: 600,
				alt: "FlashCall Logo",
			},
		],
		siteName: "Flashcall.me",
		locale: "en_US",
	},

	metadataBase:
		process.env.NODE_ENV === "production"
			? new URL("https://flashcall.me")
			: new URL("http://localhost:3000"),
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<TooltipProvider>
				<body className="overflow-y-scroll no-scrollbar">
					<Script
						src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`}
					/>
					<Script src="https://checkout.razorpay.com/v1/checkout.js" />
					<Script src="https://sdk.cashfree.com/js/v3/cashfree.js" />
					<Toaster />
					<MovePageToTop />
					{children}
				</body>
			</TooltipProvider>
		</html>
	);
}
