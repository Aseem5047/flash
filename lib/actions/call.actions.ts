import { connectToDatabase } from "@/lib/database";
import { handleError } from "@/lib/utils";
import { RegisterCallParams, UpdateCallParams } from "@/types";
import Call from "../database/models/call.model";

export async function createCall(call: RegisterCallParams) {
	try {
		await connectToDatabase();

		const newCall = await Call.create(call);
		console.log(newCall);
		return newCall.toJSON();
	} catch (error) {
		handleError(error);
	}
}

export async function getCalls() {
	try {
		await connectToDatabase();
		const calls = await Call.find();
		if (!calls || calls.length === 0) {
			throw new Error("No calls found");
		}
		return calls.map((call) => call.toJSON());
	} catch (error) {
		handleError(error);
	}
}

export async function getCallById(callId: string) {
	try {
		await connectToDatabase();

		const call = await Call.findById(callId);

		if (!call) throw new Error("Call not found");
		return call.toJSON();
	} catch (error) {
		handleError(error);
	}
}

export async function updateUser(callId: string, user: UpdateCallParams) {
	try {
		await connectToDatabase();
		const updatedUser = await Call.findByIdAndUpdate(callId, user, {
			new: true,
		});

		if (!updatedUser) {
			throw new Error("User not found");
		}

		return updatedUser.toJSON(); // No need to stringify and parse
	} catch (error) {
		handleError(error); // Use handleError function for consistent error handling
	}
}
