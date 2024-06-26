// components/MovePageToTop.tsx
import { useEffect, useState } from "react";

const MovePageToTop = () => {
	const [isVisible, setIsVisible] = useState(false);

	const toggleVisibility = () => {
		if (window.scrollY > 300) {
			setIsVisible(true);
		} else {
			setIsVisible(false);
		}
	};

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	};

	useEffect(() => {
		window.addEventListener("scroll", toggleVisibility);
		return () => window.removeEventListener("scroll", toggleVisibility);
	}, []);

	return (
		<div>
			{isVisible && (
				<button
					onClick={scrollToTop}
					className="fixed bottom-5 right-5 z-40 bg-green-1 text-white p-3 rounded-full shadow-lg hoverScaleEffect hover:bg-gray-500 transition-opacity duration-300"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={2}
						stroke="currentColor"
						className="size-6"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="m4.5 15.75 7.5-7.5 7.5 7.5"
						/>
					</svg>
				</button>
			)}
		</div>
	);
};

export default MovePageToTop;
