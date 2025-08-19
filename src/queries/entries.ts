import { useMutation, useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/axios";

// Types
export interface KpiName {
	label: string;
	value?: string;
}

export interface SubKpiValue {
	key: string;
	value: number;
}

export interface KpiValue {
	key: string;
	value?: number;
	score?: number;
	subKpis: SubKpiValue[];
}

export interface Employee {
	_id: string;
	name: string;
	contact: {
		email?: string;
		phone: string;
	};
	departmentRole: string;
	department: string;
}

export interface Template {
	_id: string;
	name: string;
	description: string;
	role: string;
	frequency: "daily" | "weekly" | "monthly" | "quarterly";
	template?: Array<{
		name: string;
		description: string;
		maxMarks: number;
		kpiType: string;
		metric: string;
		kpiUnit: string;
		isDynamic: boolean;
		subKpis: Array<{
			name: string;
			key: string;
			value_type: string;
		}>;
	}>;
}

export interface Entry {
	_id: string;
	employeeId: Employee;
	templateId: Template;
	month: number;
	year: number;
	kpiNames: KpiName[];
	values: KpiValue[];
	score?: number;
	status: "initiated" | "inprogress" | "generated";
	dataSource?: string;
	createdAt: string;
	updatedAt: string;
}

// Query Parameters
export interface ListEntriesParams {
	page?: number;
	limit?: number;
	search?: string;
	employeeId?: string;
	templateId?: string;
	month?: number;
	year?: number;
	status?: "initiated" | "inprogress" | "generated";
}

// Search Parameters
export interface SearchEntriesParams {
	employeeId?: string;
	templateId?: string;
	month?: number;
	year?: number;
	status?: "initiated" | "inprogress" | "generated";
	kpiNames?: KpiName[];
}

// Request Types
export interface CreateEntryData {
	employeeId: string;
	templateId: string;
	month: number;
	year: number;
	kpiNames: KpiName[];
	values: KpiValue[];
	score?: number;
	status: "initiated" | "inprogress" | "generated";
	dataSource?: string;
}

export interface UpdateEntryData {
	kpiNames?: KpiName[];
	values?: KpiValue[];
	score?: number;
	status?: "initiated" | "inprogress" | "generated";
	dataSource?: string;
}

export interface UpdateEntryStatusData {
	status: "initiated" | "inprogress" | "generated";
}

// Response Types
export interface ListEntriesResponse {
	success: boolean;
	message: string;
	docs: Entry[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

export interface GetEntryResponse {
	success: boolean;
	message: string;
	entry: Entry;
}

export interface CreateEntryResponse {
	success: boolean;
	message: string;
	entry: Entry;
}

export interface UpdateEntryResponse {
	success: boolean;
	message: string;
	entry: Entry;
}

export interface DeleteEntryResponse {
	success: boolean;
	message: string;
	entry: Entry;
}

export interface UpdateEntryStatusResponse {
	success: boolean;
	message: string;
	entry: Entry;
}

export interface CheckEntryExistsResponse {
	success: boolean;
	message: string;
	exists: boolean;
}

export interface GetEntriesByEmployeeResponse {
	success: boolean;
	message: string;
	entries: Entry[];
}

export interface GetEntriesByTemplateResponse {
	success: boolean;
	message: string;
	entries: Entry[];
}

export interface GetEntriesByMonthYearResponse {
	success: boolean;
	message: string;
	entries: Entry[];
}

export interface GetEntriesByStatusResponse {
	success: boolean;
	message: string;
	entries: Entry[];
}

// Workflow Response Types
export interface WorkflowEntryResponse {
	success: boolean;
	message: string;
	entry: Entry;
	isNew: boolean;
}

export interface AvailableEntriesResponse {
	success: boolean;
	message: string;
	entries: Array<{
		_id: string;
		month: number;
		year: number;
		status: string;
	}>;
}

export interface EntrySummaryResponse {
	success: boolean;
	message: string;
	summary: Record<
		string,
		Record<
			string,
			{
				entryId: string;
				status: string;
				score: number;
				month: number;
				year: number;
			}
		>
	>;
}

// Employee Workflow Response Types
export interface DepartmentEmployeesResponse {
	success: boolean;
	message: string;
	employees: Employee[];
}

export interface RoleEmployeesResponse {
	success: boolean;
	message: string;
	employees: Employee[];
}

// Template Workflow Response Types
export interface EmployeeTemplatesResponse {
	success: boolean;
	message: string;
	templates: Template[];
}

export interface FormStructureResponse {
	success: boolean;
	message: string;
	formStructure: {
		templateId: string;
		templateName: string;
		templateDescription: string;
		frequency: string;
		role: string;
		departmentSlug: string;
		kpis: Array<{
			name: string;
			description: string;
			maxMarks: number;
			kpiType: string;
			metric: string;
			kpiUnit: string;
			isDynamic: boolean;
			key: string;
			subKpis: Array<{
				name: string;
				key: string;
				value_type: string;
			}>;
		}>;
	};
}

// Entry API functions
const entryApi = {
	listEntries: async (
		params: ListEntriesParams = {}
	): Promise<ListEntriesResponse> => {
		const {
			page = 1,
			limit = 10,
			search,
			employeeId,
			templateId,
			month,
			year,
			status,
		} = params;
		const response = await authApi.get("/v1/entries", {
			params: {
				page,
				limit,
				search,
				employeeId,
				templateId,
				month,
				year,
				status,
			},
		});
		return response.data;
	},

	getEntry: async (id: string): Promise<GetEntryResponse> => {
		const response = await authApi.get(`/v1/entries/${id}`);
		return response.data;
	},

	createEntry: async (data: CreateEntryData): Promise<CreateEntryResponse> => {
		const response = await authApi.post("/v1/entries", data);
		return response.data;
	},

	updateEntry: async (
		id: string,
		data: UpdateEntryData
	): Promise<UpdateEntryResponse> => {
		const response = await authApi.put(`/v1/entries/${id}`, data);
		return response.data;
	},

	deleteEntry: async (id: string): Promise<DeleteEntryResponse> => {
		const response = await authApi.delete(`/v1/entries/${id}`);
		return response.data;
	},

	updateEntryStatus: async (
		id: string,
		data: UpdateEntryStatusData
	): Promise<UpdateEntryStatusResponse> => {
		const response = await authApi.put(`/v1/entries/${id}/status`, data);
		return response.data;
	},

	checkEntryExists: async (
		employeeId: string,
		templateId: string,
		month: number,
		year: number
	): Promise<CheckEntryExistsResponse> => {
		const response = await authApi.get(
			`/v1/entries/check/${employeeId}/${templateId}/${month}/${year}`
		);
		return response.data;
	},

	getEntryByEmployeeTemplateMonthYear: async (
		employeeId: string,
		templateId: string,
		month: number,
		year: number
	): Promise<GetEntryResponse> => {
		const response = await authApi.get(
			`/v1/entries/find/${employeeId}/${templateId}/${month}/${year}`
		);
		return response.data;
	},

	getEntriesByEmployee: async (
		employeeId: string
	): Promise<GetEntriesByEmployeeResponse> => {
		const response = await authApi.get(`/v1/entries/employee/${employeeId}`);
		return response.data;
	},

	getEntriesByTemplate: async (
		templateId: string
	): Promise<GetEntriesByTemplateResponse> => {
		const response = await authApi.get(`/v1/entries/template/${templateId}`);
		return response.data;
	},

	getEntriesByMonthYear: async (
		month: number,
		year: number
	): Promise<GetEntriesByMonthYearResponse> => {
		const response = await authApi.get(
			`/v1/entries/month/${month}/year/${year}`
		);
		return response.data;
	},

	getEntriesByStatus: async (
		status: string
	): Promise<GetEntriesByStatusResponse> => {
		const response = await authApi.get(`/v1/entries/status/${status}`);
		return response.data;
	},

	// Workflow Endpoints
	getWorkflowEntry: async (
		employeeId: string,
		templateId: string,
		month: number,
		year: number
	): Promise<WorkflowEntryResponse> => {
		const response = await authApi.get(
			`/v1/entries/workflow/${employeeId}/${templateId}/${month}/${year}`
		);
		return response.data;
	},

	getAvailableEntries: async (
		employeeId: string,
		templateId: string
	): Promise<AvailableEntriesResponse> => {
		const response = await authApi.get(
			`/v1/entries/available/${employeeId}/${templateId}`
		);
		return response.data;
	},

	getEntrySummary: async (
		employeeId: string
	): Promise<EntrySummaryResponse> => {
		const response = await authApi.get(`/v1/entries/summary/${employeeId}`);
		return response.data;
	},

	// Employee Workflow Endpoints
	getDepartmentEmployees: async (
		department: string
	): Promise<DepartmentEmployeesResponse> => {
		const response = await authApi.get(
			`/v1/employees/department/${department}`
		);
		return response.data;
	},

	getRoleEmployees: async (
		departmentRole: string
	): Promise<RoleEmployeesResponse> => {
		const response = await authApi.get(`/v1/employees/role/${departmentRole}`);
		return response.data;
	},

	// Template Workflow Endpoints
	getEmployeeTemplates: async (
		employeeId: string
	): Promise<EmployeeTemplatesResponse> => {
		const response = await authApi.get(`/v1/templates/employee/${employeeId}`);
		return response.data;
	},

	getFormStructure: async (
		templateId: string
	): Promise<FormStructureResponse> => {
		const response = await authApi.get(
			`/v1/templates/${templateId}/form-structure`
		);
		return response.data;
	},

	// Search API
	searchEntries: async (
		params: SearchEntriesParams
	): Promise<ListEntriesResponse> => {
		const queryParams = new URLSearchParams();

		if (params.employeeId) queryParams.append("employeeId", params.employeeId);
		if (params.templateId) queryParams.append("templateId", params.templateId);
		if (params.month) queryParams.append("month", params.month.toString());
		if (params.year) queryParams.append("year", params.year.toString());
		if (params.kpiNames)
			queryParams.append("kpiNames", JSON.stringify(params.kpiNames));

		const response = await authApi.get(
			`/v1/entries/search?${queryParams.toString()}`
		);
		return response.data;
	},
};

// React Query hooks
export const useListEntries = (params: ListEntriesParams = {}) => {
	return useQuery({
		queryKey: ["entries", params],
		queryFn: () => entryApi.listEntries(params),
	});
};

export const useGetEntry = (id?: string) => {
	return useQuery({
		queryKey: ["entry", id],
		queryFn: () => entryApi.getEntry(id as string),
		enabled: Boolean(id),
	});
};

export const useCreateEntry = () => {
	return useMutation({
		mutationFn: entryApi.createEntry,
		onSuccess: (data) => {
			console.log("Entry created successfully:", data);
		},
	});
};

export const useUpdateEntry = () => {
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateEntryData }) =>
			entryApi.updateEntry(id, data),
		onSuccess: (data) => {
			console.log("Entry updated successfully:", data);
		},
	});
};

