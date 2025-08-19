import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/axios";

// Types
export interface SignInCredentials {
	email: string;
	password: string;
	rememberMe?: boolean;
}

export interface SignInResponse {
	redirect: false;
	token: string;
	user: {
		id: string;
		email: string;
		name: string;
		emailVerified: boolean;
		createdAt: string;
		updatedAt: string;
	};
}

export interface Session {
	expiresAt: string;
	token: string;
	createdAt: string;
	updatedAt: string;
	ipAddress: string;
	userAgent: string;
	userId: string;
	id: string;
}

export interface User {
	name: string;
	email: string;
	role: string;
	department: string;
	departmentRole: string;
	emailVerified: boolean;
	createdAt: string;
	updatedAt: string;
	id: string;
}

export interface SessionResponse {
	session: Session;
	user: User;
}

// Auth API functions
const authApiFunctions = {
	signIn: async (credentials: SignInCredentials): Promise<SignInResponse> => {
		const response = await authApi.post("/auth/sign-in/email", credentials);
		return response.data;
	},

	signOut: async (): Promise<void> => {
		await authApi.post("/auth/sign-out");
	},

	getSession: async (): Promise<SessionResponse> => {
		const response = await authApi.get("/auth/get-session");
		return response.data;
	},
};

// React Query hooks
export const useSignIn = () => {
	return useMutation({
		mutationFn: authApiFunctions.signIn,
		onError: (error: any) => {
			console.error("Sign in error:", error);
			// You can add toast notifications here
		},
	});
};

export const useSession = (enabled: boolean = true) => {
	return useQuery({
		queryKey: ["session"],
		queryFn: authApiFunctions.getSession,
		retry: 1,
		staleTime: 5 * 60 * 1000, // 5 minutes
		enabled: enabled, // Always enabled to check session status
	});
};

export const useSignOut = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: authApiFunctions.signOut,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["session"] });
		},
	});
};
