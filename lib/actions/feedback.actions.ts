"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/database";
import { handleError } from "@/lib/utils";
import CallFeedbacks from "../database/models/callFeedbacks.model";
import CreatorFeedbacks from "../database/models/creatorFeedbacks.model";

export async function createFeedback({
	creatorId,
	clientId,
	rating,
	feedbackText,
	callId,
}: {
	creatorId?: string;
	clientId: string; // Ensure clientId is string here
	rating: number;
	feedbackText: string;
	callId?: string;
}) {
	try {
		await connectToDatabase();

		if (callId) {
			// Handle call feedback
			await CallFeedbacks.findOneAndUpdate(
				{ callId },
				{
					$setOnInsert: {
						callId: callId,
					},
					$push: {
						feedbacks: {
							clientId,
							rating,
							feedback: feedbackText,
						},
					},
				},
				{
					upsert: true,
					new: true,
					setDefaultsOnInsert: true,
				}
			).exec();
		} else if (creatorId) {
			// Handle creator feedback
			await CreatorFeedbacks.findOneAndUpdate(
				{ creatorId },
				{
					$setOnInsert: {
						creatorId: creatorId,
					},
					$push: {
						feedbacks: {
							clientId,
							rating,
							feedback: feedbackText,
						},
					},
				},
				{
					upsert: true,
					new: true,
					setDefaultsOnInsert: true,
				}
			).exec();
		} else {
			throw new Error("Either creatorId or callId must be provided.");
		}

		// Revalidate the path to ensure the data is fresh
		revalidatePath("/path-to-revalidate");

		return { success: true };
	} catch (error: any) {
		handleError(error);
		console.log("Error Creating Feedback ... ", error);
		return { success: false, error: error.message };
	}
}

export async function getCreatorFeedbacks(creatorId: string) {
	try {
		await connectToDatabase();

		const feedbacks = await CreatorFeedbacks.find(
			{ creatorId },
			{ feedbacks: 1 }
		).lean();

		// Return the feedbacks as JSON
		return JSON.parse(JSON.stringify(feedbacks));
	} catch (error: any) {
		console.log(error);
		return { success: false, error: error.message };
	}
}

export async function getCallFeedbacks(callId: string) {
	try {
		await connectToDatabase();

		const feedbacks = await CallFeedbacks.find(
			{ callId },
			{ feedbacks: 1 }
		).lean();

		// Return the feedbacks as JSON
		return JSON.parse(JSON.stringify(feedbacks));
	} catch (error: any) {
		console.log(error);
		return { success: false, error: error.message };
	}
}
