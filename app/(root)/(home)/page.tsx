"use client";

import React, { useEffect, useState, Suspense, lazy } from "react";
import Link from "next/link";
import { getUsers } from "@/lib/actions/creator.actions";
import { creatorUser } from "@/types";
import { useUser } from "@clerk/nextjs";

const CreatorDetails = lazy(
	() => import("@/components/creator/CreatorDetails")
);
const PostLoader = lazy(() => import("@/components/shared/PostLoader"));

const HomePage = () => {
	const [creators, setCreators] = useState<creatorUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const { user } = useUser();

	const storedUserType = localStorage.getItem("userType");
	const userType = storedUserType ? storedUserType : null;

	useEffect(() => {
		// If userType is not set and user role is available, set it in localStorage
		if (!userType && user?.publicMetadata?.role) {
			localStorage.setItem("userType", user.publicMetadata.role as string);
		}

		const getCreators = async () => {
			try {
				const response = await getUsers();
				setCreators(response);
			} catch (error) {
				console.error(error);
				setError(true);
			} finally {
				setLoading(false);
			}
		};

		// Fetch creators if the user is not a creator
		if (userType !== "creator" && user?.publicMetadata?.role !== "creator") {
			getCreators();
		}
	}, [user, userType]);

	const shouldShowCreators =
		userType === "creator" || user?.publicMetadata?.role === "creator";

	return (
		<section className="flex size-full flex-col gap-5 md:pb-14">
			{!shouldShowCreators ? (
				<Suspense fallback={<PostLoader count={6} />}>
					{loading ? (
						<PostLoader count={6} />
					) : error ? (
						<div className="size-full flex items-center justify-center text-2xl font-semibold text-center text-red-500">
							Failed to fetch creators <br />
							Please try again later.
						</div>
					) : creators.length === 0 ? (
						<div className="size-full flex items-center justify-center text-2xl font-semibold text-center text-gray-500">
							No creators found.
						</div>
					) : (
						<div className="animate-in grid grid-cols-1 xl:grid-cols-2 gap-10 items-center 3xl:items-start justify-start h-fit pb-6">
							{creators.map((creator, index) => (
								<Link
									href={`/expert/${creator.username}/${creator._id}`}
									className="min-w-full transition-all duration-500 hover:scale-95"
									key={creator._id || index}
								>
									<CreatorDetails creator={creator} />
								</Link>
							))}
						</div>
					)}
				</Suspense>
			) : (
				<div className="size-full flex items-center justify-center text-2xl font-semibold text-center text-gray-500">
					Yet to be Implemented
				</div>
			)}
		</section>
	);
};

export default HomePage;
