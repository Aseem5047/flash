import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Unite",
	description:
		"A workspace for your team, powered by Stream Chat and authentication via Clerk.",
	icons: {
		icon: "/icons/logo.jpg",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<ClerkProvider
				appearance={{
					layout: {
						socialButtonsVariant: "auto",
						logoImageUrl: "/icons/logo.jpg",
					},
				}}
			>
				<TooltipProvider>
					<body className={`${inter.className}`}>
						<Toaster />
						{children}
					</body>
				</TooltipProvider>
			</ClerkProvider>
		</html>
	);
}
