import { useMutation, useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/axios";

// Types
export interface SubKpi {
	name: string;
	key: string;
	value_type: "number";
}

export interface KpiTemplate {
	name: string;
	description: string;
	maxMarks: number;
	kpiType: "percentage";
	kpiUnit: "%";
	isDynamic: boolean;
	subKpis: SubKpi[];
}

export interface Template {
	_id: string;
	name: string;
	description: string;
	role: string;
	frequency: "daily" | "weekly" | "monthly" | "quarterly";
	departmentSlug: string;
	template: KpiTemplate[];
	kpiName: string;
	createdBy: string;
	updatedBy: string;
	createdAt: string;
	updatedAt: string;
}

export interface TemplateVersion {
	_id: string;
	templateId: string;
	version: number;
	name: string;
	description: string;
	role: string;
	frequency: "daily" | "weekly" | "monthly" | "quarterly";
	departmentSlug: string;
	template: KpiTemplate[];
	createdBy: string;
	createdAt: string;
	updatedAt: string;
}

// Query Parameters
export interface ListTemplatesParams {
	page?: number;
	limit?: number;
	search?: string;
	departmentSlug?: string;
	frequency?: "daily" | "weekly" | "monthly" | "quarterly";
	role?: string;
}

// Request Types
export interface CreateTemplateData {
	name: string;
	description: string;
	role: string;
	frequency: "daily" | "weekly" | "monthly" | "quarterly";
	departmentSlug: string;
	template: KpiTemplate[];
	kpiName: string;
	createdBy: string;
	updatedBy: string;
}

export interface UpdateTemplateData {
	name?: string;
	description?: string;
	role?: string;
	frequency?: "daily" | "weekly" | "monthly" | "quarterly";
	departmentSlug?: string;
	template?: KpiTemplate[];
	updatedBy: string;
}

export interface CreateTemplateVersionData {
	templateId: string;
	version: number;
	name: string;
	description: string;
	role: string;
	frequency: "daily" | "weekly" | "monthly" | "quarterly";
	departmentSlug: string;
	template: KpiTemplate[];
	createdBy: string;
}

// Response Types
export interface ListTemplatesResponse {
	success: boolean;
	message: string;
	docs: Template[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

export interface GetTemplateResponse {
	success: boolean;
	message: string;
	template: Template;
}

export interface CreateTemplateResponse {
	success: boolean;
	message: string;
	template: Template;
}

export interface UpdateTemplateResponse {
	success: boolean;
	message: string;
	template: Template;
}

export interface DeleteTemplateResponse {
	success: boolean;
	message: string;
	template: Template;
}

export interface CreateTemplateVersionResponse {
	success: boolean;
	message: string;
	version: TemplateVersion;
}

export interface GetTemplateVersionsResponse {
	success: boolean;
	message: string;
	versions: TemplateVersion[];
}

export interface GetTemplateVersionResponse {
	success: boolean;
	message: string;
	version: TemplateVersion;
}

export interface GetTemplatesByDepartmentResponse {
	success: boolean;
	message: string;
	templates: Template[];
}

export interface GetTemplatesByFrequencyResponse {
	success: boolean;
	message: string;
	templates: Template[];
}

export interface GetTemplatesByRoleResponse {
	success: boolean;
	message: string;
	templates: Template[];
}

// Template API functions
const templateApi = {
	listTemplates: async (
		params: ListTemplatesParams = {}
	): Promise<ListTemplatesResponse> => {
		const {
			page = 1,
			limit = 10,
			search,
			departmentSlug,
			frequency,
			role,
		} = params;
		const response = await authApi.get(`/v1/templates`, {
			params: {
				page,
				limit,
				search,
				departmentSlug,
				frequency,
				role,
			},
		});
		return response.data;
	},

	getTemplate: async (id: string): Promise<GetTemplateResponse> => {
		const response = await authApi.get(`/v1/templates/${id}`);
		return response.data;
	},

	createTemplate: async (
		data: CreateTemplateData
	): Promise<CreateTemplateResponse> => {
		const response = await authApi.post("/v1/templates", data);
		return response.data;
	},

	updateTemplate: async (
		id: string,
		data: UpdateTemplateData
	): Promise<UpdateTemplateResponse> => {
		const response = await authApi.put(`/v1/templates/${id}`, data);
		return response.data;
	},

	deleteTemplate: async (id: string): Promise<DeleteTemplateResponse> => {
		const response = await authApi.delete(`/v1/templates/${id}`);
		return response.data;
	},

	// Template Version APIs
	createTemplateVersion: async (
		data: CreateTemplateVersionData
	): Promise<CreateTemplateVersionResponse> => {
		const response = await authApi.post("/v1/templates/versions", data);
		return response.data;
	},

	getTemplateVersions: async (
		templateId: string
	): Promise<GetTemplateVersionsResponse> => {
		const response = await authApi.get(`/v1/templates/${templateId}/versions`);
		return response.data;
	},

	getTemplateVersion: async (
		templateId: string,
		version: number
	): Promise<GetTemplateVersionResponse> => {
		const response = await authApi.get(
			`/v1/templates/${templateId}/versions/${version}`
		);
		return response.data;
	},

	// Filter APIs
	getTemplatesByDepartment: async (
		departmentSlug: string
	): Promise<GetTemplatesByDepartmentResponse> => {
		const response = await authApi.get(
			`/v1/templates/department/${departmentSlug}`
		);
		return response.data;
	},

	getTemplatesByFrequency: async (
		frequency: string
	): Promise<GetTemplatesByFrequencyResponse> => {
		const response = await authApi.get(`/v1/templates/frequency/${frequency}`);
		return response.data;
	},

	getTemplatesByRole: async (
		role: string
	): Promise<GetTemplatesByRoleResponse> => {
		const response = await authApi.get(`/v1/templates/role/${role}`);
		return response.data;
	},
};

// React Query hooks
export const useListTemplates = (params: ListTemplatesParams = {}) => {
	return useQuery({
		queryKey: ["templates", params],
		queryFn: () => templateApi.listTemplates(params),
	});
};

export const useGetTemplate = (id?: string) => {
	return useQuery({
		queryKey: ["template", id],
		queryFn: () => templateApi.getTemplate(id as string),
		enabled: Boolean(id),
	});
};

export const useCreateTemplate = () => {
	return useMutation({
		mutationFn: templateApi.createTemplate,
		onSuccess: (data) => {
			console.log("Template created successfully:", data);
		},
	});
};

export const useUpdateTemplate = () => {
	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateTemplateData }) =>
			templateApi.updateTemplate(id, data),
		onSuccess: (data) => {
			console.log("Template updated successfully:", data);
		},
	});
};

