"use server";

import { StreamClient } from "@stream-io/node-sdk";
import { fetchFCMToken } from "../utils";

const STREAM_API_KEY = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const STREAM_API_SECRET = process.env.STREAM_SECRET_KEY;

export const tokenProvider = async (
	userId: string,
	username: string | undefined,
	photo: string | undefined,
	phone: string | undefined
) => {
	if (!STREAM_API_KEY) throw new Error("Stream API key secret is missing");
	if (!STREAM_API_SECRET) throw new Error("Stream API secret is missing");

	const streamClient = new StreamClient(STREAM_API_KEY, STREAM_API_SECRET);
	const fcmToken = await fetchFCMToken(phone ?? "");

	// Register the user in Stream
	const userData = {
		id: userId,
		name: username || userId,
		image: photo,
		phone: phone,
		role: "admin",
		devices: fcmToken ? [{ id: fcmToken, push_provider: "Flash" }] : [],
	};

	const users = {
		[userId]: userData,
	};

	await streamClient.upsertUsers({ users });

	const expirationTime = Math.floor(Date.now() / 1000) + 3600;
	const issuedAt = Math.floor(Date.now() / 1000) - 60;

	const token = streamClient.createToken(userId, expirationTime, issuedAt);

	return token;
};
