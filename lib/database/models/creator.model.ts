import { Schema, model, models } from "mongoose";

// Define the LinkSchema
const LinkSchema = new Schema(
	{
		title: { type: String, required: true },
		url: { type: String, required: true },
		isActive: { type: Boolean, required: true },
	},
	{ _id: false }
);

// Define the CreatorSchema
const CreatorSchema = new Schema(
	{
		username: { type: String, unique: true },
		phone: { type: String, required: true, unique: true },
		fullName: { type: String },
		firstName: { type: String },
		lastName: { type: String },
		photo: { type: String },
		profession: { type: String, required: true },
		themeSelected: { type: String },
		videoRate: { type: String, required: true },
		audioRate: { type: String, required: true },
		chatRate: { type: String, required: true },
		videoAllowed: { type: Boolean, default: false },
		audioAllowed: { type: Boolean, default: false },
		chatAllowed: { type: Boolean, default: false },
		gender: { type: String },
		dob: { type: String },
		bio: { type: String },
		kycStatus: { type: String, default: "PENDING" },
		paymentSettingsStatus: { type: String, default: "PENDING" },
		walletBalance: { type: Number, default: 0 },
		referralId: { type: String, unique: true },
		referredBy: { type: String, default: null },
		creatorId: { type: String, unique: true },
		links: { type: [LinkSchema], default: [] },
		restricted: { type: Boolean, default: false },
		blocked: [{ type: Schema.Types.ObjectId, ref: "Client" }],
	},
	{
		timestamps: true,
	}
);

// Pre-save hook to round walletBalance to the nearest two decimals
CreatorSchema.pre("save", function (next) {
	if (this.isModified("walletBalance")) {
		this.walletBalance = Math.round(this.walletBalance * 100) / 100;
	}
	next();
});

const Creator = models.Creator || model("Creator", CreatorSchema);

export default Creator;
