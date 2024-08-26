"use client";

import React, { useEffect, useState, Suspense, lazy, useRef } from "react";
import Link from "next/link";
import { getUsers } from "@/lib/actions/creator.actions";
import { creatorUser } from "@/types";
import CreatorHome from "@/components/creator/CreatorHome";
import { useCurrentUsersContext } from "@/lib/context/CurrentUsersContext";
import { usePathname } from "next/navigation";
import PostLoader from "@/components/shared/PostLoader";
import { useWalletBalanceContext } from "@/lib/context/WalletBalanceContext";

const CreatorsGrid = lazy(() => import("@/components/creator/CreatorsGrid"));

const HomePage = () => {
	const [creators, setCreators] = useState<creatorUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [creatorCount, setCreatorCount] = useState(6);
	const [error, setError] = useState(false);
	const { userType, setCurrentTheme } = useCurrentUsersContext();
	const { updateWalletBalance } = useWalletBalanceContext();
	const pathname = usePathname();
	const loaderRef = useRef<HTMLDivElement | null>(null);

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

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (entry.isIntersecting) {
					setCreatorCount((prevCount) => prevCount + 2);
				}
			},
			{
				root: null, // Use the viewport as the root
				rootMargin: "0px",
				threshold: 1.0, // Trigger when the loader is fully visible
			}
		);

		if (loaderRef.current) {
			observer.observe(loaderRef.current);
		}

		return () => {
			if (loaderRef.current) {
				observer.unobserve(loaderRef.current);
			}
		};
	}, []);

	useEffect(() => {
		updateWalletBalance();
	}, []);

	const handleCreatorCardClick = (username: string, theme: string) => {
		localStorage.setItem("creatorURL", `/${username}`);
		setCurrentTheme(theme);
	};

	const visibleCreators = creators?.slice(0, creatorCount + 1);

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
					) : creators && creators.length === 0 && !loading ? (
						<div className="size-full flex items-center justify-center text-2xl font-semibold text-center text-gray-500">
							No creators found.
						</div>
					) : (
						<section
							className={`grid grid-cols-2 gap-2.5 px-2.5 lg:gap-5 lg:px-0 items-center pb-6`}
						>
							{creators &&
								visibleCreators.map(
									(creator, index) =>
										parseInt(creator.audioRate, 10) !== 0 &&
										parseInt(creator.videoRate, 10) !== 0 &&
										parseInt(creator.chatRate, 10) !== 0 && (
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
										)
								)}
						</section>
					)}
					{/* Loader for Intersection Observer */}
					<div ref={loaderRef} className="w-full h-10" />
				</Suspense>
			) : (
				<CreatorHome />
			)}
		</main>
	);
};

export default HomePage;
