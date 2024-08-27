// WalletBalanceContext.tsx
import React, {
	createContext,
	useContext,
	useState,
	ReactNode,
	useEffect,
} from "react";
import { getUserById } from "../actions/client.actions";
import { getCreatorById } from "../actions/creator.actions";
import { useCurrentUsersContext } from "./CurrentUsersContext";
import { usePathname } from "next/navigation";

interface WalletBalanceContextProps {
	walletBalance: number;
	setWalletBalance: React.Dispatch<React.SetStateAction<number>>;
	updateWalletBalance: () => Promise<void>;
}

const WalletBalanceContext = createContext<WalletBalanceContextProps | null>(
	null
);

export const useWalletBalanceContext = () => {
	const context = useContext(WalletBalanceContext);
	if (!context) {
		throw new Error(
			"useWalletBalanceContext must be used within a WalletBalanceProvider"
		);
	}
	return context;
};

export const WalletBalanceProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const [walletBalance, setWalletBalance] = useState<number>(-1);
	const { currentUser, userType, authenticationSheetOpen } =
		useCurrentUsersContext();
	const isCreator = userType === "creator";

	const fetchAndSetWalletBalance = async () => {
		if (currentUser) {
			try {
				const response = isCreator
					? await getCreatorById(currentUser._id)
					: await getUserById(currentUser._id);
				setWalletBalance(response.walletBalance ?? 0);
			} catch (error) {
				console.error("Error fetching current user:", error);
				setWalletBalance(0);
			}
		}
	};

	useEffect(() => {
		fetchAndSetWalletBalance();
	}, [userType, authenticationSheetOpen]);

	const updateWalletBalance = async () => {
		await fetchAndSetWalletBalance();
	};

	return (
		<WalletBalanceContext.Provider
			value={{ walletBalance, setWalletBalance, updateWalletBalance }}
		>
			{children}
		</WalletBalanceContext.Provider>
	);
};
