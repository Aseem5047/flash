import CreatorCard from "@/components/creator/CreatorCard";
import { Metadata } from "next";

// Function to generate metadata dynamically
export async function generateMetadata({
	params,
}: {
	params: { username: string };
}): Promise<Metadata> {
	return {
		title: `Creator | ${params.username}` || "FlashCall",
		description: "Creator | Expert | Flashcall.me",
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
