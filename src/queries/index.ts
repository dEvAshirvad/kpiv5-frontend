// Auth queries
export { useSignIn, useSignOut, useSession } from "./auth";

// Admin queries
export {
	useCreateNodalOfficer,
	useSetNodalOfficerPassword,
	useRemoveNodalOfficer,
	useUpdateNodalOfficer,
} from "./admin";

// Types
export type {
	SignInCredentials,
	SignInResponse,
	Session,
	User,
	SessionResponse,
} from "./auth";

export type {
	CreateNodalOfficerData,
	CreateNodalOfficerResponse,
	SetNodalOfficerPasswordData,
	SetNodalOfficerPasswordResponse,
	RemoveNodalOfficerData,
	RemoveNodalOfficerResponse,
	UpdateNodalOfficerData,
	UpdateNodalOfficerResponse,
} from "./admin";

// Employees queries
export {
	useListEmployees,
	useGetEmployee,
	useCreateEmployee,
	useUpdateEmployee,
	useDeleteEmployee,
} from "./employees";

export type {
	Employee,
	ListEmployeesParams,
	ListEmployeesResponse,
	GetEmployeeResponse,
	CreateEmployeeData,
	CreateEmployeeResponse,
	UpdateEmployeeData,
	UpdateEmployeeResponse,
	DeleteEmployeeResponse,
} from "./employees";

// Template queries
export {
	useListTemplates,
	useGetTemplate,
	useCreateTemplate,
	useUpdateTemplate,
	useDeleteTemplate,
	useCreateTemplateVersion,
	useGetTemplateVersions,
	useGetTemplateVersion,
	useGetTemplatesByDepartment,
	useGetTemplatesByFrequency,
	useGetTemplatesByRole,
} from "./templates";

export type {
	Template,
	TemplateVersion,
	KpiTemplate,
	SubKpi,
	ListTemplatesParams,
	ListTemplatesResponse,
	GetTemplateResponse,
	CreateTemplateData,
	CreateTemplateResponse,
	UpdateTemplateData,
	UpdateTemplateResponse,
	DeleteTemplateResponse,
	CreateTemplateVersionData,
	CreateTemplateVersionResponse,
	GetTemplateVersionsResponse,
	GetTemplateVersionResponse,
	GetTemplatesByDepartmentResponse,
	GetTemplatesByFrequencyResponse,
	GetTemplatesByRoleResponse,
} from "./templates";

// Entry queries
export {
	useListEntries,
	useGetEntry,
	useCreateEntry,
	useUpdateEntry,
	useDeleteEntry,
	useUpdateEntryStatus,
	useCheckEntryExists,
	useGetEntryByEmployeeTemplateMonthYear,
	useGetEntriesByEmployee,
	useGetEntriesByTemplate,
	useGetEntriesByMonthYear,
	useGetEntriesByStatus,
	// Workflow hooks
	useGetWorkflowEntry,
	useGetAvailableEntries,
	useGetEntrySummary,
	useGetDepartmentEmployees,
	useGetRoleEmployees,
	useGetEmployeeTemplates,
	useGetFormStructure,
	useSearchEntries,
} from "./entries";

export type {
	Entry,
	KpiName,
	KpiValue,
	SubKpiValue,
	Employee as EntryEmployee,
	Template as EntryTemplate,
	ListEntriesParams,
	SearchEntriesParams,
	ListEntriesResponse,
	GetEntryResponse,
	CreateEntryData,
	CreateEntryResponse,
	UpdateEntryData,
	UpdateEntryResponse,
	DeleteEntryResponse,
	UpdateEntryStatusData,
	UpdateEntryStatusResponse,
	CheckEntryExistsResponse,
	GetEntriesByEmployeeResponse,
	GetEntriesByTemplateResponse,
	GetEntriesByMonthYearResponse,
	GetEntriesByStatusResponse,
} from "./entries";

// Statistics exports
export * from "./statistics";
