"use client";
import React, { useEffect, useState } from "react";
import { CreatorFeedback } from "@/types";
import ReviewSlider from "./ReviewSlider";

const UserReviewsCopy = ({
	theme,
	creatorFeedback,
}: {
	theme: string;
	creatorFeedback: Array<CreatorFeedback>;
}) => {
	const [isExpanded, setIsExpanded] = useState(false);

	const useScreenSize = () => {
		const [isMobile, setIsMobile] = useState(false);

		const handleResize = () => {
			setIsMobile(window.innerWidth < 600);
		};

		useEffect(() => {
			handleResize(); // Set initial value
			window.addEventListener("resize", handleResize);
			return () => window.removeEventListener("resize", handleResize);
		}, []);

		return isMobile;
	};

	const isMobile = useScreenSize();

	const toggleReadMore = () => {
		setIsExpanded(!isExpanded);
	};

	const getClampedText = (text: string) => {
		let charLen = isMobile ? 100 : 200;
		if (text.length > 100 && !isExpanded) {
			return text.slice(0, charLen) + "... ";
		}
		return text;
	};

	return (
		<div
			className="text-white size-full py-10 rounded-t-[24px] md:rounded-[24px] xl:w-[60%]"
			style={{ backgroundColor: theme }}
		>
			<h2 className="text-2xl font-semibold">Happy Client&apos;s</h2>

			{/* main section */}
			<ReviewSlider
				creatorFeedback={creatorFeedback}
				getClampedText={getClampedText}
				isExpanded={isExpanded}
				setIsExpanded={setIsExpanded}
				toggleReadMore={toggleReadMore}
			/>
		</div>
	);
};

export default UserReviewsCopy;
