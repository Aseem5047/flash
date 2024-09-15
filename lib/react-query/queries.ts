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
	return useInfiniteQuery({
		queryKey: [QUERY_KEYS.GET_CREATORS],
		queryFn: getUsersPaginated as any,
		getNextPageParam: (lastPage: any) => {
			// If there's no data, there are no more pages.
			if (lastPage && lastPage.documents.length === 0) {
				return null;
			}

			// Use the $id of the last document as the cursor.
			const lastId = lastPage.documents[lastPage.documents.length - 1].$id;
			return lastId;
		},
		initialPageParam: null, // Add this line with an appropriate initial value
	});
};
