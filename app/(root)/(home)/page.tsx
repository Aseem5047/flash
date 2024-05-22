"use client";

import OtpVerification from "@/components/forms/OtpVerification";
import CreatorCard from "@/components/shared/CreatorCard";
import Loader from "@/components/shared/Loader";
import { getUsers } from "@/lib/actions/creator.actions";
import { CreateCreatorParams } from "@/types";
import React, { useEffect, useState } from "react";

const page = () => {
	const [creators, setCreators] = useState<CreateCreatorParams[]>([]);
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
			{/* <OtpVerification /> */}
			<CreatorCard creators={creators} />
		</section>
	);
};

export default page;