export const useDeleteEntry = () => {
	return useMutation({
		mutationFn: entryApi.deleteEntry,
		onSuccess: (data) => {
			console.log("Entry deleted successfully:", data);
		},
	});
};

export const useUpdateEntryStatus = () => {
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateEntryStatusData }) =>
			entryApi.updateEntryStatus(id, data),
		onSuccess: (data) => {
			console.log("Entry status updated successfully:", data);
		},
	});
};

export const useCheckEntryExists = (
	employeeId?: string,
	templateId?: string,
	month?: number,
	year?: number
) => {
	return useQuery({
		queryKey: ["entryExists", employeeId, templateId, month, year],
		queryFn: () =>
			entryApi.checkEntryExists(
				employeeId as string,
				templateId as string,
				month as number,
				year as number
			),
		enabled: Boolean(employeeId && templateId && month && year),
	});
};

export const useGetEntryByEmployeeTemplateMonthYear = (
	employeeId?: string,
	templateId?: string,
	month?: number,
	year?: number
) => {
	return useQuery({
		queryKey: [
			"entryByEmployeeTemplateMonthYear",
			employeeId,
			templateId,
			month,
			year,
		],
		queryFn: () =>
			entryApi.getEntryByEmployeeTemplateMonthYear(
				employeeId as string,
				templateId as string,
				month as number,
				year as number
			),
		enabled: Boolean(employeeId && templateId && month && year),
	});
};

