"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { updateUser } from "@/lib/actions/client.actions";
import { UpdateCreatorParams, UpdateUserParams } from "@/types";
import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import { editProfileFormSchema } from "@/lib/validator";
import { Textarea } from "../ui/textarea";
import axios from "axios";
import { useToast } from "../ui/use-toast";
import FileUploader from "../shared/FileUploader";
import { updateCreatorUser } from "@/lib/actions/creator.actions";

export type EditProfileProps = {
	userData: UpdateUserParams;
	setUserData: any;
	initialState: UpdateUserParams;
	setEditData: React.Dispatch<React.SetStateAction<boolean>>;
	userType: string | null;
};

const EditProfile = ({
	userData,
	setUserData,
	initialState,
	setEditData,
	userType,
}: EditProfileProps) => {
	const { user } = useUser();
	const userId = user?.id;
	const { toast } = useToast();
	const [isChanged, setIsChanged] = useState(false); // State to track if any changes are made

	// 1. Define your form.
	const form = useForm<z.infer<typeof editProfileFormSchema>>({
		resolver: zodResolver(editProfileFormSchema),
		defaultValues: {
			firstName: userData.firstName,
			lastName: userData.lastName,
			username: userData.username,
			photo: userData.photo,
			bio: userData.bio,
		},
	});

	// Watch form values to detect changes
	const watchedValues = useWatch({ control: form.control });

	useEffect(() => {
		const hasChanged =
			watchedValues.firstName !== initialState.firstName ||
			watchedValues.lastName !== initialState.lastName ||
			watchedValues.username !== initialState.username ||
			watchedValues.photo !== initialState.photo ||
			watchedValues.bio !== initialState.bio;

		setIsChanged(hasChanged);
	}, [watchedValues, initialState]);

	// Utility function to get updated value or fallback to existing value
	const getUpdatedValue = (
		newValue: string,
		initialValue: string,
		existingValue: string
	) => (newValue !== initialValue ? newValue : existingValue);

	// Utility function to get non-empty bio or fallback to existing bio
	const getBio = (newBio: string, existingBio: any) =>
		newBio.length !== 0 ? newBio : existingBio;

	// 2. Define a submit handler.
	async function onSubmit(values: z.infer<typeof editProfileFormSchema>) {
		try {
			const commonValues = {
				firstName: getUpdatedValue(
					values.firstName,
					initialState.firstName,
					userData.firstName
				),
				lastName: getUpdatedValue(
					values.lastName,
					initialState.lastName,
					userData.lastName
				),
				username: getUpdatedValue(
					values.username,
					initialState.username,
					userData.username
				),
				bio: getBio(values.bio || "", userData.bio || ""),
				photo: values.photo,
			};

			let response;
			let newUserDetails;

			if (userType === "creator") {
				const updatedCreatorValues = { ...commonValues };
				response = await updateCreatorUser(
					userData.id!,
					updatedCreatorValues as UpdateCreatorParams
				);
				console.log("Creator response:", response);
				const updatedUser = response.updatedUser;

				newUserDetails = {
					...userData,
					fullName: `${updatedUser.firstName} ${updatedUser.lastName}`,
					firstName: updatedUser.firstName,
					lastName: updatedUser.lastName,
					username: updatedUser.username,
					photo: updatedUser.photo,
					bio: updatedUser.bio,
				};
			} else {
				const updatedValues = {
					...commonValues,
					userType: userData.role,
				};
				response = await axios.post("/api/update-user", updatedValues);
				const updatedUser = response.data.updatedUser;
				console.log("User response:", updatedUser);

				newUserDetails = {
					...userData,
					fullName: `${updatedUser.firstName} ${updatedUser.lastName}`,
					firstName: updatedUser.firstName,
					lastName: updatedUser.lastName,
					username: updatedUser.username,
					photo: updatedUser.unsafeMetadata.photo,
					bio: updatedUser.unsafeMetadata.bio,
				};
			}

			setUserData(newUserDetails);

			toast({
				title: "Details Edited Successfully",
				description: "Changes are now visible on your profile section...",
			});

			setEditData((prev) => !prev);
		} catch (error) {
			console.error("Error updating user details:", error);
			toast({
				variant: "destructive",
				title: "Unable to Edit Details",
				description: "Try Again Editing your Details",
			});
		}
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-8 w-full flex flex-col items-center"
			>
				<FormField
					control={form.control}
					name="photo"
					render={({ field }) => (
						<FormItem className="w-full">
							<FormControl>
								<FileUploader
									fieldChange={field.onChange}
									mediaUrl={userData?.photo}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="firstName"
					render={({ field }) => (
						<FormItem className="w-full">
							<FormLabel>First Name</FormLabel>
							<FormControl>
								<Input
									placeholder="Edit First Name"
									{...field}
									className="input-field"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="lastName"
					render={({ field }) => (
						<FormItem className="w-full">
							<FormLabel>Last Name</FormLabel>
							<FormControl>
								<Input
									placeholder="Edit Last Name"
									{...field}
									className="input-field"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="username"
					render={({ field }) => (
						<FormItem className="w-full">
							<FormLabel>Username</FormLabel>
							<FormControl>
								<Input
									placeholder="Edit your Username"
									{...field}
									className="input-field"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="bio"
					render={({ field }) => (
						<FormItem className="w-full">
							<FormLabel className="font-normal">
								{userData?.bio?.length === 0 ? "Add" : "Edit"} Description
							</FormLabel>
							<FormControl>
								<Textarea
									className="textarea max-h-32"
									placeholder="Tell us a little bit about yourself"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{isChanged && (
					<Button
						className="bg-green-1 hover:opacity-80 w-3/4 mx-auto text-white"
						type="submit"
					>
						Update Details
					</Button>
				)}
			</form>
		</Form>
	);
};

export default EditProfile;
