"use client";

import React, { useEffect, useState, Suspense, lazy } from "react";
import Link from "next/link";
import { getUsers } from "@/lib/actions/creator.actions";
import { creatorUser } from "@/types";
import CreatorHome from "@/components/creator/CreatorHome";
import { useCurrentUsersContext } from "@/lib/context/CurrentUsersContext";
import { usePathname } from "next/navigation";
import PostLoader from "@/components/shared/PostLoader";

const CreatorsGrid = lazy(() => import("@/components/creator/CreatorsGrid"));

const HomePage = () => {
	const [creators, setCreators] = useState<creatorUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const { userType, setCurrentTheme } = useCurrentUsersContext();
	const pathname = usePathname();

	useEffect(() => {
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
		if (userType !== "creator") {
			getCreators();
		}
	}, [pathname]);

	return (
		<main className="flex size-full flex-col gap-5">
			{userType !== "creator" ? (
				<Suspense fallback={<PostLoader count={6} />}>
					{loading ? (
						<PostLoader count={6} />
					) : error ? (
						<div className="size-full flex items-center justify-center text-2xl font-semibold text-center text-red-500">
							Failed to fetch creators <br />
							Please try again later.
						</div>
					) : creators && creators.length === 0 ? (
						<div className="size-full flex items-center justify-center text-2xl font-semibold text-center text-gray-500">
							No creators found.
						</div>
					) : (
						<section
							className={`grid grid-cols-2 gap-2.5 px-2.5 lg:gap-5 lg:px-5
							} xl:grid-cols-2 items-center 3xl:items-start justify-start h-fit pb-6`}
						>
							{creators &&
								creators.map(
									(creator, index) =>
										parseInt(creator.audioRate, 10) !== 0 &&
										parseInt(creator.videoRate, 10) !== 0 &&
										parseInt(creator.chatRate, 10) !== 0 && (
											<Link
												href={`/expert/${creator.username}/${creator._id}`}
												key={creator._id || index}
											>
												<section
													className="min-w-full transition-all duration-500 hover:scale-95"
													onClick={() => setCurrentTheme(creator.themeSelected)}
												>
													<CreatorsGrid creator={creator} />
												</section>
											</Link>
										)
								)}
						</section>
					)}
				</Suspense>
			) : (
				<CreatorHome />
			)}
		</main>
	);
};

export default HomePage;