export const useGetEntriesByEmployee = (employeeId?: string) => {
	return useQuery({
		queryKey: ["entriesByEmployee", employeeId],
		queryFn: () => entryApi.getEntriesByEmployee(employeeId as string),
		enabled: Boolean(employeeId),
	});
};

export const useGetEntriesByTemplate = (templateId?: string) => {
	return useQuery({
		queryKey: ["entriesByTemplate", templateId],
		queryFn: () => entryApi.getEntriesByTemplate(templateId as string),
		enabled: Boolean(templateId),
	});
};

export const useGetEntriesByMonthYear = (month?: number, year?: number) => {
	return useQuery({
		queryKey: ["entriesByMonthYear", month, year],
		queryFn: () =>
			entryApi.getEntriesByMonthYear(month as number, year as number),
		enabled: Boolean(month && year),
	});
};

export const useGetEntriesByStatus = (status?: string) => {
	return useQuery({
		queryKey: ["entriesByStatus", status],
		queryFn: () => entryApi.getEntriesByStatus(status as string),
		enabled: Boolean(status),
	});
};

// Workflow Hooks
export const useGetWorkflowEntry = (
	employeeId?: string,
	templateId?: string,
	month?: number,
	year?: number
) => {
	return useQuery({
		queryKey: ["workflowEntry", employeeId, templateId, month, year],
		queryFn: () =>
			entryApi.getWorkflowEntry(
				employeeId as string,
				templateId as string,
				month as number,
				year as number
			),
		enabled: Boolean(employeeId && templateId && month && year),
	});
};

