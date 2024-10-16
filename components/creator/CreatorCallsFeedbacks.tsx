"use client";

import { UserFeedback } from "@/types";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import SinglePostLoader from "../shared/SinglePostLoader";
import CreatorFeedbackCheck from "../feedbacks/CreatorFeedbackCheck";
import { Switch } from "../ui/switch";
import { useCurrentUsersContext } from "@/lib/context/CurrentUsersContext";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import * as Sentry from "@sentry/nextjs";
import GetRandomImage from "@/utils/GetRandomImage";
import { backendBaseUrl, isValidUrl } from "@/lib/utils";
import axios from "axios";
import { useInView } from "react-intersection-observer";

// Function to reorder the array based on the drag result
const reorder = (
	list: ExtendedUserFeedback[],
	startIndex: number,
	endIndex: number
) => {
	const result = Array.from(list);
	const [removed] = result.splice(startIndex, 1);
	result.splice(endIndex, 0, removed);

	// Update the position field based on the new order
	return result.map((item, index) => ({ ...item, position: index + 1 }));
};

type FeedbackParams = {
	callId?: string;
	feedback: UserFeedback;
};

type ExtendedUserFeedback = UserFeedback & {
	callId: string;
};

const CreatorCallsFeedbacks = () => {
	const [feedbacks, setFeedbacks] = useState<ExtendedUserFeedback[]>([]);
	const [callsCount, setCallsCount] = useState(10);
	const [loading, setLoading] = useState(true);
	const { creatorUser } = useCurrentUsersContext();
	const [loadingFeedbackId, setLoadingFeedbackId] = useState<string | null>(
		null
	);

	const pathname = usePathname();
	const { ref, inView } = useInView({
		threshold: 0.1,
		triggerOnce: false,
	});
	useEffect(() => {
		if (inView) {
			setCallsCount((prevCount) => prevCount + 6);
		}
	}, [inView]);

	useEffect(() => {
		const getFeedbacks = async () => {
			try {
				const response = await axios.get(
					`${backendBaseUrl}/feedback/call/getFeedbacks?creatorId=${String(
						creatorUser?._id
					)}`
				);

				let data = await response.data;

				const feedbacksWithCallId = data.map(
					(item: FeedbackParams, index: number) => ({
						...item.feedback,
						callId: item.callId,
						position:
							item.feedback.position !== -1
								? item.feedback.position
								: index + 1,
					})
				);

				setFeedbacks(feedbacksWithCallId);
			} catch (error) {
				Sentry.captureException(error);
				console.warn(error);
			} finally {
				setLoading(false);
			}
		};
		if (creatorUser) {
			getFeedbacks();
		}
	}, [pathname]);

	const handleSwitchToggle = async (
		feedback: ExtendedUserFeedback,
		showFeedback: boolean,
		index: number
	) => {
		setLoadingFeedbackId(feedback.callId); // Set loading state

		try {
			const response = await axios.post(
				`${backendBaseUrl}/feedback/creator/setFeedback`,
				{
					creatorId: creatorUser?._id,
					clientId: feedback.clientId._id,
					rating: feedback.rating,
					feedbackText: feedback.feedback,
					showFeedback: showFeedback,
					createdAt: feedback.createdAt,
					position: feedback.position,
				}
			);

			if (response.status !== 200) {
				throw new Error("Failed to update feedback visibility");
			}

			await axios.post(`${backendBaseUrl}/feedback/call/create`, {
				creatorId: creatorUser?._id,
				callId: feedback.callId,
				clientId: feedback.clientId._id,
				rating: feedback.rating,
				feedbackText: feedback.feedback,
				showFeedback: showFeedback,
				createdAt: feedback.createdAt,
				position: feedback.position,
			});

			setFeedbacks((prevFeedbacks) =>
				prevFeedbacks.map((fb, i) =>
					i === index ? { ...fb, showFeedback: showFeedback } : fb
				)
			);
		} catch (error) {
			Sentry.captureException(error);
			console.error("Error updating feedback visibility:", error);
		} finally {
			setLoadingFeedbackId(null); // Reset loading state
		}
	};

	const onDragEnd = async (result: any) => {
		if (!result.destination) {
			return;
		}

		// Reorder the feedbacks based on the drag and drop result
		const items = reorder(
			feedbacks,
			result.source.index,
			result.destination.index
		);

		// Identify changed feedbacks by comparing the new order with the original order
		const changedFeedbacks = items.filter((item, index) => {
			return (
				new Date(item.createdAt).toISOString() !==
				new Date(feedbacks[index].createdAt).toISOString()
			);
		});

		if (changedFeedbacks.length === 0) {
			// No changes detected, no need to make API calls
			return;
		}

		// Update the local state with the reordered feedbacks
		setFeedbacks(items);

		// Prepare the changed feedbacks for the API request
		const updatedFeedbacks = changedFeedbacks.map((feedback) => ({
			creatorId: creatorUser?._id,
			callId: feedback.callId,
			clientId: feedback.clientId._id,
			rating: feedback.rating,
			feedbackText: feedback.feedback,
			showFeedback: feedback.showFeedback,
			createdAt: feedback.createdAt,
			position: feedback.position,
		}));

		try {
			await Promise.all(
				updatedFeedbacks.map(async (feedback) => {
					// Update feedback position in call feedbacks
					await axios.post(`${backendBaseUrl}/feedback/call/create`, {
						creatorId: feedback.creatorId,
						callId: feedback.callId,
						clientId: feedback.clientId,
						showFeedback: feedback.showFeedback,
						rating: feedback.rating,
						feedbackText: feedback.feedbackText,
						createdAt: feedback.createdAt,
						position: feedback.position,
					});

					// If showFeedback is true, update the position in creator feedbacks
					if (feedback.showFeedback) {
						await axios.post(`${backendBaseUrl}/feedback/creator/setFeedback`, {
							creatorId: feedback.creatorId,
							clientId: feedback.clientId,
							showFeedback: feedback.showFeedback,
							rating: feedback.rating,
							feedbackText: feedback.feedbackText,
							createdAt: feedback.createdAt,
							position: feedback.position,
						});
					}
				})
			);

			console.log("Changed feedback positions updated successfully.");
		} catch (error) {
			Sentry.captureException(error);
			console.error("Error updating feedback positions:", error);
		}
	};

	if (loading) {
		return (
			<section className="w-full h-full flex items-center justify-center">
				<SinglePostLoader />
			</section>
		);
	}

	const visibleFeedbacks = feedbacks.slice(0, callsCount);

	return (
		<>
			{feedbacks && feedbacks.length > 0 ? (
				<DragDropContext onDragEnd={onDragEnd}>
					<Droppable droppableId="feedbacks">
						{(provided) => (
							<section
								className={`grid grid-cols-1 ${
									feedbacks.length > 0 && "xl:grid-cols-2"
								} items-start gap-5 xl:gap-10 w-full h-fit text-black px-4 overflow-x-hidden no-scrollbar`}
								ref={provided.innerRef}
								{...provided.droppableProps}
							>
								{visibleFeedbacks.map((feedback, index) => (
									<Draggable
										key={feedback.callId}
										draggableId={feedback.callId}
										index={index}
									>
										{(provided) => (
											<div
												ref={provided.innerRef}
												{...provided.draggableProps}
												{...provided.dragHandleProps}
												className={`relative flex flex-col items-start justify-center gap-4 xl:max-w-[568px]  border  rounded-xl p-4 pl-10 shadow-lg  border-gray-300  ${
													pathname.includes("/profile") && "mx-auto"
												}`}
											>
												<Image
													src="/icons/dragIndicator.svg"
													alt="draggable"
													height={100}
													width={100}
													className="w-7 h-7 absolute top-7 left-2"
												/>
												<div className="flex h-full w-full items-start justify-between">
													<div className="w-full flex items-center justify-start gap-4">
														<Image
															src={
																feedback?.clientId?.photo &&
																isValidUrl(feedback.clientId.photo)
																	? feedback.clientId.photo
																	: GetRandomImage()
															}
															alt={
																feedback?.clientId?.username || "Default User"
															}
															height={1000}
															width={1000}
															className="rounded-full w-12 h-12 object-cover"
															onError={(e) => {
																e.currentTarget.src =
																	"/images/defaultProfileImage.png";
															}}
														/>

														<div className="flex flex-col">
															<span className="text-base text-green-1">
																{feedback?.clientId?.phone.replace(
																	/(\+91)(\d+)/,
																	(match, p1, p2) =>
																		`${p1} ${p2.replace(/(\d{5})$/, "xxxxx")}`
																) || feedback?.clientId?._id}
															</span>
															<p className="text-sm tracking-wide">
																{feedback?.clientId?.username.startsWith(
																	"+91"
																) ? (
																	<>
																		{feedback.clientId.username.replace(
																			/(\+91)(\d+)/,
																			(match, p1, p2) =>
																				`${p1} ${p2.replace(
																					/(\d{5})$/,
																					"xxxxx"
																				)}`
																		)}
																	</>
																) : (
																	<>{feedback?.clientId?.username}</>
																)}
															</p>
														</div>
													</div>
													<div className="w-fit flex flex-col items-end justify-between h-full gap-2">
														{loadingFeedbackId === feedback?.callId ? (
															<Image
																src="/icons/loading-circle.svg"
																alt="Loading..."
																width={24}
																height={24}
																className="invert"
																priority
															/>
														) : (
															<Switch
																checked={feedback?.showFeedback}
																onCheckedChange={() =>
																	handleSwitchToggle(
																		feedback,
																		!feedback.showFeedback,
																		index
																	)
																}
															/>
														)}
														<span className="text-xs text-[#A7A8A1] whitespace-nowrap">
															{!feedback.showFeedback && "Add to Website"}
														</span>
													</div>
												</div>
												<CreatorFeedbackCheck feedback={feedback} />
											</div>
										)}
									</Draggable>
								))}
								{provided.placeholder}
							</section>
						)}
					</Droppable>
				</DragDropContext>
			) : (
				<div className="flex flex-col w-full items-center justify-center h-full">
					<h1 className="text-2xl font-semibold text-red-500">
						No Feedbacks Found
					</h1>
					<h2 className="text-xl font-semibold text-red-500">
						User provided feedbacks are shown here
					</h2>
				</div>
			)}
		</>
	);
};

export default CreatorCallsFeedbacks;
