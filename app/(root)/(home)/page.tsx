"use client";

import CreatorDetails from "@/components/creator/CreatorDetails";
import PostLoader from "@/components/shared/PostLoader";
import { getUsers } from "@/lib/actions/creator.actions";
import { creatorUser } from "@/types";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const HomePage = () => {
	const [creators, setCreators] = useState<creatorUser[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setLoading(true);
		try {
			const getCreators = async () => {
				const response = await getUsers();
				setCreators(response);
			};

			getCreators();
		} catch (error) {
			console.error(error);
		} finally {
			setTimeout(() => {
				setLoading(false);
			}, 2500);
		}
	}, []);

	if (!creators || loading) return <PostLoader items={creators} />;

	return (
		<section className="flex size-full flex-col gap-5 ">
			<div className="grid grid-cols-1 xl:grid-cols-2 gap-10 items-center 3xl:items-start justify-start h-full pb-6">
				{creators.map((creator, index) => (
					<Link
						href={`/creator/${creator._id}`}
						className="min-w-full transition-all duration-500 hover:scale-95 hover:md:scale-105"
						key={creator._id || index}
					>
						<CreatorDetails creator={creator} />
					</Link>
				))}
			</div>
		</section>
	);
};

export default HomePage;
