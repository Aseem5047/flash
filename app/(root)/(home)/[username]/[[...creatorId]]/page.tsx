import CreatorCard from "@/components/creator/CreatorCard";
import { getUserByUsername } from "@/lib/actions/creator.actions";
import { Metadata } from "next";

// Function to generate metadata dynamically
export async function generateMetadata({
	params,
}: {
	params: { username: string };
}): Promise<Metadata> {
	const creatorData = await getUserByUsername(params.username);

	return {
		title: params.username || "FlashCall",
		description: params.username || "Creator | Expert | Flashcall.me",

		openGraph: {
			type: "website",
			url: `https://flashcall.me/creator-profile/${params.username}`,
			title: params.username || "FlashCall",
			description: params.username || "Application Connecting People",
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
		metadataBase: new URL("https://flashcall.me"),
	};
}

const CreatorProfile = () => {
	return (
		<div className="flex items-start justify-start h-full overflow-scroll no-scrollbar md:pb-14">
			<CreatorCard />
		</div>
	);
};

export default CreatorProfile;
