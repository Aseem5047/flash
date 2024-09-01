"use client";

import React, { useEffect, useState, Suspense, lazy, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { getUsersPaginated } from "@/lib/actions/creator.actions";
import { creatorUser } from "@/types";
import CreatorHome from "@/components/creator/CreatorHome";
import { useCurrentUsersContext } from "@/lib/context/CurrentUsersContext";
import { usePathname } from "next/navigation";
import PostLoader from "@/components/shared/PostLoader";
import Image from "next/image";

const CreatorsGrid = lazy(() => import("@/components/creator/CreatorsGrid"));

/*

Approach ...

1. Check Cache -> Display Cached Data if Valid -> Fetch New Data -> Compare & Update State -> Re-render with Updated Data.
2. On Scroll -> Fetch More Data -> Filter & Update State -> Re-render with New Data.

*/

const HomePage = () => {
	const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes
	const [creators, setCreators] = useState<creatorUser[]>(() => {
		const cachedCreators = localStorage.getItem("creators");
		return cachedCreators ? JSON.parse(cachedCreators) : [];
	});
	const [loading, setLoading] = useState(creators.length === 0);
	const [creatorCount, setCreatorCount] = useState(creators.length);
	const [isFetching, setIsFetching] = useState(false);
	const [error, setError] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const { userType, setCurrentTheme } = useCurrentUsersContext();
	const pathname = usePathname();
	const { ref, inView } = useInView();

	const fetchCreators = useCallback(
		async (offset: number, limit: number, isInitialFetch: boolean = false) => {
			try {
				setIsFetching(true);
				const response = await getUsersPaginated(offset, limit);

				if (isInitialFetch) {
					// Handle initial fetch or cache refresh
					if (response.length > 0 && response[0]._id !== creators[0]?._id) {
						setCreators(response);
						localStorage.setItem("creators", JSON.stringify(response));
						localStorage.setItem("creatorsLastFetched", Date.now().toString());
						setCreatorCount(response.length);
						setHasMore(response.length === limit);
					}
				} else {
					// Handle pagination
					const filteredNewCreators = response.filter(
						(newCreator: creatorUser) =>
							!creators.some((creator) => creator._id === newCreator._id)
					);

					const newCreators = [...creators, ...filteredNewCreators];

					setCreators(newCreators);
					localStorage.setItem("creators", JSON.stringify(newCreators));
					localStorage.setItem("creatorsLastFetched", Date.now().toString());

					if (filteredNewCreators.length > 0) {
						setCreatorCount(newCreators.length);
						setHasMore(filteredNewCreators.length === limit);
					} else {
						setHasMore(false);
					}
				}
			} catch (error) {
				console.error(error);
				Sentry.captureException(error);
				setError(true);
			} finally {
				setLoading(false);
				setIsFetching(false);
			}
		},
		[creators]
	);

	useEffect(() => {
		const lastFetched = localStorage.getItem("creatorsLastFetched");
		const now = Date.now();

		// If cached creators exist, show them immediately
		if (
			creators.length > 0 &&
			(!lastFetched || now - parseInt(lastFetched) <= CACHE_EXPIRY_TIME)
		) {
			setLoading(false); // Cached creators are already displayed
		}

		// Fetch the latest creators in the background
		fetchCreators(0, 6, true);
	}, [pathname, fetchCreators]);

	useEffect(() => {
		if (inView && !isFetching && hasMore) {
			fetchCreators(creatorCount, 2);
		}
	}, [inView, isFetching, hasMore, creatorCount, fetchCreators]);

	const handleCreatorCardClick = (username: string, theme: string) => {
		localStorage.setItem("creatorURL", `/${username}`);
		setCurrentTheme(theme);
	};

	return (
		<main className="flex size-full flex-col gap-2">
			{userType !== "creator" ? (
				<Suspense fallback={<PostLoader count={6} />}>
					{loading ? (
						<PostLoader count={6} />
					) : error ? (
						<div className="size-full flex items-center justify-center text-2xl font-semibold text-center text-red-500">
							Failed to fetch creators <br />
							Please try again later.
						</div>
					) : creators && creators.length === 0 && !loading ? (
						<div className="size-full flex items-center justify-center text-2xl font-semibold text-center text-gray-500">
							No creators found.
						</div>
					) : (
						<section
							className={`grid grid-cols-2 gap-2.5 px-2.5 lg:gap-5 lg:px-0 items-center`}
						>
							{creators &&
								creators.map((creator, index) => (
									<Link
										href={`/${creator.username}`}
										key={creator._id || index}
									>
										<section
											className="min-w-full transition-all duration-500 hover:scale-95"
											onClick={() =>
												handleCreatorCardClick(
													creator.username,
													creator.themeSelected
												)
											}
										>
											<CreatorsGrid creator={creator} />
										</section>
									</Link>
								))}
						</section>
					)}
					{hasMore && isFetching && (
						<Image
							src="/icons/loading-circle.svg"
							alt="Loading..."
							width={50}
							height={50}
							className="mx-auto invert my-4 z-20"
						/>
					)}
					{hasMore && <div ref={ref} className=" mt-10 w-full" />}
					{!hasMore && !isFetching && (
						<div className="text-center text-gray-500 py-4">
							You have reached the end of the list.
						</div>
					)}
				</Suspense>
			) : (
				<CreatorHome />
			)}
		</main>
	);
};

export default HomePage;
