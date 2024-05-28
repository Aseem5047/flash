// pages/api/feedback/getCallFeedbacks.ts

import { NextResponse } from "next/server";
import { getCallFeedbacks } from "@/lib/actions/feedback.actions";

export async function GET(request: Request) {
	try {
		const url = new URL(request.url);
		const callId = url.searchParams.get("callId");

		if (!callId) {
			return new NextResponse("Invalid callId", { status: 400 });
		}

		const result = await getCallFeedbacks(callId);
		return NextResponse.json(result);
	} catch (error) {
		console.error(error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
