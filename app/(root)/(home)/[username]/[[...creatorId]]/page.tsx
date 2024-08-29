import CreatorCard from "@/components/creator/CreatorCard";
import { getUserByUsername } from "@/lib/actions/creator.actions";
import axios from "axios";
import { Metadata } from "next";

// Function to generate metadata dynamically
export async function generateMetadata({
	params,
}: {
	params: { username: string };
}): Promise<Metadata> {
	try {
		const creator = await getUserByUsername(String(params.username));

		return {
			title: `Creator | ${creator[0].username}` || "FlashCall",
			description: "Creator | Expert | Flashcall.me",
			openGraph: {
				type: "website",
				url: `https://app.flashcall.me/${creator[0].username}`,
				title: `Creator | ${creator[0].username}` || "FlashCall",
				description: `Book your first consultation with ${creator[0].username}`,
				images: [
					{
						url: `${creator[0].photo}`,
						width: 800,
						height: 600,
						alt: "Profile Picture",
					},
				],
				siteName: "Flashcall.me",
				locale: "en_US",
			},
		};
	} catch (error) {
		// Log any error that occurs during the API call
		console.error("Error fetching creator data:", error);

		return {
			title: "FlashCall",
			description: "Error fetching creator data",
		};
	}
}

const CreatorProfile = () => {
	return (
		<div className="flex items-start justify-start h-full overflow-scroll no-scrollbar md:pb-14">
			<CreatorCard />
		</div>
	);
};

export default CreatorProfile;
