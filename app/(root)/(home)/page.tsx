"use client";

import OtpVerification from "@/components/forms/OtpVerification";
import CreatorCard from "@/components/shared/CreatorCard";
import Loader from "@/components/shared/Loader";
import { getUsers } from "@/lib/actions/creator.actions";
import { creatorUser } from "@/types";
import React, { useEffect, useState } from "react";

const HomePage = () => {
	const [creators, setCreators] = useState<creatorUser[]>([]);
	useEffect(() => {
		try {
			const getCreators = async () => {
				const response = await getUsers();
				setCreators(response);
			};

			getCreators();
		} catch (error) {
			console.error(error);
		}
	}, []);

	console.log(creators);

	if (!creators) return <Loader />;
	return (
		<section className="flex size-full flex-col gap-5 ">
			<CreatorCard creators={creators} />
			{/* <OtpVerification /> */}
		</section>
	);
};

export default HomePage;
