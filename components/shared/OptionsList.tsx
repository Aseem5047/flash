import React, { useEffect, useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ReportDialog from "../creator/ReportDialog";
import axios from "axios";
import { backendBaseUrl } from "@/lib/utils";
import { clientUser, creatorUser } from "@/types";
import { useCurrentUsersContext } from "@/lib/context/CurrentUsersContext";

const OptionsList = ({
	callId,
	creatorId,
	clientId,
	currentCreator,
}: {
	callId: string;
	currentCreator: clientUser | creatorUser | null;
	creatorId: string;
	clientId: string;
}) => {
	const { refreshCurrentUser } = useCurrentUsersContext();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
	const [isBlocked, setIsBlocked] = useState(
		currentCreator
			? currentCreator?.blocked?.some((client) => client === clientId)
			: false
	);
	const [reportSubmitted, setReportSubmitted] = useState(false);

	const handleDropdownOpenChange = (open: boolean) => {
		setIsDropdownOpen(open);
	};

	const handleReportClick = () => {
		setIsDropdownOpen(false);
		setIsReportDialogOpen(true);
	};

	useEffect(() => {
		const fetchReportStatus = async () => {
			try {
				const response = await axios.get(
					`${backendBaseUrl}/reports/call/${callId}`
				);
				const reports = response.data;
				if (reports.length > 0) {
					const isReportSubmitted = reports.some(
						(report: any) => report.submittedBy.userId === creatorId
					);
					setReportSubmitted(isReportSubmitted);
				}
			} catch (error) {
				console.error("Error fetching report status:", error);
			}
		};

		fetchReportStatus();
	}, [callId, isReportDialogOpen]);

	// Block or unblock a client
	const handleBlockClient = async () => {
		try {
			const action = isBlocked ? "unblock" : "block";
			const response = await axios.put(
				`${backendBaseUrl}/creator/blockUser/${creatorId}`,
				{
					blockClientId: clientId,
					action: action,
				}
			);

			if (response.data.success) {
				setIsBlocked(!isBlocked);
				refreshCurrentUser();
			}
		} catch (error) {
			console.error("Error updating blocked status:", error);
		}
	};

	return (
		<section>
			{/* DropdownMenu with controlled open/close state */}
			<DropdownMenu
				open={isDropdownOpen}
				onOpenChange={handleDropdownOpenChange}
			>
				<DropdownMenuTrigger className="!outline-0 focus:outline-none">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
						className="size-6 text-[#A7A8A1] focus:outline-none !outline-0"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
						/>
					</svg>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuLabel className="!sr-only">
						Options List
					</DropdownMenuLabel>
					<DropdownMenuItem>
						<button
							onClick={handleBlockClient}
							className="w-full flex items-center justify-start gap-2 "
						>
							{isBlocked ? (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={1.5}
									stroke="currentColor"
									className="size-4"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
									/>
								</svg>
							) : (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={1.5}
									stroke="currentColor"
									className="size-4"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
									/>
								</svg>
							)}

							<span>{isBlocked ? "Unblock" : "Block"}</span>
						</button>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={handleReportClick}
						disabled={reportSubmitted}
						className={`${reportSubmitted && "cursor-not-allowed"}`}
					>
						<section className="w-full flex items-center justify-start gap-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={1.5}
								stroke="currentColor"
								className="size-4"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
								/>
							</svg>
							{reportSubmitted ? "Reported" : "Report"}
						</section>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* ReportDialog with independent state */}
			<ReportDialog
				callId={callId}
				clientId={clientId}
				creatorId={creatorId}
				isOpen={isReportDialogOpen}
				setIsOpen={setIsReportDialogOpen}
			/>
		</section>
	);
};

export default OptionsList;
