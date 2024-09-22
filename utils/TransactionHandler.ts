import * as Sentry from "@sentry/nextjs";

export const transactionHandler = async ({
	expertId,
	clientId,
	callId,
	duration,
	isVideoCall,
}: {
	expertId: string;
	clientId: string;
	callId: string;
	duration: string;
	isVideoCall: boolean;
}) => {
	// Check if a transaction already exists for the given callId
	const transactionResponse = await fetch(
		`/api/v1/calls/transaction/getTransaction?callId=${callId}`
	);
	const existingTransaction = await transactionResponse.json();
	// If a transaction exists and any of the callDetails have isDone: true, return early
	if (existingTransaction) {
		console.log("Transaction for this callId has already been completed.");

		return;
	}

	try {
		const creatorResponse = await fetch(`/api/v1/creator/getUserById`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ userId: expertId }),
		});
		const creator = await creatorResponse.json();

		if (!creator) {
			console.error("Creator not found.");
			return;
		}

		const rate = isVideoCall ? creator.videoRate : creator.audioRate;
		const amountToBePaid = ((parseFloat(duration) / 60) * rate).toFixed(2);

		// Perform wallet transactions
		await Promise.all([
			fetch("/api/v1/wallet/payout", {
				method: "POST",
				body: JSON.stringify({
					userId: clientId,
					userType: "Client",
					amount: amountToBePaid,
				}),
				headers: { "Content-Type": "application/json" },
			}),
			fetch("/api/v1/wallet/addMoney", {
				method: "POST",
				body: JSON.stringify({
					userId: expertId,
					userType: "Creator",
					amount: (parseInt(amountToBePaid) * 0.8).toFixed(2),
				}),
				headers: { "Content-Type": "application/json" },
			}),
			fetch("/api/v1/calls/transaction/create", {
				method: "POST",
				body: JSON.stringify({
					callId,
					amountPaid: amountToBePaid,
					isDone: true,
					callDuration: parseInt(duration, 10),
				}),
				headers: { "Content-Type": "application/json" },
			}),
		]);
	} catch (error) {
		Sentry.captureException(error);
		console.error("Error handling wallet changes:", error);
	}
};
