"use client";

import React, { useState, useEffect } from "react";
import { useWalletBalanceContext } from "@/lib/context/WalletBalanceContext";
import ContentLoading from "@/components/shared/ContentLoading";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import * as Sentry from "@sentry/nextjs";
import { Input } from "@/components/ui/input";
import { enterAmountSchema } from "@/lib/validator";
import { useCurrentUsersContext } from "@/lib/context/CurrentUsersContext";
import {
	creatorUser,
	PaymentFailedResponse,
	PaymentResponse,
	RazorpayOptions,
} from "@/types";
import { trackEvent } from "@/lib/mixpanel";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import { useGetUserTransactionsByType } from "@/lib/react-query/queries";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import Script from "next/script";
import InvoiceModal from "./invoiceModal";
import SinglePostLoader from "../shared/SinglePostLoader";

interface Transaction {
	_id: string;
	amount: number;
	createdAt: string;
	type: "credit" | "debit";
	category: string;
}

interface PaymentProps {
	callType?: string;
}

const Payment: React.FC<PaymentProps> = ({ callType }) => {
	const [btn, setBtn] = useState<"all" | "credit" | "debit">("all");
	const [creator, setCreator] = useState<creatorUser>();
	const { walletBalance, updateWalletBalance } = useWalletBalanceContext();
	const { currentUser } = useCurrentUsersContext();
	const router = useRouter();
	const { clientUser } = useCurrentUsersContext();
	const [loading, setLoading] = useState<boolean>(false);
	const { toast } = useToast();
	const [showInvoice, setShowInvoice] = useState(false);
	const [selectedTransaction, setSelectedTransaction] =
		useState<Transaction | null>(null); // Added

	const handleOpenInvoice = (transaction: Transaction) => {
		setSelectedTransaction(transaction); // Set the selected transaction
		setShowInvoice(true);
	};

	const handleCloseInvoice = () => {
		setSelectedTransaction(null); // Reset transaction data when closing
		setShowInvoice(false);
	};

	const { ref, inView } = useInView({
		threshold: 0.1,
		triggerOnce: false,
	});
	const {
		data: transactions,
		fetchNextPage,
		hasNextPage,
		isFetching,
		isError,
		isLoading,
	} = useGetUserTransactionsByType(currentUser?._id as string, btn);

	useEffect(() => {
		if (inView && hasNextPage && !isFetching) {
			fetchNextPage();
		}
	}, [inView, hasNextPage, isFetching]);

	useEffect(() => {
		const storedCreator = localStorage.getItem("currentCreator");
		if (storedCreator) {
			const parsedCreator: creatorUser = JSON.parse(storedCreator);
			if (parsedCreator) {
				setCreator(parsedCreator);
			}
		}
	}, []);

	useEffect(() => {
		trackEvent("Recharge_Page_Impression", {
			Client_ID: clientUser?._id,
			User_First_Seen: clientUser?.createdAt?.toString().split("T")[0],
			Creator_ID: creator?._id,
			Walletbalace_Available: clientUser?.walletBalance,
		});
	}, []);

	// Group transactions by date
	const groupTransactionsByDate = (transactionsList: Transaction[]) => {
		return transactionsList.reduce((acc, transaction) => {
			const date = new Date(transaction.createdAt).toLocaleDateString();
			if (!acc[date]) {
				acc[date] = [];
			}
			acc[date].push(transaction);
			return acc;
		}, {} as Record<string, Transaction[]>);
	};

	const groupedTransactions = transactions
		? groupTransactionsByDate(
				transactions.pages.flatMap((page) => page.transactions)
		  )
		: {};

	const getRateForCallType = () => {
		let rate: number | undefined;
		switch (callType) {
			case "video":
				rate = creator?.videoRate ? parseFloat(creator.videoRate) : undefined;
				break;
			case "audio":
				rate = creator?.audioRate ? parseFloat(creator.audioRate) : undefined;
				break;
			case "chat":
				rate = creator?.chatRate ? parseFloat(creator.chatRate) : undefined;
				break;
			default:
				rate = 0;
				break;
		}
		return rate;
	};

	const amountToBeDisplayed = () => {
		const ratePerMinute = getRateForCallType();
		const costForFiveMinutes = ratePerMinute ? ratePerMinute * 5 : undefined;
		const amountDue = costForFiveMinutes
			? Math.max(0, costForFiveMinutes - walletBalance)
			: undefined;
		return amountDue;
	};
	const generateAmounts = () => {
		const rate = getRateForCallType();
		return rate
			? [5, 10, 15, 30, 40, 60].map((multiplier) =>
					(rate * multiplier).toFixed(2)
			  )
			: ["99", "199", "499", "999", "1999", "2999"];
	};

	const tileClicked = (index: any) => {
		trackEvent("Recharge_Page_TileClicked", {
			Client_ID: clientUser?._id,
			User_First_Seen: clientUser?.createdAt?.toString().split("T")[0],
			Creator_ID: creator?._id,
			Tile_Number: index,
			Walletbalace_Available: clientUser?.walletBalance,
		});
	};

	// 1. Define your form.
	const form = useForm<z.infer<typeof enterAmountSchema>>({
		resolver: zodResolver(enterAmountSchema),
		defaultValues: {
			rechargeAmount: "",
		},
	});

	// 2. Watch the form values.
	const rechargeAmount = form.watch("rechargeAmount");

	// 3. Define a submit handler.
	async function onSubmit(
		event: React.FormEvent<HTMLFormElement>,
		values: z.infer<typeof enterAmountSchema>
	) {
		event.preventDefault();
		const rechargeAmount = Number(values.rechargeAmount) * 100;

		trackEvent("Recharge_Page_RechargeClicked", {
			Client_ID: clientUser?._id,
			User_First_Seen: clientUser?.createdAt?.toString().split("T")[0],
			Creator_ID: creator?._id,
			Recharge_value: rechargeAmount / 100,
			Walletbalace_Available: clientUser?.walletBalance,
		});

		trackEvent("Recharge_Page_Proceed_Clicked", {
			Client_ID: clientUser?._id,
			User_First_Seen: clientUser?.createdAt?.toString().split("T")[0],
			Creator_ID: creator?._id,
			Recharge_value: rechargeAmount / 100,
			Walletbalace_Available: clientUser?.walletBalance,
		});

		if (typeof window.Razorpay === "undefined") {
			console.error("Razorpay SDK is not loaded");
			setLoading(false); // Set loading state to false on error
			return;
		}

		const currency: string = "INR";

		try {
			const response: Response = await fetch("/api/v1/order", {
				method: "POST",
				body: JSON.stringify({ amount: rechargeAmount, currency }),
				headers: { "Content-Type": "application/json" },
			});

			const order = await response.json();

			const options: RazorpayOptions = {
				key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
				rechargeAmount,
				currency,
				name: "FlashCall.me",
				description: "Test Transaction",
				image:
					"https://firebasestorage.googleapis.com/v0/b/flashcall-1d5e2.appspot.com/o/assets%2Flogo_icon_dark.png?alt=media&token=8a795d10-f22b-40c6-8724-1e7f01130bdc",
				order_id: order.id,
				handler: async (response: PaymentResponse): Promise<void> => {
					const body: PaymentResponse = { ...response };

					try {
						setLoading(true); // Set loading state to true

						const paymentId = body.razorpay_order_id;

						const response = await fetch("/api/v1/payment", {
							method: "POST",
							body: paymentId,
							headers: { "Content-Type": "text/plain" },
						});

						const result = await response.json();
						const capturedPayment = result.payments.find(
							(payment: { captured: boolean }) => payment.captured === true
						);

						if (capturedPayment) {
							console.log("Captured payment found:", capturedPayment);
							const validateRes: Response = await fetch(
								"/api/v1/order/validate",
								{
									method: "POST",
									body: JSON.stringify(body),
									headers: { "Content-Type": "application/json" },
								}
							);

							const jsonRes: any = await validateRes.json();

							// Add money to user wallet upon successful validation
							const userId = currentUser?._id as string; // Replace with actual user ID
							const userType = "Client"; // Replace with actual user type

							console.log(result);

							await fetch("/api/v1/wallet/addMoney", {
								method: "POST",
								body: JSON.stringify({
									userId,
									userType,
									amount: rechargeAmount / 100,
									method: capturedPayment.method,
								}),
								headers: { "Content-Type": "application/json" },
							});

							trackEvent("Recharge_Successfull", {
								Client_ID: clientUser?._id,
								User_First_Seen: clientUser?.createdAt
									?.toString()
									.split("T")[0],
								Creator_ID: creator?._id,
								Recharge_value: rechargeAmount / 100,
								Walletbalace_Available: clientUser?.walletBalance,
							});

							router.push("/success");
						} else {
							throw new Error("Captured payment not found");
						}
					} catch (error) {
						Sentry.captureException(error);
						console.error("Validation request failed:", error);
						setLoading(false);
					} finally {
						updateWalletBalance();
					}
				},
				prefill: {
					name: currentUser?.firstName + " " + currentUser?.lastName,
					email: "",
					contact: currentUser?.phone as string,
					method: "",
				},
				notes: {
					address: "Razorpay Corporate Office",
				},
				theme: {
					color: "#50A65C",
				},
			};

			const rzp1 = new window.Razorpay(options);
			rzp1.on("payment.failed", (response: PaymentFailedResponse): void => {
				alert(response.error.code);
				alert(response.error.metadata.payment_id);
				setLoading(false); // Set loading state to false on error
			});

			rzp1.open();
		} catch (error) {
			Sentry.captureException(error);

			trackEvent("Recharge_Failed", {
				Client_ID: clientUser?._id,
				User_First_Seen: clientUser?.createdAt?.toString().split("T")[0],
				Creator_ID: creator?._id,
				Recharge_value: rechargeAmount,
				Walletbalace_Available: clientUser?.walletBalance,
			});
			console.error("Payment request failed:", error);
			setLoading(false); // Set loading state to false on error
			router.push("/payment");
			toast({
				variant: "destructive",
				title: "Payment Failed",
				description: "Redirecting ...",
			});
		}
	}

	useEffect(() => {
		const amountPattern = /^\d*$/;
		if (!amountPattern.test(rechargeAmount)) {
			form.setError("rechargeAmount", {
				type: "manual",
				message: "Amount must be a numeric value",
			});
		} else {
			form.clearErrors("rechargeAmount");
		}
	}, [rechargeAmount, form]);

	const downloadInvoice = async (transactionId: string) => {
		console.log(transactionId);
	};

	const creatorURL = localStorage.getItem("creatorURL");

	if (loading) {
		return (
			<div className="size-full flex flex-col gap-2 items-center justify-center">
				<SinglePostLoader />
			</div>
		);
	}

	return (
		<div className="flex flex-col pt-4 bg-white text-gray-800 w-full h-full">
			<Script src="https://checkout.razorpay.com/v1/checkout.js" />
			{/* Balance Section */}
			<div className="flex items-center pb-5 px-4 gap-4">
				<Link
					href={`${creatorURL ? creatorURL : "/home"}`}
					className="text-xl font-bold"
				>
					&larr;
				</Link>
				<section className="w-full flex flex-col">
					{currentUser ? (
						<>
							<span className="w-fit text-2xl leading-7 font-bold">
								Rs. {walletBalance.toFixed(2)}
							</span>
							<h2 className="w-fit text-gray-500 font-normal leading-5">
								Total Balance
							</h2>
						</>
					) : (
						<>
							<span className="w-fit text-2xl leading-7 font-bold">
								Hey There
							</span>
							<h2 className="w-fit text-gray-500 font-normal leading-5">
								Authenticate To Continue
							</h2>
						</>
					)}
				</section>
			</div>

			{/* Recharge Section */}
			<section className="flex flex-col gap-5 items-center justify-center md:items-start pb-7 px-4 ">
				<div className="w-[100%] flex justify-center items-center font-normal leading-5 border-[1px] rounded-lg p-3">
					<Form {...form}>
						<form
							onSubmit={(event) =>
								form.handleSubmit((values) => onSubmit(event, values))(event)
							}
							className="w-full flex items-center text-base"
						>
							<FormField
								control={form.control}
								name="rechargeAmount"
								render={({ field }) => (
									<FormItem className="flex-grow mr-2">
										<FormControl>
											<Input
												placeholder="Enter amount in INR"
												{...field}
												className="w-full outline-none border-none focus-visible:ring-offset-0 focus-visible:!ring-transparent placeholder:text-grey-500"
												pattern="\d*"
												title="Amount must be a numeric value"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button
								disabled={!currentUser}
								type="submit"
								className="w-fit px-4 py-3 bg-gray-800 text-white font-bold leading-4 text-sm rounded-[6px] hover:bg-black/60"
							>
								Recharge
							</Button>
						</form>
					</Form>
				</div>
				<div>
					{/* Display the amount due message if there's an amount due */}
					{amountToBeDisplayed() !== undefined && (
						<p className="text-red-500">
							₹{amountToBeDisplayed()?.toFixed(2)} more required for 5 minutes
							of {callType}
						</p>
					)}
				</div>
				<div className="grid grid-cols-3 md:grid-cols-6 gap-6 md:gap-8 text-sm font-semibold leading-4 w-full px-5">
					{generateAmounts().map((amount, index) => (
						<button
							key={amount}
							className="px-4 py-3 border-2 border-black rounded shadow hover:bg-gray-200 dark:hover:bg-gray-800"
							style={{ boxShadow: "3px 3px black" }}
							onClick={() => {
								form.setValue("rechargeAmount", amount);
								tileClicked(index);
							}}
						>
							₹{amount}
						</button>
					))}
				</div>
			</section>

			{/* Transaction History Section */}
			<section
				className={`sticky top-0 md:top-[76px] bg-white z-30 w-full p-4`}
			>
				{showInvoice && selectedTransaction && (
					<InvoiceModal
						isOpen={showInvoice}
						onClose={handleCloseInvoice}
						transaction={selectedTransaction} // Pass selected transaction
					/>
				)}
				<div className="flex flex-col items-start justify-start gap-2.5 w-full h-fit">
					<h2 className="text-gray-500 text-xl font-normal">
						Transaction History
					</h2>
					<div className="flex space-x-2 text-xs font-bold leading-4 w-fit">
						{["all", "credit", "debit"].map((filter) => (
							<button
								key={filter}
								onClick={() => setBtn(filter as "all" | "credit" | "debit")}
								className={`capitalize px-5 py-1 border-2 border-black rounded-full ${
									filter === btn
										? "bg-gray-800 text-white"
										: "bg-white text-black dark:bg-gray-700 dark:text-white hoverScaleDownEffect"
								}`}
							>
								{filter}
							</button>
						))}
					</div>
				</div>
			</section>

			{/* Transaction History List */}
			<ul className="space-y-4 w-full h-full px-4 pt-2 pb-7">
				{!isLoading ? (
					isError || !currentUser ? (
						<div className="size-full flex flex-col items-center justify-center text-2xl xl:text-2xl font-semibold text-center text-red-500">
							Failed to fetch Transactions
							<span className="text-lg">Please try again later.</span>
						</div>
					) : Object.keys(groupedTransactions).length === 0 ? (
						<p className="size-full flex items-center justify-center text-xl font-semibold text-center text-gray-500">
							{`No transactions Found`}
						</p>
					) : (
						Object.entries(groupedTransactions).map(([date, transactions]) => (
							<div
								key={date}
								className="p-4 bg-white rounded-lg shadow w-full animate-enterFromBottom"
							>
								<h3 className="text-base items-start font-normal  text-gray-400">
									{date}
								</h3>
								{transactions.map((transaction) => (
									<li
										key={transaction?._id}
										className="animate-enterFromBottom  flex gap-2 justify-between items-center py-4  bg-white dark:bg-gray-800 border-b-2"
									>
										<div className="flex flex-wrap flex-col items-start justify-center gap-2">
											<p className="font-normal text-xs leading-4">
												Transaction ID{" "}
												<span className="text-sm font-semibold">
													{transaction._id}
												</span>
											</p>
											<p className=" text-gray-400 font-normal text-xs leading-4">
												{new Date(transaction.createdAt).toLocaleTimeString()}
											</p>
										</div>
										<div className="flex flex-col items-end justify-start gap-2">
											{transaction?.category && (
												<p className="font-normal text-xs text-green-1 whitespace-nowrap">
													{transaction?.category}
												</p>
											)}

											<p
												className={`font-bold text-xs xm:text-sm leading-4 w-fit whitespace-nowrap ${
													transaction?.type === "credit"
														? "text-green-500"
														: "text-red-500"
												} `}
											>
												{transaction?.type === "credit"
													? `+ ₹${transaction?.amount?.toFixed(2)}`
													: `- ₹${transaction?.amount?.toFixed(2)}`}
											</p>
											{/* Download Invoice Button */}
											{transaction?.type === "credit" && (
												<button
													onClick={() => handleOpenInvoice(transaction)}
													className="text-sm"
													title="Download Invoice"
												>
													<span className="">View Invoice</span>
												</button>
											)}
										</div>
									</li>
								))}
							</div>
						))
					)
				) : (
					<div className="size-full flex flex-col gap-2 items-center justify-center">
						<ContentLoading />
					</div>
				)}
			</ul>

			{hasNextPage && isFetching && (
				<Image
					src="/icons/loading-circle.svg"
					alt="Loading..."
					width={50}
					height={50}
					className="mx-auto invert my-5 mt-10 z-20"
				/>
			)}

			{!isError &&
				!hasNextPage &&
				!isFetching &&
				currentUser &&
				transactions?.pages[0]?.totalTransactions !== 0 && (
					<div className="text-center text-gray-500 py-4">
						You have reached the end of the list.
					</div>
				)}

			{hasNextPage && <div ref={ref} className=" pt-10 w-full" />}
		</div>
	);
};

export default Payment;
