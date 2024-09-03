"use client";

import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/Navbar";
import Sidebar from "@/components/shared/Sidebar";
import { usePathname } from "next/navigation";
import React, { ReactNode } from "react";

const HomeLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
	const pathname = usePathname();
	const creatorPagePath = localStorage.getItem("creatorURL");
	const hiddenFooterPaths = ["/previous", `${creatorPagePath}`, "/favorites"];
	const shouldHideFooter = hiddenFooterPaths.includes(pathname);
	console.log(creatorPagePath, hiddenFooterPaths, pathname);

	return (
		<main className="relative">
			<Navbar />
			<div className="flex">
				<Sidebar />
				<section className="flex flex-1 flex-col gap-5">
					<div className="min-h-screen w-full h-full relative pt-24 md:px-10">
						{children}
					</div>

					{!shouldHideFooter && <Footer />}
				</section>
			</div>
		</main>
	);
};

export default HomeLayout;
