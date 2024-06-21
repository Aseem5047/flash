import { connectToDatabase } from "@/lib/database";
import { WalletParams } from "@/types";
import Client from "../database/models/client.model";
import Creator from "../database/models/creator.model";
import Transaction from "../database/models/transaction.model";
import Wallet from "../database/models/wallet.models";
import { handleError } from "../utils";

export async function addMoney({ userId, userType, amount }: WalletParams) {
	try {
		await connectToDatabase();

		let user;
		if (userType === "Client") {
			user = await Client.findById(userId);
		} else if (userType === "Creator") {
			user = await Creator.findById(userId);
		} else {
			throw new Error("Invalid user type");
		}

		if (!user) throw new Error("User not found");

		// Ensure amount is a number
		const numericAmount = Number(amount);
		if (isNaN(numericAmount)) {
			throw new Error("Amount must be a number");
		}

		// Increment the user's wallet balance
		user.walletBalance = Number(user.walletBalance) + numericAmount;
		await user.save();

		// Update the Wallet collection
		const wallet = await Wallet.findOneAndUpdate(
			{ userId, userType },
			{ $inc: { balance: numericAmount } },
			{ new: true, upsert: true }
		);

		// Create a transaction record
		numericAmount > 0 &&
			(await Transaction.create({
				userId,
				userType,
				amount: numericAmount,
				type: "credit",
			}));

		return JSON.parse(JSON.stringify(wallet));
	} catch (error) {
		console.error("Error in addMoney:", error);
		throw new Error("Error adding money");
	}
}

export async function processPayout({
	userId,
	userType,
	amount,
}: WalletParams) {
	try {
		await connectToDatabase();

		let user;
		if (userType === "Client") {
			user = await Client.findById(userId);
		} else if (userType === "Creator") {
			user = await Creator.findById(userId);
		} else {
			throw new Error("Invalid user type");
		}

		if (!user) throw new Error("User not found");
		if (user.walletBalance < amount) throw new Error("Insufficient balance");

		// Ensure amount is a number
		const numericAmount = Number(amount);
		if (isNaN(numericAmount)) {
			throw new Error("Amount must be a number");
		}

		// Decrement the user's wallet balance
		user.walletBalance = Number(user.walletBalance) - numericAmount;
		await user.save();

		console.log("Wallet Balance: " + user.walletBalance);

		// Update the Wallet collection
		const wallet = await Wallet.findOneAndUpdate(
			{ userId, userType },
			{ $inc: { balance: -numericAmount } },
			{ new: true, upsert: true }
		);

		// Create a transaction record
		await Transaction.create({
			userId,
			userType,
			amount: numericAmount,
			type: "debit",
		});

		// Implement Razorpay payout logic here

		return JSON.parse(JSON.stringify(wallet));
	} catch (error) {
		console.error("Error in processPayout:", error);
		throw new Error("Error processing payout");
	}
}

export async function getTransactionsByUserId(userId: string) {
	try {
		await connectToDatabase();
		const transactions = await Transaction.find({ userId }).lean();
		console.log(transactions);
		return transactions;
	} catch (error) {
		console.error(error);
		handleError(error);
	}
}

export async function getTransactionsByType(type: "debit" | "credit") {
	try {
		await connectToDatabase();
		const transactions = await Transaction.find({ type }).lean();
		console.log(transactions);
		return transactions;
	} catch (error) {
		console.error(error);
		handleError(error);
	}
}

export async function getTransactionsByUserIdAndType(
	userId: string,
	type: "debit" | "credit"
) {
	try {
		await connectToDatabase();
		const transactions = await Transaction.find({ userId, type }).lean();
		console.log(transactions);
		return transactions;
	} catch (error) {
		console.error(error);
		handleError(error);
	}
}
