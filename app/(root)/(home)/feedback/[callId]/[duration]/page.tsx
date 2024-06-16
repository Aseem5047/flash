"use client";

import CallFeedback from "@/components/feedbacks/CallFeedback";
import SinglePostLoader from "@/components/shared/SinglePostLoader";
import { useToast } from "@/components/ui/use-toast";
import { useGetCallById } from "@/hooks/useGetCallById";
import { getUserById } from "@/lib/actions/creator.actions";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { Cursor, Typewriter } from "react-simple-typewriter";

const CallFeedbackPage = () => {
	const { callId, duration } = useParams();
	const router = useRouter();
	const { toast } = useToast();
	const [loading, setLoading] = useState(true); // Loading state
	const [showFeedback, setShowFeedback] = useState(false);
	const { call } = useGetCallById(callId);
	const isVideoCall = useMemo(() => call?.type === "default", [call]);
	const expert = call?.state?.members?.find(
		(member) => member.custom.type === "expert"
	);

	useEffect(() => {
		const fetchFeedbacks = async () => {
			try {
				const response = await fetch(
					`/api/v1/feedback/call/getFeedbacks?callId=${callId}`
				);
				const feedbacks = await response.json();

				if (feedbacks.length > 0) {
					// Feedback exists, redirect to homepage
					toast({
						title: "Feedback Already Exists",
						description: "Returning to HomePage ...",
					});
					router.push("/");
				} else {
					// No feedback, show feedback form
					setShowFeedback(true);
				}
			} catch (error) {
				console.error("Error fetching feedbacks:", error);
				toast({
					title: "Error",
					description: "An error occurred while fetching feedbacks",
				});
			} finally {
				setLoading(false);
			}
		};

		fetchFeedbacks();
	}, [callId, router, toast]);

	const handleFeedbackClose = async () => {
		setShowFeedback(false);
		toast({
			title: "Thanks For The Feedback",
			description: "Hope to See You Again ...",
		});

		if (!call?.state?.createdBy?.id) {
			console.error("Client ID is undefined");
			return;
		}

		if (!expert?.user_id) {
			console.error("Creator ID is undefined");
			return;
		}

		const creatorId = "664c90ae43f0af8f1b3d5803";
		const clientId = call.state.createdBy.id;

		setLoading(true); // Set loading to true

		try {
			// Check if the transaction already exists
			const response = await fetch(
				`/api/v1/calls/transaction/getTransaction?callId=${callId as string}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			const transaction = await response.json();

			if (transaction) {
				console.log("Transaction already exists:", transaction);
				setLoading(false); // Set loading to false
				router.push("/"); // Redirect to the homepage
				return;
			}

			// Fetch creator's rate and calculate the amount to be paid
			const creator = await getUserById(creatorId);
			if (!creator) {
				console.error("Creator not found");
				return;
			}

			const rate = isVideoCall ? creator.videoRate : creator.audioRate;
			const amountToBePaid = (
				(parseInt(duration as string, 10) / 60) *
				rate
			).toFixed(2); // Assuming duration is in seconds

			console.log(duration, amountToBePaid, rate);

			// Create a new call transaction
			await fetch("/api/v1/calls/transaction/create", {
				method: "POST",
				body: JSON.stringify({
					callId: callId as string,
					amountPaid: amountToBePaid,
					isDone: true,
				}),
				headers: { "Content-Type": "application/json" },
			});

			// Process the payout from the client's wallet
			await fetch("/api/v1/wallet/payout", {
				method: "POST",
				body: JSON.stringify({
					userId: clientId,
					userType: "Client",
					amount: amountToBePaid,
				}),
				headers: { "Content-Type": "application/json" },
			});

			// Add the money to the creator's wallet
			await fetch("/api/v1/wallet/addMoney", {
				method: "POST",
				body: JSON.stringify({
					userId: creatorId,
					userType: "Creator",
					amount: amountToBePaid,
				}),
				headers: { "Content-Type": "application/json" },
			});

			// Redirect to the homepage
			router.push("/");
		} catch (error) {
			console.error("Error handling wallet changes:", error);
			toast({
				title: "Error",
				description: "An error occurred while processing the requests",
			});
		} finally {
			setLoading(false); // Set loading to false
		}
	};

	if (loading)
		return (
			<section className="w-full h-full flex items-center justify-center">
				<SinglePostLoader />;
				<h1 className="text-2xl font-semibold mt-7">
					<Typewriter
						words={[
							`Hi There ${expert?.user?.name}`,
							"Processing Transactions Requests",
							"Please Wait ...",
						]}
						loop={true}
						cursor
						cursorStyle="_"
						typeSpeed={70}
						deleteSpeed={50}
						delaySpeed={2000}
					/>
					<Cursor cursorColor="#0E78F9" />
				</h1>
			</section>
		);

	return (
		<section className="w-full h-full flex items-center justify-center">
			<CallFeedback
				callId={callId as string}
				isOpen={showFeedback}
				onOpenChange={handleFeedbackClose}
			/>
		</section>
	);
};

export default CallFeedbackPage;
