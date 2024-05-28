import { useEffect, useState } from "react";
import UserFeedback from "./UserFeedback";
import { getCallFeedbacks } from "@/lib/actions/feedback.actions";
import { useUser } from "@clerk/nextjs";
import { Rating } from "@smastrom/react-rating";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const FeedbackCheck = ({ callId }: { callId: string }) => {
	const [feedbackExists, setFeedbackExists] = useState<boolean | null>(null);
	const { user } = useUser();
	const [userFeedbacks, setUserFeedbacks] = useState<any[] | null>(null);
	const [isSheetOpen, setIsSheetOpen] = useState(false);

	const checkFeedback = async () => {
		try {
			const response = await getCallFeedbacks(callId);

			// Check if feedbacks exist for the call
			const hasFeedback = response.length > 0;
			setFeedbackExists(hasFeedback);

			// Filter feedbacks based on user ID
			if (user) {
				const filteredFeedbacks = response
					.map((feedback: any) => feedback.feedbacks)
					.flat();
				setUserFeedbacks(filteredFeedbacks);
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

	return feedbackExists && userFeedbacks && userFeedbacks.length > 0 ? (
		<div className="w-full flex items-center justify-start lg:justify-end">
			<Dialog>
				<DialogTrigger className="flex flex-col gap-1 items-start justify-start sm:justify-center">
					<Rating
						style={{ maxWidth: 180, fill: "white" }}
						value={userFeedbacks[0].rating}
						items={5}
						spaceBetween="medium"
						transition="zoom"
						readOnly
					/>
					<span className="text-ellipsis overflow-hidden w-full max-w-[200px] whitespace-nowrap pl-2 text-start">
						{userFeedbacks[0].feedback}
					</span>
				</DialogTrigger>
				<DialogContent className="bg-white">
					<DialogHeader>
						<DialogTitle>All Feedbacks</DialogTitle>
						<DialogDescription>
							Here are all the feedbacks for this call.
						</DialogDescription>
					</DialogHeader>
					{userFeedbacks.map((feedback, feedbackIndex) => (
						<div
							className="flex flex-col gap-1 items-start justify-center sm:justify-center"
							key={feedbackIndex}
						>
							<Rating
								style={{ maxWidth: 180, fill: "white" }}
								value={feedback.rating}
								items={5}
								spaceBetween="medium"
								transition="zoom"
								readOnly
							/>
							<span className="text-ellipsis overflow-hidden w-full max-w-[200px] whitespace-nowrap pl-2">
								{feedback.feedback}
							</span>
						</div>
					))}
					<UserFeedback
						callId={callId}
						checkFeedback={checkFeedback}
						isOpen={isSheetOpen}
						onOpenChange={setIsSheetOpen}
						text="Add Review"
						buttonColor="primary"
					/>
				</DialogContent>
			</Dialog>
		</div>
	) : (
		<UserFeedback
			callId={callId}
			checkFeedback={checkFeedback}
			isOpen={isSheetOpen}
			onOpenChange={setIsSheetOpen}
			text="Write Review"
			buttonColor="default"
		/>
	);
};

export default FeedbackCheck;
