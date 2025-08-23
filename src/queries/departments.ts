import { useMutation, useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/axios";

// Types
export interface CreateDepartmentData {
	name: string;
	slug?: string; // Optional since it will be auto-generated
	logo?: string;
	metadata?: object;
}

export interface Department {
	_id: string;
	name: string;
	slug: string;
	createdAt: string;
	updatedAt: string;
	__v: number;
	logo?: string;
	metadata?: object;
}

export interface CreateDepartmentResponse {
	department: Department;
	message: string;
	success: boolean;
	status: number;
	timestamp: string;
	cache: boolean;
}

export interface ListDepartmentsResponse {
	docs: Department[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	message: string;
	success: boolean;
	status: number;
	timestamp: string;
	cache: boolean;
}

export interface UpdateDepartmentData {
	name: string;
	slug?: string; // Optional since it will be auto-generated
	logo?: string;
	metadata?: object;
}

export interface UpdateDepartmentResponse {
	department: Department;
	message: string;
	success: boolean;
	status: number;
	timestamp: string;
	cache: boolean;
}

export interface DeleteDepartmentResponse {
	message: string;
	success: boolean;
	status: number;
	timestamp: string;
	cache: boolean;
}

// Department API functions
const departmentApi = {
	createDepartment: async (
		data: CreateDepartmentData
	): Promise<CreateDepartmentResponse> => {
		const response = await authApi.post("/v1/departments", data);
		return response.data;
	},

	listDepartments: async (): Promise<ListDepartmentsResponse> => {
		const response = await authApi.get("/v1/departments?limit=100");
		return response.data;
	},

	updateDepartment: async (
		id: string,
		data: UpdateDepartmentData
	): Promise<UpdateDepartmentResponse> => {
		const response = await authApi.put(`/v1/departments/${id}`, data);
		return response.data;
	},

	deleteDepartment: async (id: string): Promise<DeleteDepartmentResponse> => {
		const response = await authApi.delete(`/v1/departments/${id}`);
		return response.data;
	},
};

// React Query hooks
export const useListDepartments = () => {
	return useQuery({
		queryKey: ["departments"],
		queryFn: () => departmentApi.listDepartments(),
	});
};

export const useCreateDepartment = () => {
	return useMutation({
		mutationFn: departmentApi.createDepartment,
		onSuccess: (data) => {
			console.log("Department created successfully:", data);
			// You can add toast notifications here
		},
	});
};

export const useUpdateDepartment = () => {
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateDepartmentData }) =>
			departmentApi.updateDepartment(id, data),
		onSuccess: (data) => {
			console.log("Department updated successfully:", data);
			// You can add toast notifications here
		},
	});
};

export const useDeleteDepartment = () => {
	return useMutation({
		mutationFn: departmentApi.deleteDepartment,
		onSuccess: (data) => {
			console.log("Department deleted successfully:", data);
			// You can add toast notifications here
		},
	});
};
