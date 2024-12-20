import CreatorCard from "@/components/creator/CreatorCard";
import { Metadata } from "next";
import * as Sentry from "@sentry/nextjs";
import { getUserByUsername } from "@/lib/actions/creator.actions";
import {
	getDisplayName,
	getProfileImagePlaceholder,
	getImageSource,
} from "@/lib/utils";

// Function to generate metadata dynamically
export async function generateMetadata({
	params,
}: {
	params: { username: string };
}): Promise<Metadata> {
	// Decode the URL-encoded username
	const decodedUsername = decodeURIComponent(params.username as string);

	// Check if the username is valid and avoid processing reserved paths like "_next"
	if (!decodedUsername || decodedUsername.startsWith("_next")) {
		return {
			title: "FlashCall",
			description: "Creator Platform | FlashCall",
		};
	}

	// Remove "@" from the beginning if it exists
	const formattedUsername = decodedUsername.startsWith("@")
		? decodedUsername.substring(1)
		: decodedUsername;

	const creator = await getUserByUsername(String(formattedUsername));
	const creatorProfile = creator ? creator : null;

	if (!creatorProfile) {
		return {
			title: "FlashCall",
			description: "Creator Not Found",
		};
	}

	const imageURL = creatorProfile
		? getImageSource(creatorProfile)
		: getProfileImagePlaceholder();

	const fullName = getDisplayName(creatorProfile);

	try {
		return {
			title: `Creator | ${fullName}` || "FlashCall",
			description: "Creator | Expert | Flashcall.me",
			openGraph: {
				type: "website",
				url: `https://flashcall.me/@${formattedUsername}`,
				title: `Creator | ${fullName}` || "FlashCall",
				description: `Book your first consultation with ${fullName}`,
				images: [
					{
						url: `${imageURL}`,
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
		Sentry.captureException(error);
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
		<div className="flex items-start justify-start h-full overflow-scroll no-scrollbar">
			<CreatorCard />
		</div>
	);
};

export default CreatorProfile;
