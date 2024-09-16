import {
	useQuery,
	useMutation,
	useQueryClient,
	useInfiniteQuery,
} from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/react-query/queryKeys";
import { getUsersPaginated } from "../actions/creator.actions";

// Updating (post or put or delete) = Mutation and Fetching (get) = Query

// ============================================================
// AUTH QUERIES
// ============================================================

// ============================================================
// CREATOR QUERIES
// ============================================================

export const useGetCreators = () => {
	const limit = 10;
	return useInfiniteQuery({
		queryKey: [QUERY_KEYS.GET_CREATORS],
		queryFn: ({ pageParam = 0 }) => getUsersPaginated(pageParam, limit), // Pass the limit to getUsersPaginated
		getNextPageParam: (lastPage, allPages) => {
			// If there's no data, there are no more pages.
			if (lastPage && lastPage.length === 0) {
				return null;
			}
			// Calculate the next offset based on the number of pages fetched
			return allPages.length * limit;
		},
		initialPageParam: 0, // Start with an offset of 0
	});
};
