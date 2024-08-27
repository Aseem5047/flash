"use client";
import React, { useEffect, useRef, useState } from "react";
import { Rating } from "@smastrom/react-rating";
import SinglePostLoader from "../shared/SinglePostLoader";
import { CreatorFeedback } from "@/types";

const UserReviews = ({
	theme,
	creatorFeedback,
	loading,
}: {
	theme: string;
	creatorFeedback: Array<CreatorFeedback>;
	loading: boolean;
}) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const lastIndex = creatorFeedback?.length - 1;
	const [direction, setDirection] = useState("right");
	const [isHovering, setIsHovering] = useState(false);
	const sliderIntervalRef = useRef<any>(null);
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
		// Create a temporary element to measure text

		// Check if the text exceeds the clamped height
		let charLen = isMobile ? 100 : 200;
		if (text.length > 100) {
			// Use a reasonable number of characters to truncate
			return text.slice(0, charLen) + "... "; // Adjust the slicing length if needed
		}
		return text;
	};

	let dummyFeedback =
		"Lorem ipsum dolor sit amet consect adipisicing elit. Culpa consequuntur ducimus repellendus non nam, laboriosam et ullam veniam? Voluptatum laboriosam mollitia expedita fugit iste repellendus suscipit nostrum. Inventore repudiandae, quibusdam voluptatibus facere minus officiis tenetur, obcaecati quos assumenda similique commodi magni maxime nobis suscipit distinctio eaque quisquam vel omnis. Eos, temporibus odit! Odit mollitia dolores repudiandae, pariatur magni dolorem, vel necessitatibus, beatae sequi aut iste culpa doloribus. Ab iusto quaerat officiis, id maxime ratione voluptatum quasi ex voluptas beatae ipsam et quo quia esse facilis quibusdam inventore error, magnam atque totam tenetur. Sed, vel delectus voluptatum earum autem quia inventore!";

	// Auto slider
	useEffect(() => {
		startAutoSlide();

		return () => {
			stopAutoSlide();
		};
	}, [currentIndex, isHovering]);

	const startAutoSlide = () => {
		if (sliderIntervalRef.current) {
			clearInterval(sliderIntervalRef.current);
		}

		if (creatorFeedback?.length > 1 && !isHovering && !isExpanded) {
			setIsExpanded(false);
			sliderIntervalRef.current = setInterval(() => {
				setCurrentIndex((prev) => (prev + 1 > lastIndex ? 0 : prev + 1));
			}, 5000);
		}
	};

	const stopAutoSlide = () => {
		if (sliderIntervalRef.current) {
			clearInterval(sliderIntervalRef.current);
		}
	};

	const nextSlide = () => {
		setDirection("right");
		stopAutoSlide();

		setCurrentIndex((prev) => (prev + 1 > lastIndex ? 0 : prev + 1));
	};

	const previousSlide = () => {
		setDirection("left");
		stopAutoSlide();

		setCurrentIndex((prev) => (prev - 1 < 0 ? lastIndex : prev - 1));
	};

	const getSliderState = (feedbackIndex: number) => {
		if (feedbackIndex === currentIndex) return "active";
		else return "hidden";
	};

	if (loading)
		return (
			<section className="w-full h-full flex items-center justify-center">
				<SinglePostLoader />
			</section>
		);

	return (
		<div
			className="flex overflow-x-scroll no-scrollbar items-center text-white w-full rounded-t-[24px] md:rounded-[24px] xl:w-[60%]"
			style={{ backgroundColor: theme }}
			onMouseEnter={() => setIsHovering(true)}
			onMouseLeave={() => setIsHovering(false)}
		>
			{creatorFeedback?.map((feedback, index) => {
				const adjustedIndex =
					(index + creatorFeedback?.length) % creatorFeedback?.length;
				const slideState = getSliderState(adjustedIndex);

				let transitionClass = "";

				if (slideState === "active") {
					transitionClass =
						direction === "right"
							? "animate-enterFromRight"
							: "animate-enterFromLeft";
				} else {
					transitionClass =
						direction === "right"
							? "animate-exitToLeft"
							: "animate-exitToRight";
				}
				return (
					<div
						key={index + adjustedIndex}
						className={` ${slideState} relative`}
					>
						<h2 className="text-2xl font-semibold">Happy Client&apos;s</h2>
						<div
							className={`${transitionClass} flex flex-col items-center justify-center`}
						>
							{/* Profile Image */}
							<div className="flex w-fit mx-auto rounded-full items-center justify-center gap-2 bg-black px-4 py-2 z-10">
								<img
									src={
										feedback?.clientId?.photo ||
										"/images/defaultProfileImage.png"
									}
									alt={`${feedback?.clientId?.username} profile`}
									width={24}
									height={24}
									className="w-7 h-7 rounded-full object-cover"
									onError={(e) => {
										e.currentTarget.src = "/images/defaultProfileImage.png";
									}}
								/>
								<span className="text-3xl">😍</span>
							</div>
							<div className="flex flex-col items-start justfy-center gap-4 w-full rounded-[24px] px-5 pb-5 pt-10 -mt-4 bg-black/10">
								{/* Rating */}
								<div className="flex gap-1 items-center">
									<Rating
										style={{
											maxWidth: 180,
											fill: "white",
											marginLeft: "-10px",
										}}
										value={Math.floor(feedback.rating)}
										items={5}
										spaceBetween="medium"
										transition="zoom"
										readOnly
									/>
								</div>

								{/* Feedback */}

								<div className="pl-1 flex flex-col items-start justify-start gap-2 w-full h-full overflow-hidden -ml-1 min-h-[4rem]">
									<span
										className={`text-start block ${
											isExpanded ? "whitespace-pre-wrap" : "line-clamp-3"
										} ${
											isExpanded
												? "overflow-y-scroll no-scrollbar"
												: "overflow-hidden"
										}`}
										style={{ maxHeight: isExpanded ? "10rem" : "7rem" }}
									>
										{getClampedText(feedback.feedback)}
										{!isExpanded && feedback.feedback.length > 100 && (
											<span className="text-white">
												<button
													onClick={toggleReadMore}
													className="underline underline-offset-2 hover:opacity-80"
												>
													Read more
												</button>
											</span>
										)}
									</span>

									{isExpanded && (
										<button
											onClick={toggleReadMore}
											className="text-red-400 hover:opacity-80 text-sm font-bold mt-2"
										>
											Show Less
										</button>
									)}
								</div>

								{/* User Details */}
								<div className="flex flex-col items-start justify-center gap-1">
									{feedback?.clientId?.username ? (
										<p className="text-sm font-semibold">
											{feedback?.clientId?.username}
										</p>
									) : (
										<p className="text-sm font-semibold">
											{feedback?.clientId?.phone?.replace(
												/(\+91)(\d+)/,
												(match, p1, p2) =>
													`${p1} ${p2.replace(/(\d{5})$/, "xxxxx")}`
											)}
										</p>
									)}
								</div>
							</div>
						</div>

						{/* navigation */}
						{creatorFeedback?.length > 1 && (
							<div className="flex items-center justify-center w-full">
								<div className="flex gap-2 items-center max-w-[60%] md:max-w-[80%] py-[0.75px] overflow-x-scroll no-scrollbar bg-black/10 px-1 rounded-xl">
									{creatorFeedback?.map((_, index) => (
										<button
											key={index}
											className={`${
												index === currentIndex
													? "!bg-[#F6B656]"
													: "opacity-0 hover:opacity-100"
											} w-10 h-1 rounded-xl flex items-center justify-center hoverScaleEffect hover:bg-black/20`}
											onClick={() => {
												setCurrentIndex(index);
												setIsExpanded(false);
											}}
										/>
									))}
								</div>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
};

export default UserReviews;
