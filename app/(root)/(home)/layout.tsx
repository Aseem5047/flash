"use client";

import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/Navbar";
import Sidebar from "@/components/shared/Sidebar";
import { usePathname } from "next/navigation";
import React, { ReactNode, useEffect, useState } from "react";

const HomeLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
	const pathname = usePathname();
	const creatorPagePath = localStorage.getItem("creatorURL");
	const hiddenFooterPaths = ["/previous", `${creatorPagePath}`, "/"];

	const [shouldHideFooter, setShouldHideFooter] = useState(false);

	useEffect(() => {
		setShouldHideFooter(hiddenFooterPaths.includes(pathname));
	}, [pathname]);

	return (
		<main className="relative">
			<Navbar />
			<div className="flex">
				<Sidebar />
				<section className="flex flex-1 flex-col gap-5">
					<div
						className={`${
							pathname === "/" ? "" : "md:px-10"
						} min-h-screen w-full h-full relative pt-24`}
					>
						{children}
					</div>

					<footer
						className={`footer-transition ${
							shouldHideFooter
								? "animate-enterFromBottom hidden"
								: "animate-enterFromBottom "
						}`}
					>
						<Footer />
					</footer>
				</section>
			</div>
		</main>
	);
};

export default HomeLayout;
