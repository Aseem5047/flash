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
	const { currentUser } = useCurrentUsersContext();

	const fetchCurrentUserWalletBalance = async () => {
		try {
			currentUser && setWalletBalance(currentUser.walletBalance || 0);
		} catch (error) {
			console.error("Error fetching current user:", error);
		}
	};

	useEffect(() => {
		if (currentUser) {
			fetchCurrentUserWalletBalance();
		}
	}, [currentUser?._id]);

	const updateWalletBalance = async () => {
		if (currentUser) {
			await fetchCurrentUserWalletBalance();
		}
	};

	return (
		<WalletBalanceContext.Provider
			value={{ walletBalance, setWalletBalance, updateWalletBalance }}
		>
			{children}
		</WalletBalanceContext.Provider>
	);
};
