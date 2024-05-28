import mongoose, { Schema, model, models } from "mongoose";

// Define the feedback entry schema
const FeedbackEntrySchema = new Schema(
	{
		clientId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Client",
			required: true,
		},
		rating: { type: Number, required: true },
		feedback: { type: String, required: true },
	},
	{ _id: false }
);

// Define the creator feedback schema
const CreatorFeedbackSchema = new Schema(
	{
		creatorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Creator",
			required: true,
			unique: true, // Ensure creatorId is unique
		},
		feedbacks: [FeedbackEntrySchema],
	},
	{
		timestamps: true,
	}
);

// Check if the model already exists before defining it
const CreatorFeedbacks =
	models.CreatorFeedbacks || model("CreatorFeedbacks", CreatorFeedbackSchema);

export default CreatorFeedbacks;
