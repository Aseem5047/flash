// sendOTP.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const { phone } = await req.json();
		const countryCode = 91;
		const fullPhoneNumber = `+${countryCode}${phone}`;
		if (!phone) {
			return NextResponse.json(
				{ error: "Phone number is required" },
				{ status: 400 }
			);
		}

		const apiKey = process.env.TWOFACTOR_API_KEY!;
		if (!apiKey) {
			return NextResponse.json(
				{ error: "2Factor API Key missing" },
				{ status: 400 }
			);
		}
		const otpTemplateName = "OTP1";

		const response = await fetch(
			`https://2factor.in/API/V1/${apiKey}/SMS/${fullPhoneNumber}/AUTOGEN2/${otpTemplateName}`
		);

		const data = await response.json();

		if (response.ok && data.Status === "Success") {
			// Return a success response with the OTP
			return NextResponse.json({
				message: "OTP sent successfully",
			});
		} else {
			return NextResponse.json({ error: data.Details }, { status: 500 });
		}
	} catch (error) {
		return NextResponse.json({ error }, { status: 500 });
	}
}
