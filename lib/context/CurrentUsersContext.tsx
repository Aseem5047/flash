import {
	ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";
import { getCreatorById } from "../actions/creator.actions";
import { getUserById } from "../actions/client.actions";
import { clientUser, creatorUser } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import jwt from "jsonwebtoken";

// Define the shape of the context value
interface CurrentUsersContextValue {
	clientUser: clientUser | null;
	creatorUser: creatorUser | null;
	currentUser: clientUser | creatorUser | null;
	setClientUser: (user: clientUser | null) => void;
	setCreatorUser: (user: creatorUser | null) => void;
	userType: string | null;
	refreshCurrentUser: () => Promise<void>;
}

// Create the context with a default value of null
const CurrentUsersContext = createContext<CurrentUsersContextValue | null>(
	null
);

// Custom hook to use the CurrentUsersContext
export const useCurrentUsersContext = () => {
	const context = useContext(CurrentUsersContext);
	if (!context) {
		throw new Error(
			"useCurrentUsersContext must be used within a CurrentUsersProvider"
		);
	}
	return context;
};

export const isCreatorUser = (
	user: clientUser | creatorUser
): user is creatorUser => {
	return (user as creatorUser).profession !== undefined;
};

// Provider component to hold the state and provide it to its children
export const CurrentUsersProvider = ({ children }: { children: ReactNode }) => {
	const storedUserType = localStorage.getItem("userType");
	const userType = storedUserType ? storedUserType : null;
	const authToken = localStorage.getItem("authToken");
	const userId = localStorage.getItem("currentUserID");
	const [clientUser, setClientUser] = useState<clientUser | null>(null);
	const [creatorUser, setCreatorUser] = useState<creatorUser | null>(null);
	const { toast } = useToast();

	const handleSignout = () => {
		localStorage.removeItem("userType");
		localStorage.removeItem("userID");
		localStorage.removeItem("authToken");
		setClientUser(null);
		setCreatorUser(null);
		// router.push("/authenticate");
	};

	const isTokenValid = (token: string): boolean => {
		try {
			const decodedToken: any = jwt.decode(token);

			if (!decodedToken || typeof decodedToken !== "object") {
				return false;
			}

			const currentTime = Math.floor(Date.now() / 1000);

			return decodedToken.exp > currentTime;
		} catch (error) {
			console.error("Error decoding token:", error);
			return false;
		}
	};

	const fetchCurrentUser = async () => {
		try {
			if (authToken && isTokenValid(authToken)) {
				const decodedToken: any = jwt.decode(authToken);
				const phoneNumber = decodedToken.phone;

				// Fetch user details using phone number
				const response = await axios.post("/api/v1/user/getUserByPhone", {
					phone: phoneNumber,
				});
				const user = response.data;

				if (user) {
					if (userType === "creator") {
						setCreatorUser(user);
						setClientUser(null);
						localStorage.setItem(
							"userType",
							(user.userType as string) ?? "client"
						);
					} else {
						setClientUser(user);
						setCreatorUser(null);
						localStorage.setItem(
							"userType",
							(user.userType as string) ?? "client"
						);
					}
				} else {
					console.error("User not found with phone number:", phoneNumber);
				}
			} else if (userId) {
				const isCreator = userType === "creator";

				if (isCreator) {
					const response = await getCreatorById(userId);
					setCreatorUser(response);
					setClientUser(null);
				} else {
					const response = await getUserById(userId);
					setClientUser(response);
					setCreatorUser(null);
				}
			} else {
				toast({
					variant: "destructive",
					title: "User Not Found",
					description: "Try Authenticating Again ...",
				});
				handleSignout();
			}
		} catch (error) {
			console.error("Error fetching current user:", error);
			toast({
				variant: "destructive",
				title: "User Not Found",
				description: "Try Authenticating Again ...",
			});
			handleSignout();
		}
	};

	useEffect(() => {
		if (authToken && !isTokenValid(authToken)) {
			handleSignout();
		} else {
			fetchCurrentUser();
		}
	}, []);

	const refreshCurrentUser = async () => {
		await fetchCurrentUser();
	};

	// Define the unified currentUser state
	const currentUser = creatorUser || clientUser;

	const values: CurrentUsersContextValue = {
		clientUser,
		creatorUser,
		currentUser,
		setClientUser,
		setCreatorUser,
		userType,
		refreshCurrentUser,
	};

	return (
		<CurrentUsersContext.Provider value={values}>
			{children}
		</CurrentUsersContext.Provider>
	);
};
