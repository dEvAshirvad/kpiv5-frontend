import { useMutation, useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/axios";

// Types
export interface CreateNodalOfficerData {
	email: string;
	password: string;
	name: string;
	role: string;
	data: {
		department: string;
		departmentRole: string;
	};
}

export interface CreateNodalOfficerResponse {
	user: {
		name: string;
		email: string;
		emailVerified: boolean;
		createdAt: string;
		updatedAt: string;
		role: string;
		department: string;
		departmentRole: string;
		id: string;
	};
}

export interface SetNodalOfficerPasswordData {
	newPassword: string;
	userId: string;
}

export interface SetNodalOfficerPasswordResponse {
	status: boolean;
}

export interface RemoveNodalOfficerData {
	userId: string;
}

export interface RemoveNodalOfficerResponse {
	success: boolean;
}

export interface UpdateNodalOfficerData {
	userId: string;
	data: {
		department?: string;
		departmentRole?: string;
	};
}

export interface UpdateNodalOfficerResponse {
	name: string;
	email: string;
	emailVerified: boolean;
	createdAt: string;
	updatedAt: string;
	department: string;
	departmentRole: string;
	role: string;
	id: string;
}

export interface ListUsersParams {
	searchValue?: string;
	searchField?: string;
	searchOperator?: string;
	limit?: number;
	offset?: number;
	sortBy?: string;
	sortDirection?: string;
	filterField?: string;
	filterValue?: string;
	filterOperator?: string;
}

export interface User {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image?: string;
	createdAt: string;
	updatedAt: string;
	role: string;
	banned: boolean;
	banReason?: string;
	banExpires?: string;
	department: string;
	departmentRole: string;
}

export interface ListUsersResponse {
	users: User[];
	total: number;
	limit: number;
	offset: number;
}

// Admin API functions
const adminApi = {
	listNodalOfficers: async (
		params: ListUsersParams
	): Promise<ListUsersResponse> => {
		const queryParams = new URLSearchParams();
		Object.entries(params).forEach(([key, value]) => {
			if (value !== undefined && value !== null && value !== "") {
				queryParams.append(key, value.toString());
			}
		});
		const response = await authApi.get(
			`/auth/admin/list-users?${queryParams.toString()}`
		);
		return response.data;
	},
	createNodalOfficer: async (
		userData: CreateNodalOfficerData
	): Promise<CreateNodalOfficerResponse> => {
		const response = await authApi.post("/auth/admin/create-user", userData);
		return response.data;
	},
	setNodalOfficerPassword: async (
		passwordData: SetNodalOfficerPasswordData
	): Promise<SetNodalOfficerPasswordResponse> => {
		const response = await authApi.post(
			"/auth/admin/set-user-password",
			passwordData
		);
		return response.data;
	},
	removeNodalOfficer: async (
		userData: RemoveNodalOfficerData
	): Promise<RemoveNodalOfficerResponse> => {
		const response = await authApi.post("/auth/admin/remove-user", userData);
		return response.data;
	},
	updateNodalOfficer: async (
		userData: UpdateNodalOfficerData
	): Promise<UpdateNodalOfficerResponse> => {
		const response = await authApi.post("/auth/admin/update-user", userData);
		return response.data;
	},
};

// React Query hooks
export const useListNodalOfficers = (params: ListUsersParams = {}) => {
	const defaultParams: ListUsersParams = {
		offset: 0,
		limit: 10,
		sortBy: "name",
		sortDirection: "desc",
		filterField: "departmentRole",
		filterValue: "nodalOfficer",
		filterOperator: "eq",
		...params,
	};

	return useQuery({
		queryKey: ["nodalOfficers", defaultParams],
		queryFn: () => adminApi.listNodalOfficers(defaultParams),
	});
};

export const useCreateNodalOfficer = () => {
	return useMutation({
		mutationFn: adminApi.createNodalOfficer,
		onSuccess: (data) => {
			console.log("Nodal officer created successfully:", data);
			// You can add toast notifications here
		},
	});
};

export const useSetNodalOfficerPassword = () => {
	return useMutation({
		mutationFn: adminApi.setNodalOfficerPassword,
		onSuccess: (data) => {
			console.log("Nodal officer password updated successfully:", data);
			// You can add toast notifications here
		},
	});
};

export const useRemoveNodalOfficer = () => {
	return useMutation({
		mutationFn: adminApi.removeNodalOfficer,
		onSuccess: (data) => {
			console.log("Nodal officer removed successfully:", data);
			// You can add toast notifications here
		},
	});
};

export const useUpdateNodalOfficer = () => {
	return useMutation({
		mutationFn: adminApi.updateNodalOfficer,
		onSuccess: (data) => {
			console.log("Nodal officer updated successfully:", data);
			// You can add toast notifications here
		},
	});
};
