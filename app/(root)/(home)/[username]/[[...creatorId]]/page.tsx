import CreatorCard from "@/components/creator/CreatorCard";
import { getUserByUsername } from "@/lib/actions/creator.actions";
import { isValidUrl } from "@/lib/utils";
import { Metadata } from "next";

export const imageSrc = (creator: any) => {
	if (creator[0]?.photo && isValidUrl(creator[0]?.photo)) {
		return creator[0]?.photo;
	} else {
		return "/images/defaultProfileImage.png";
	}
};

// Function to generate metadata dynamically
export async function generateMetadata({
	params,
}: {
	params: { username: string };
}): Promise<Metadata> {
	const creator = await getUserByUsername(String(params.username));
	let imageURL = imageSrc(creator[0]);
	try {
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
