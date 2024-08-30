import { db } from "@/lib/firebase";
import { isValidUrl } from "@/lib/utils";
import { creatorUser } from "@/types";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import Image from "next/image";

const CreatorsGrid = ({ creator }: { creator: creatorUser }) => {
	const [status, setStatus] = useState<string>("Offline"); // Default status to "Offline"

	const imageSrc =
		creator?.photo && isValidUrl(creator.photo)
			? creator.photo
			: "/images/defaultProfileImage.png";

	useEffect(() => {
		const docRef = doc(db, "userStatus", creator.phone);
		const unsubscribe = onSnapshot(
			docRef,
			(docSnap) => {
				if (docSnap.exists()) {
					const data = docSnap.data();
					setStatus(data.status || "Offline");
				} else {
					setStatus("Offline"); // If document doesn't exist, mark the creator as offline
				}
			},
			(error) => {
				console.error("Error fetching status:", error);
				setStatus("Offline");
			}
		);

		// Clean up the listener on component unmount
		return () => unsubscribe();
	}, [creator.phone]);

	return (
		<div className="relative flex flex-col items-center justify-center rounded-xl size-full">
			<Image
				src={imageSrc}
				alt="Creator Profile"
				height={500}
				width={500}
				className="object-cover rounded-xl w-full h-72 lg:h-96"
				priority={true}
				placeholder="blur"
				blurDataURL="/images/defaultProfileImage.png"
			/>
			<div className="text-white flex flex-col items-start w-full creatorsGirdHighlight">
				{/* Username */}
				<p className="font-semibold text-base sm:text-2xl max-w-[90%] text-ellipsis whitespace-nowrap overflow-hidden">
					{creator.firstName ? (
						<span className="capitalize">
							{creator.firstName} {creator.lastName}
						</span>
					) : (
						creator.username
					)}
				</p>
				{/* Profession and Status */}
				<div className="flex items-center justify-between w-full mt-2 gap-2">
					<span className="text-sm sm:text-lg h-full max-w-[90%] text-ellipsis whitespace-nowrap overflow-hidden">
						{creator.profession ? creator.profession : "Expert"}
					</span>
					<div
						className={`${
							status === "Online" ? "bg-green-500" : "bg-red-500"
						} text-xs rounded-full sm:rounded-xl px-1.5 py-1.5 sm:px-4 sm:py-2`}
					>
						<span className="hidden sm:flex">
							{status === "Online" ? "Online" : "Offline"}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CreatorsGrid;
