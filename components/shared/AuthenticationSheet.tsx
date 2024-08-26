import React, { useEffect } from "react";
import AuthenticateViaOTP from "../forms/AuthenticateViaOTP";
import { Button } from "../ui/button";

const AuthenticationSheet = ({
	isOpen,
	onOpenChange,
}: {
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
}) => {
	useEffect(() => {
		const handleResize = () => {
			const height = window.innerHeight;
			document.documentElement.style.setProperty("--vh", `${height * 0.01}px`);
		};

		window.addEventListener("resize", handleResize);
		handleResize();

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);
	return (
		<section
			className="fixed w-screen z-50 inset-0 bg-black/50 top-0 flex flex-col items-center justify-end md:justify-center"
			style={{ height: "calc(var(--vh, 1vh) * 100)" }}
		>
			<div className="flex relative items-center justify-center">
				{
					<Button
						className="absolute top-2 right-2 z-10 animate-enterFromTop"
						onClick={() => onOpenChange(false)}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="size-7 text-green-1 hover:text-black"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
							/>
						</svg>
					</Button>
				}
				{isOpen && <AuthenticateViaOTP userType={"client"} />}
			</div>
		</section>
	);
};

export default AuthenticationSheet;