export const useGetAvailableEntries = (
	employeeId?: string,
	templateId?: string
) => {
	return useQuery({
		queryKey: ["availableEntries", employeeId, templateId],
		queryFn: () =>
			entryApi.getAvailableEntries(employeeId as string, templateId as string),
		enabled: Boolean(employeeId && templateId),
	});
};

export const useGetEntrySummary = (employeeId?: string) => {
	return useQuery({
		queryKey: ["entrySummary", employeeId],
		queryFn: () => entryApi.getEntrySummary(employeeId as string),
		enabled: Boolean(employeeId),
	});
};

// Employee Workflow Hooks
export const useGetDepartmentEmployees = (department?: string) => {
	return useQuery({
		queryKey: ["departmentEmployees", department],
		queryFn: () => entryApi.getDepartmentEmployees(department as string),
		enabled: Boolean(department),
	});
};

export const useGetRoleEmployees = (departmentRole?: string) => {
	return useQuery({
		queryKey: ["roleEmployees", departmentRole],
		queryFn: () => entryApi.getRoleEmployees(departmentRole as string),
		enabled: Boolean(departmentRole),
	});
};

// Template Workflow Hooks
export const useGetEmployeeTemplates = (employeeId?: string) => {
	return useQuery({
		queryKey: ["employeeTemplates", employeeId],
		queryFn: () => entryApi.getEmployeeTemplates(employeeId as string),
		enabled: Boolean(employeeId),
	});
};

export const useGetFormStructure = (templateId?: string) => {
	return useQuery({
		queryKey: ["formStructure", templateId],
		queryFn: () => entryApi.getFormStructure(templateId as string),
		enabled: Boolean(templateId),
	});
};

// Search Hook
export const useSearchEntries = (params: SearchEntriesParams) => {
	return useQuery({
		queryKey: ["searchEntries", params],
		queryFn: () => entryApi.searchEntries(params),
		enabled: Boolean(
			params.employeeId ||
				params.templateId ||
				params.month ||
				params.year ||
				(params.kpiNames && params.kpiNames.length > 0)
		),
	});
};
