import React from "react";
import { Sheet, SheetContent } from "../ui/sheet";
import SignUpAndOTP from "../forms/AuthenticateViaOTP";

const AuthenticationSheet = ({
	isOpen,
	onOpenChange,
}: {
	isOpen: boolean;
	onOpenChange: (isOpen: boolean) => void;
}) => {
	return (
		<Sheet
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) {
					onOpenChange(false);
				}
			}}
		>
			<SheetContent
				side="bottom"
				className="flex flex-col items-center justify-center border-none rounded-t-xl px-10 py-7 bg-white min-h-[350px] max-h-fit w-full sm:max-w-[444px] mx-auto"
			>
				<SignUpAndOTP />
			</SheetContent>
		</Sheet>
	);
};

export default AuthenticationSheet;
