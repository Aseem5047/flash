"use client";

import ContentLoading from "@/components/shared/ContentLoading";
import { useToast } from "@/components/ui/use-toast";
import { useCurrentUsersContext } from "@/lib/context/CurrentUsersContext";
import { useGetUserTransactionsByType } from "@/lib/react-query/queries";
import { formatDateTime } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
interface Transaction {
	_id: string;
	amount: number;
	createdAt: string;
	type: "credit" | "debit";
	category: string;
	callType?: string;
}

const Transactions = () => {
	const [btn, setBtn] = useState<"all" | "credit" | "debit">("all");
	const { currentUser } = useCurrentUsersContext();
	const { toast } = useToast();
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

	const copyToClipboard = (text: string) => {
		navigator.clipboard
			.writeText(text)
			.then(() => {
				toast({
					variant: "destructive",
					title: "Transaction ID Copied",
				});
			})
			.catch((err) => {
				console.error("Failed to copy ID: ", err);
			});
	};
	const creatorURL = localStorage.getItem("creatorURL");

	return (
		<>
			{/* Transaction History Section */}
			<section
				className={`sticky top-0 md:top-[76px] bg-white z-30 p-4 flex flex-col items-start justify-start gap-4 w-full h-fit`}
			>
				<section className="flex items-center gap-4">
					<Link
						href={`${creatorURL ? creatorURL : "/home"}`}
						className="text-xl font-bold hoverScaleDownEffect"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="size-6"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M15.75 19.5 8.25 12l7.5-7.5"
							/>
						</svg>
					</Link>
					<h1 className="text-xl md:text-3xl font-bold">Transaction History</h1>
				</section>
			</section>
			<section className="flex space-x-2 text-xs font-bold leading-4 w-fit px-4 pb-4">
				{["all", "credit", "debit"].map((filter) => (
					<button
						key={filter}
						onClick={() => setBtn(filter as "all" | "credit" | "debit")}
						className={`capitalize text-sm font-medium px-[20px] py-[7px] rounded-3xl border border-gray-300 hoverScaleDownEffect hover:text-white hover:bg-green-1 ${
							filter === btn && "bg-green-1 text-white"
						}`}
					>
						{filter}
					</button>
				))}
			</section>

			{/* Transaction History List */}
			<ul className="space-y-4 w-full px-4 pt-2 pb-7">
				{!isLoading || !currentUser ? (
					isError ? (
						<div className="size-full h-[60vh] flex flex-col items-center justify-center text-2xl xl:text-2xl font-semibold text-center text-red-500">
							Failed to fetch Transactions
							<span className="text-lg">Please try again later.</span>
						</div>
					) : Object.keys(groupedTransactions).length === 0 ? (
						<section className="size-full h-[60vh] flex flex-col gap-4 items-center justify-center text-xl font-semibold text-center text-gray-500">
							<Image
								src={"/images/noTransaction.png"}
								alt="no transaction"
								width={1000}
								height={1000}
								className="size-[200px] object-contain"
							/>
							<span>No transaction yet</span>
						</section>
					) : (
						Object.entries(groupedTransactions).map(([date, transactions]) => {
							const groupedDate = formatDateTime(new Date(date));
							return (
								<div
									key={date}
									className="p-5 bg-white rounded-lg shadow border border-gray-100 w-full animate-enterFromBottom"
								>
									<h3 className="text-base items-start font-normal  text-gray-400 mb-2">
										{groupedDate.dateOnly}
									</h3>
									{transactions.map((transaction) => (
										<li
											key={transaction?._id}
											className="animate-enterFromBottom  flex gap-2 justify-between items-center py-4  bg-white dark:bg-gray-800 border-t-2 border-gray-100"
										>
											<div className="flex flex-wrap flex-col items-start justify-center gap-2">
												<div className="flex items-center gap-2">
													<p className="flex items-center justify-start gap-2 font-normal text-sm leading-4">
														ID{" "}
														<span className="text-sm sm:block">
															<span className="block xm:hidden">{`${transaction._id.slice(
																0,
																11
															)}...`}</span>
															<span className="hidden xm:block">
																{transaction._id}
															</span>
														</span>
													</p>

													<svg
														xmlns="http://www.w3.org/2000/svg"
														fill="none"
														viewBox="0 0 24 24"
														strokeWidth={1.5}
														stroke="currentColor"
														className="cursor-pointer mb-[1px] size-3 sm:size-4 text-gray-400 hoverScaleDownEffect hover:text-green-1"
														onClick={() => copyToClipboard(transaction._id)}
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
														/>
													</svg>
												</div>
												<section className="flex items-center justify-start gap-2">
													{transaction?.category && (
														<section className="font-normal text-xs sm:text-sm whitespace-nowrap">
															{transaction?.callType ? (
																transaction?.callType === "video" ? (
																	<svg
																		xmlns="http://www.w3.org/2000/svg"
																		fill="none"
																		viewBox="0 0 24 24"
																		strokeWidth={1.5}
																		stroke="currentColor"
																		className="size-3 sm:size-4"
																	>
																		<path
																			strokeLinecap="round"
																			strokeLinejoin="round"
																			d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
																		/>
																	</svg>
																) : transaction?.callType === "audio" ? (
																	<svg
																		xmlns="http://www.w3.org/2000/svg"
																		fill="none"
																		viewBox="0 0 24 24"
																		strokeWidth={1.5}
																		stroke="currentColor"
																		className="size-3 sm:size-4"
																	>
																		<path
																			strokeLinecap="round"
																			strokeLinejoin="round"
																			d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
																		/>
																	</svg>
																) : (
																	<svg
																		xmlns="http://www.w3.org/2000/svg"
																		fill="none"
																		viewBox="0 0 24 24"
																		strokeWidth={1.5}
																		stroke="currentColor"
																		className="size-3 sm:size-4"
																	>
																		<path
																			strokeLinecap="round"
																			strokeLinejoin="round"
																			d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
																		/>
																	</svg>
																)
															) : (
																<p className="text-green-1">
																	{transaction?.category}
																</p>
															)}
														</section>
													)}

													{/* Separator */}
													<span className="text-gray-400 text-xs sm:text-sm">
														•
													</span>

													<p className=" text-gray-400 font-normal text-xs sm:text-sm leading-4">
														{
															formatDateTime(new Date(transaction.createdAt))
																.dateTime
														}
													</p>
												</section>
											</div>
											<section className="flex flex-col justify-between items-center">
												<span
													className={`size-full flex items-center font-bold text-sm leading-4 w-fit whitespace-nowrap ${
														transaction?.type === "credit"
															? "text-green-500"
															: "text-red-500"
													} `}
												>
													{transaction?.type === "credit"
														? `+ ₹${transaction?.amount?.toFixed(2)}`
														: `- ₹${transaction?.amount?.toFixed(2)}`}
												</span>

												<span className="size-full opacity-0">.</span>
											</section>
										</li>
									))}
								</div>
							);
						})
					)
				) : (
					<div className="size-full h-[60vh] flex flex-col gap-2 items-center justify-center">
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
		</>
	);
};

export default Transactions;
