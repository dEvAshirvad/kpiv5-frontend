"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

interface QueryProviderProps {
	children: React.ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 5 * 60 * 1000, // 5 minutes
						retry: 1,
						refetchOnWindowFocus: false,
						refetchOnMount: false,
						refetchOnReconnect: false,
					},
					mutations: {
						retry: 1,
					},
				},
			})
	);

	return (
		<QueryClientProvider client={queryClient}>
			{children} <ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}