export const useDeleteTemplate = () => {
	return useMutation({
		mutationFn: templateApi.deleteTemplate,
		onSuccess: (data) => {
			console.log("Template deleted successfully:", data);
		},
	});
};

// Template Version hooks
export const useCreateTemplateVersion = () => {
	return useMutation({
		mutationFn: templateApi.createTemplateVersion,
		onSuccess: (data) => {
			console.log("Template version created successfully:", data);
		},
	});
};

export const useGetTemplateVersions = (templateId?: string) => {
	return useQuery({
		queryKey: ["templateVersions", templateId],
		queryFn: () => templateApi.getTemplateVersions(templateId as string),
		enabled: Boolean(templateId),
	});
};

export const useGetTemplateVersion = (
	templateId?: string,
	version?: number
) => {
	return useQuery({
		queryKey: ["templateVersion", templateId, version],
		queryFn: () =>
			templateApi.getTemplateVersion(templateId as string, version as number),
		enabled: Boolean(templateId && version),
	});
};

// Filter hooks
export const useGetTemplatesByDepartment = (departmentSlug?: string) => {
	return useQuery({
		queryKey: ["templatesByDepartment", departmentSlug],
		queryFn: () =>
			templateApi.getTemplatesByDepartment(departmentSlug as string),
		enabled: Boolean(departmentSlug),
	});
};

export const useGetTemplatesByFrequency = (frequency?: string) => {
	return useQuery({
		queryKey: ["templatesByFrequency", frequency],
		queryFn: () => templateApi.getTemplatesByFrequency(frequency as string),
		enabled: Boolean(frequency),
	});
};

export const useGetTemplatesByRole = (role?: string) => {
	return useQuery({
		queryKey: ["templatesByRole", role],
		queryFn: () => templateApi.getTemplatesByRole(role as string),
		enabled: Boolean(role),
	});
};
