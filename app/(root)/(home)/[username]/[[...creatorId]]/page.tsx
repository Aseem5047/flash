import CreatorCard from "@/components/creator/CreatorCard";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
	title: "Creator | Flashcall.me",
	description: "Checkout This Profile",
	icons: {
		icon: "https://drive.google.com/file/d/161hwsCCq9AQ66m6nNEIm3gV5D8R40nki/view?usp=sharing",
	},

	openGraph: {
		type: "website",
		url: "https://app.flashcall.me",
		title: "FlashCall",
		description: "Application Connecting People",
		images: [
			{
				url: "https://drive.google.com/file/d/161hwsCCq9AQ66m6nNEIm3gV5D8R40nki/view?usp=sharing",
				width: 800,
				height: 600,
				alt: "FlashCall Logo",
			},
		],
		siteName: "Flashcall.me",
		locale: "en_US",
	},

	metadataBase: new URL("https://app.flashcall.me"),
};

const CreatorProfile = () => {
	return (
		<div className="flex items-start justify-start h-full overflow-scroll no-scrollbar md:pb-14">
			<CreatorCard />
		</div>
	);
};

export default CreatorProfile;
