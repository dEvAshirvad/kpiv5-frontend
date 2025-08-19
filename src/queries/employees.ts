import { useMutation, useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/axios";

// Types
export interface EmployeeContact {
	email?: string;
	phone: string;
}

export interface Employee {
	_id: string;
	name: string;
	contact: EmployeeContact;
	department: string;
	departmentRole: string;
	metadata?: Record<string, string>;
	createdAt?: string;
	updatedAt?: string;
	__v?: number;
}

export interface ListEmployeesParams {
	page?: number; // 1-based
	limit?: number;
	search?: string;
}

export interface ListEmployeesResponse {
	docs: Employee[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	message?: string;
	success?: boolean;
	status?: number;
	timestamp?: string;
	cache?: boolean;
}

export interface GetEmployeeResponse {
	employee: Employee;
	message?: string;
	success?: boolean;
	status?: number;
	timestamp?: string;
	cache?: boolean;
}

export interface CreateEmployeeData {
	name: string;
	contact: EmployeeContact;
	department: string;
	departmentRole: string;
	metadata?: Record<string, string>;
}

export interface CreateEmployeeResponse {
	employee: Employee;
	message: string;
	success: boolean;
	status: number;
	timestamp: string;
	cache: boolean;
}

export interface UpdateEmployeeData {
	name?: string;
	contact?: EmployeeContact;
	department?: string;
	departmentRole?: string;
	metadata?: Record<string, string>;
}

export interface UpdateEmployeeResponse {
	employee: Employee;
	message: string;
	success: boolean;
	status: number;
	timestamp: string;
	cache: boolean;
}

export interface DeleteEmployeeResponse {
	message: string;
	success: boolean;
	status: number;
	timestamp: string;
	cache: boolean;
}

// Employee API functions
const employeeApi = {
	listEmployees: async (
		params: ListEmployeesParams = {}
	): Promise<ListEmployeesResponse> => {
		const { page = 1, limit = 10, search } = params;
		const response = await authApi.get("/v1/employees", {
			params: {
				page,
				limit,
				search,
			},
		});
		return response.data;
	},

	getEmployee: async (id: string): Promise<GetEmployeeResponse> => {
		const response = await authApi.get(`/v1/employees/${id}`);
		return response.data;
	},

	createEmployee: async (
		data: CreateEmployeeData
	): Promise<CreateEmployeeResponse> => {
		const response = await authApi.post("/v1/employees", data);
		return response.data;
	},

	updateEmployee: async (
		id: string,
		data: UpdateEmployeeData
	): Promise<UpdateEmployeeResponse> => {
		const response = await authApi.put(`/v1/employees/${id}`, data);
		return response.data;
	},

	deleteEmployee: async (id: string): Promise<DeleteEmployeeResponse> => {
		const response = await authApi.delete(`/v1/employees/${id}`);
		return response.data;
	},
};

// React Query hooks
export const useListEmployees = (params: ListEmployeesParams = {}) => {
	return useQuery({
		queryKey: ["employees", params],
		queryFn: () => employeeApi.listEmployees(params),
	});
};

export const useGetEmployee = (id?: string) => {
	return useQuery({
		queryKey: ["employee", id],
		queryFn: () => employeeApi.getEmployee(id as string),
		enabled: Boolean(id),
	});
};

export const useCreateEmployee = () => {
	return useMutation({
		mutationFn: employeeApi.createEmployee,
		onSuccess: (data) => {
			console.log("Employee created successfully:", data);
		},
	});
};

export const useUpdateEmployee = () => {
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeData }) =>
			employeeApi.updateEmployee(id, data),
		onSuccess: (data) => {
			console.log("Employee updated successfully:", data);
		},
	});
};

export const useDeleteEmployee = () => {
	return useMutation({
		mutationFn: employeeApi.deleteEmployee,
		onSuccess: (data) => {
			console.log("Employee deleted successfully:", data);
		},
	});
};
