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
				{isOpen && (
					<AuthenticateViaOTP userType={"client"} onOpenChange={onOpenChange} />
				)}
			</div>
		</section>
	);
};

export default AuthenticationSheet;
