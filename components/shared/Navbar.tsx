"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import MobileNav from "./MobileNav";

import { useWalletBalanceContext } from "@/lib/context/WalletBalanceContext";
import { useRouter } from "next/navigation";
import { useCurrentUsersContext } from "@/lib/context/CurrentUsersContext";

const Navbar = () => {
	const [isMounted, setIsMounted] = useState(false);
	const { currentUser } = useCurrentUsersContext();
	const router = useRouter();

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const handleRouting = () => {
		localStorage.setItem("userType", "client");

		router.replace("/authenticate");
	};
	const theme = `5px 5px 0px 0px #000000`;
	const { walletBalance } = useWalletBalanceContext();

	return (
		<nav className="flex-between items-center fixed top-0 left-0 z-40 w-full px-2 sm:px-6 py-4 lg:px-7 bg-white shadow-sm">
			<Link href="/" className="flex items-center gap-4 ">
				<Image
					src="/icons/logoDesktop.png"
					width={100}
					height={100}
					alt="flashcall logo"
					className="w-full h-full rounded-xl hoverScaleEffect"
				/>
			</Link>

			{isMounted && (
				<>
					{currentUser?._id ? (
						<div className=" w-fit h-full flex-between gap-2 text-white">
							<Link
								href="/payment"
								className="w-full flex items-center justify-center gap-2 text-black px-5 py-3 border border-black rounded-lg  hover:bg-green-1 group"
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
									{walletBalance >= 0
										? `Rs. ${walletBalance.toFixed(2)}`
										: "Updating..."}
								</span>
							</Link>
							<MobileNav />
						</div>
					) : (
						<Button
							className="animate-enterFromRight lg:animate-enterFromBottom bg-green-1 transition-all duration-300 hover:bg-green-700 text-white font-semibold w-fit mr-1 rounded-md"
							size="lg"
							onClick={handleRouting}
						>
							Login
						</Button>
					)}
				</>
			)}
		</nav>
	);
};

export default Navbar;
