"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import MobileNav from "./MobileNav";

import { useWalletBalanceContext } from "@/lib/context/WalletBalanceContext";
import { useRouter } from "next/navigation";
import { useCurrentUsersContext } from "@/lib/context/CurrentUsersContext";
import { creatorUser } from "@/types";

const Navbar = () => {
	const { currentUser, userType } = useCurrentUsersContext();
	const router = useRouter();
	const [userTheme, setUserTheme] = useState("#000000");

	const handleRouting = () => {
		localStorage.setItem("userType", "client");

		router.push("/authenticate");
	};
	const theme = `5px 5px 0px 0px #000000`;
	const { walletBalance } = useWalletBalanceContext();

	useEffect(() => {
		const storedCreator = localStorage.getItem("currentCreator");
		let selectedTheme;
		if (storedCreator) {
			const parsedCreator: creatorUser = JSON.parse(storedCreator);
			selectedTheme = parsedCreator.themeSelected;
		}
		let newTheme = selectedTheme
			? selectedTheme === "#50A65C"
				? "#000000"
				: selectedTheme
			: "#000000";
		setUserTheme(newTheme);
	}, [router]);

	const handleAppRedirect = () => {
		const isAndroid = /Android/i.test(navigator.userAgent);
		const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
		let url = "";

		if (isAndroid) {
			url = "https://play.google.com/store/apps?hl=en_US";
		} else if (isIOS) {
			url = "https://flashcall.me";
		} else {
			// For other devices (like laptops, Windows machines), redirect to a fallback URL
			url = "https://flashcall.me";
		}

		window.open(url, "_blank");
	};

	const AppLink = () => (
		<Button
			className="flex items-center gap-2 bg-green-1 py-2 px-4 ml-2 text-white rounded-[4px] hoverScaleDownEffect"
			style={{
				boxShadow: `5px 5px 0px 0px ${userTheme}`,
			}}
			onClick={handleAppRedirect}
		>
			<Image
				src="/icons/logoDarkCircle.png"
				width={100}
				height={100}
				alt="flashcall logo"
				className="w-6 h-6 rounded-full"
			/>

			<span className="w-full whitespace-nowrap text-sm font-semibold">
				Get Your Link
			</span>
		</Button>
	);

	return (
		<nav className="flex-between items-center fixed top-0 left-0 z-40 w-full px-2 sm:px-4 py-4 bg-white shadow-sm">
			{currentUser ? (
				userType === "creator" ? (
					<Link href="/" className="flex items-center justify-center ml-2">
						<Image
							src="/icons/logoDesktop.png"
							width={100}
							height={100}
							alt="flashcall logo"
							className="w-full h-full rounded-xl hoverScaleEffect"
						/>
					</Link>
				) : (
					<AppLink />
				)
			) : (
				<AppLink />
			)}

			{currentUser ? (
				walletBalance >= 0 ? (
					<div className=" w-fit h-full flex-between gap-2 text-white animate-enterFromRight">
						<Link
							href="/payment"
							className="w-full flex items-center justify-center gap-2 text-black px-5 py-3 border border-black rounded-[4px] hover:bg-green-1 group"
							style={{
								boxShadow: theme,
							}}
						>
							<Image
								src="/wallet.svg"
								width={100}
								height={100}
								alt="wallet"
								className="w-4 h-4 group-hover:text-white group-hover:invert"
							/>
							<span className="w-full text-xs whitespace-nowrap font-semibold group-hover:text-white">
								{`Rs. ${walletBalance.toFixed(2)}`}
							</span>
						</Link>
						<MobileNav />
					</div>
				) : (
					<div className="w-full max-w-[10rem] space-y-3">
						<div className="grid grid-cols-3 gap-4">
							<div className="h-2 bg-gray-300 rounded col-span-2"></div>
							<div className="h-2 bg-gray-300 rounded col-span-1"></div>
						</div>
						<div className="h-2 bg-gray-300 rounded"></div>
					</div>
				)
			) : (
				<Button
					className="hover:!bg-green-1 hover:!text-white transition-all duration-300 hover:bg-green-700font-semibold w-fit mr-1 rounded-md"
					size="lg"
					onClick={handleRouting}
					style={{
						boxShadow: `5px 5px 0px 0px ${userTheme}`,
						color: userTheme,
						border: `2px solid ${userTheme}`,
					}}
				>
					Login
				</Button>
			)}
		</nav>
	);
};

export default Navbar;
