"use client";

import CreatorCard from "@/components/creator/CreatorCard";
import SinglePostLoader from "@/components/shared/SinglePostLoader";
import { getCreatorById } from "@/lib/actions/creator.actions";
import { useCurrentUsersContext } from "@/lib/context/CurrentUsersContext";
import { analytics } from "@/lib/firebase";
import { logEvent } from "firebase/analytics";
import { useParams, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

const CreatorProfile = () => {
	const [creator, setCreator] = useState(null);
	const [loading, setLoading] = useState(true);
	const { userId } = useParams();
	const pathname = usePathname();

	const [eventLogged, setEventLogged] = useState(false);
	const { currentUser } = useCurrentUsersContext();

	useEffect(() => {
		if (!eventLogged && currentUser) {
			logEvent(analytics, "visit", {
				clientId: currentUser?._id,
				creatorId: userId,
			});
			setEventLogged(true);
		}
	}, [eventLogged, currentUser, userId]);

	useEffect(() => {
		const getCreator = async () => {
			try {
				const response = await getCreatorById(String(userId));
				setCreator(response);
			} catch (error) {
				console.log(error);
			} finally {
				setLoading(false);
			}
		};

		setLoading(true);
		if (currentUser) {
			getCreator();
		}
	}, [pathname]);

	if (loading) {
		return (
			<section className="w-full h-full flex items-center justify-center">
				<SinglePostLoader />
			</section>
		);
	}

	return (
		<div className="flex items-start justify-start h-full overflow-scroll no-scrollbar md:pb-14">
			{!creator ? (
				<div className="size-full flex items-center justify-center text-2xl font-semibold text-center text-red-500">
					No creators found.
				</div>
			) : (
				<CreatorCard creator={creator} />
			)}
		</div>
	);
};

export default CreatorProfile;
