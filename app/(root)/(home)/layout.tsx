import Navbar from "@/components/shared/Navbar";
import Sidebar from "@/components/shared/Sidebar";
import { Metadata } from "next";
import React, { ReactNode } from "react";

export const metadata: Metadata = {
	title: "FlashCall",
	description: "Application Connectin People",
	icons: {
		icon: "/icons/logoDarkCircle.png",
	},
};

const HomeLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
	return (
		<main className="relative">
			<Navbar />
			<div className="flex">
				<Sidebar />
				<section className="flex min-h-screen flex-1 flex-col pt-24 md:px-10">
					<div className="w-full h-full relative">{children}</div>
				</section>
			</div>
		</main>
	);
};

export default HomeLayout;
