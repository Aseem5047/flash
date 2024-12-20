import * as z from "zod";
const usernameRegex = /^[a-zA-Z0-9_-]+$/;

export const UpdateProfileFormSchema = z.object({
	firstName: z
		.string()
		.min(3, "First Name be at least 3 characters")
		.max(10, "First Name must be at most 10 characters"),
	lastName: z
		.string()
		.min(3, "Last name must be at least 3 characters")
		.max(20, "Last Name must be at most 20 characters"),
	username: z
		.string()
		.min(4, "Username must be at least 4 characters")
		.max(20, "Username must be at most 20 characters")
		.regex(
			usernameRegex,
			"Username can only contain letters, numbers, underscores, and hyphens"
		),
	profession: z.string().min(3, "Profession must be at least 3 characters"),
	themeSelected: z.string().min(6, "Profile Theme must be a valid hexcode"),
	photo: z.string().optional(),
	bio: z.string().optional(),
	gender: z.string().min(3, "This field is Required"),
	dob: z.string().min(6, "This field is Required"),
	referredBy: z.string().optional(),
});

export const UpdateProfileFormSchemaClient = z.object({
	firstName: z
		.string()
		.min(3, "First Name be at least 3 characters")
		.max(10, "First Name must be at most 10 characters"),
	lastName: z
		.string()
		.min(3, "Last name must be at least 3 characters")
		.max(20, "Last Name must be at most 20 characters"),
	username: z
		.string()
		.min(4, "Username must be at least 4 characters")
		.max(20, "Username must be at most 20 characters")
		.regex(
			usernameRegex,
			"Username can only contain letters, numbers, underscores, and hyphens"
		),
	profession: z.string().optional(),
	referredBy: z.string().optional(),
	themeSelected: z.string().optional(),
	photo: z.string().optional(),
	bio: z.string().optional(),
	gender: z.string().optional(),
	dob: z.string().optional(),
});

export const enterAmountSchema = z.object({
	rechargeAmount: z
		.string()
		.regex(/^\d+$/, "Amount must be a numeric value")
		.min(1, "Amount must be at least 1 rupees")
		.max(6, "Amount must be at most 1,00,000 rupees"),
});

export const enterTipAmountSchema = z.object({
	amount: z
		.string()
		.regex(/^\d+$/, "Amount must be a numeric value")
		.min(1, "Amount must be at least 1 rupees")
		.max(6, "Amount must be at most 1,00,000 rupees"),
});

export const reportSchema = z.object({
	issue: z
		.string()
		.min(10, "Content must be at least 10 characters")
		.max(500, "Words Limit Exceeded"),
});
