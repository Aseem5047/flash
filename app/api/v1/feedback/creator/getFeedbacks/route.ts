// pages/api/feedback/getCreatorFeedbacks.ts

import { NextResponse } from "next/server";
import { getCreatorFeedbacks } from "@/lib/actions/feedback.actions";

export async function GET(request: Request) {
	try {
		const url = new URL(request.url);
		const creatorId = url.searchParams.get("creatorId");

		if (!creatorId) {
			return new NextResponse("Invalid creatorId", { status: 400 });
		}

		const result = await getCreatorFeedbacks(creatorId);
		return NextResponse.json(result);
	} catch (error) {
		console.error(error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
