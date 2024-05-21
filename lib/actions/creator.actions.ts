"use server";

import { revalidatePath } from "next/cache";

import { connectToDatabase } from "@/lib/database";

import { handleError } from "@/lib/utils";

import { CreateCreatorParams, UpdateCreatorParams } from "@/types";
import Creator from "../database/models/creator.model";

export async function createUser(user: CreateCreatorParams) {
	try {
		await connectToDatabase();

		const newUser = await Creator.create(user);
		console.log(newUser);
		return JSON.parse(JSON.stringify(newUser));
	} catch (error) {
		handleError(error);
	}
}

export async function getUserById(userId: string) {
	try {
		await connectToDatabase();

		const user = await Creator.findById(userId);

		if (!user) throw new Error("User not found");
		return JSON.parse(JSON.stringify(user));
	} catch (error) {
		handleError(error);
	}
}

export async function getUsers() {
	try {
		await connectToDatabase();
		const users = await Creator.find();
		if (!users || users.length === 0) {
			throw new Error("No users found");
		}
		return JSON.parse(JSON.stringify(users));
	} catch (error) {
		console.log(error);
	}
}

export async function updateUser(userI: string, user: UpdateCreatorParams) {
	try {
		await connectToDatabase();

		const updatedUser = await Creator.findOneAndUpdate({ userI }, user, {
			new: true,
		});

		if (!updatedUser) throw new Error("User update failed");
		return JSON.parse(JSON.stringify(updatedUser));
	} catch (error) {}
}

export async function updateTheme(userId: any, otherDetails: any) {
	try {
		await connectToDatabase();
		const updatedUser = await Creator.findOneAndUpdate(
			{ userId },
			otherDetails,
			{
				new: true,
			}
		);

		if (!updatedUser) throw new Error("User update failed");
		return JSON.parse(JSON.stringify(updatedUser));
	} catch (error) {
		handleError(error);
	}
}

export async function deleteUser(userI: string) {
	try {
		await connectToDatabase();

		// Find user to delete
		const userToDelete = await Creator.findOne({ userI });

		if (!userToDelete) {
			throw new Error("User not found");
		}

		// Delete user
		const deletedUser = await Creator.findByIdAndDelete(userToDelete._id);
		revalidatePath("/");

		return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
	} catch (error) {
		handleError(error);
	}
}
