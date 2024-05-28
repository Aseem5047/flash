import { useEffect, useState } from "react";
import UserFeedback from "./UserFeedback";
import { getCallFeedbacks } from "@/lib/actions/feedback.actions";
import { useUser } from "@clerk/nextjs";
import { Rating } from "@smastrom/react-rating";

export const FeedbackCheck = ({ callId }: { callId: string }) => {
	const [feedbackExists, setFeedbackExists] = useState<boolean | null>(null);
	const { user } = useUser();
	const [userFeedbacks, setUserFeedbacks] = useState<[] | null>(null);

	const ratingItems = ["😒", "😞", "😑", "🙂", "😄"];

	const checkFeedback = async () => {
		try {
			const response = await getCallFeedbacks(callId);

			// Check if feedbacks exist for the call
			const hasFeedback = response.length > 0;
			setFeedbackExists(hasFeedback);

			// Filter feedbacks based on user ID
			if (user) {
				setUserFeedbacks(response ? response.feedbacks : []);
			}
		} catch (error) {
			console.log("Error checking feedback:", error);
			setFeedbackExists(false);
		}
	};

	useEffect(() => {
		if (user) {
			checkFeedback();
		}
	}, [callId, user]);

	if (feedbackExists === null) {
		return (
			<div className="flex items-center space-x-4 w-full animate-pulse">
				<div className="flex-1 space-y-4 py-1">
					<div className="h-3 bg-slate-300 rounded w-3/4"></div>
					<div className="space-y-3">
						<div className="grid grid-cols-3 gap-4">
							<div className="h-2 bg-slate-300 rounded col-span-2"></div>
							<div className="h-2 bg-slate-300 rounded col-span-1"></div>
						</div>
						<div className="h-2 bg-slate-300 rounded w-full"></div>
					</div>
				</div>
			</div>
		);
	}

	// userFeedbacks?.map((feedback) => console.log(feedback.feedbacks));
	return feedbackExists && userFeedbacks && userFeedbacks.length > 0 ? (
		<div className="w-full flex items-center justify-center">
			{userFeedbacks.map(
				(
					feedback: {
						clientId: string;
						rating: number;
						feedback: string;
					},
					index: number
				) => (
					<div
						className="flex flex-col gap-1 items-start justify-center"
						key={index}
					>
						<Rating
							style={{ maxWidth: 180, fill: "white" }}
							value={feedback.rating}
							items={5}
							spaceBetween="medium"
							transition="zoom"
							readOnly
						/>
						<span>{feedback.feedback}</span>
					</div>
				)
			)}
			{/* <span>{userFeedbacks && userFeedbacks[0]?.feedback}</span> */}
		</div>
	) : (
		<UserFeedback callId={callId} checkFeedback={checkFeedback} />
	);
};
