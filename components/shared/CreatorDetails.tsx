import React from "react";
import { sparkles } from "@/constants/icons";
import { creatorUser } from "@/types";
import { usePathname } from "next/navigation";
interface CreatorDetailsProps {
	creator: creatorUser;
}
const CreatorDetails = ({ creator }: CreatorDetailsProps) => {
	const pathname = usePathname();
	return (
		<>
			{" "}
			<div className="flex flex-col items-center px-7 justify-center">
				<div
					className={`relative flex flex-col items-center w-fit mx-auto gap-4 p-7 rounded-xl z-10 ${
						!pathname.includes("/creator") && "!w-4/5"
					}`}
					style={{ backgroundColor: creator.themeSelected }}
				>
					<img
						src={creator.photo}
						alt="profile picture"
						width={24}
						height={24}
						className={`rounded-xl w-full min-h-full max-w-64 h-60 xl:max-w-80 xl:h-80 object-cover ${
							!pathname.includes("/creator") &&
							"!max-w-full xl:!max-w-full xl:h-80"
						} `}
					/>
					<div className="text-white flex flex-col items-start w-full">
						{/* Username*/}
						<p className="font-semibold text-3xl max-w-[90%] text-ellipsis whitespace-nowrap overflow-hidden">
							{creator.firstName ? (
								<span className="capitalize">
									{creator.firstName} {creator.lastName}
								</span>
							) : (
								creator.username
							)}
						</p>
						{/* Profession and Status */}
						<div className="flex items-center justify-between w-full mt-2">
							<span className="text-md h-full">
								{creator.profession ? creator.profession : "Expert"}
							</span>
							<span className="bg-green-500 text-xs rounded-xl px-4 py-2">
								Available
							</span>
						</div>
					</div>

					<span
						className="absolute top-1/2 -right-8"
						style={{ color: creator.themeSelected }}
					>
						{sparkles}
					</span>
				</div>
				{/* User Description */}
				{creator.bio && (
					<p
						className={`border-2 border-gray-200 p-4 -mt-7 pt-10 text-md text-center rounded-3xl rounded-tr-none  h-full w-full relative ${
							pathname.includes("/creator") && "lg:max-w-[80%] xl:max-w-[55%]"
						}`}
					>
						{creator.bio}

						<span
							className="absolute max-xl:-top-2 xl:-bottom-2 -left-4"
							style={{ color: creator.themeSelected }}
						>
							{sparkles}
						</span>
					</p>
				)}
			</div>
		</>
	);
};

export default CreatorDetails;
