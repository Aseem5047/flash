import { NextRequest, NextResponse } from "next/server";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { updateUser } from "@/lib/actions/client.actions";

export async function POST(req: NextRequest) {
	const { userId } = getAuth(req);
	if (!userId) return NextResponse.redirect("/sign-in");

	const { firstName, lastName, username, bio, photo, userType } =
		await req.json();

	// Update user attributes including the profile image
	const updatedUser = await clerkClient.users.updateUser(userId, {
		firstName,
		lastName,
		username,
		unsafeMetadata: { userType, bio, photo },
	});

	await updateUser(String(userId), {
		firstName,
		lastName,
		username,
		bio,
		photo,
	});

	return NextResponse.json({ updatedUser });
}
