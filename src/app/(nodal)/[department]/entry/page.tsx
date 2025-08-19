"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	ArrowLeft,
	Users,
	FileText,
	Calendar,
	CheckCircle,
	Plus,
	Edit,
	Trash2,
	Search,
	Loader2,
	AlertCircle,
	ChevronRight,
	ChevronLeft,
	LogOut,
	Mail,
	Phone,
} from "lucide-react";

// API hooks
import {
	useListEntries,
	useCreateEntry,
	useUpdateEntry,
	useUpdateEntryStatus,
	// Workflow hooks
	useGetWorkflowEntry,
	useGetAvailableEntries,
	useGetDepartmentEmployees,
	useGetEmployeeTemplates,
	useGetFormStructure,
	useSearchEntries,
	useGetTemplate,
	CreateEntryData,
	UpdateEntryData,
	KpiName,
	KpiValue,
	SubKpiValue,
	Entry,
	SearchEntriesParams,
	Employee,
} from "@/queries";

// Template types
import {
	Template,
	KpiTemplate,
	SubKpi,
	GetTemplateResponse,
} from "@/queries/templates";

// Auth hooks
import { useSession, useSignOut } from "@/queries";

interface StepData {
	employeeId: string;
	templateId: string;
	month: number;
	year: number;
	kpiNames: KpiName[];
	values: KpiValue[];
	existingEntry?: any; // For editing existing entries
}

export default function EntryPage() {
	const params = useParams();
	const router = useRouter();
	const {
		data: session,
		isLoading: sessionLoading,
		error: sessionError,
	} = useSession();
	const signOutMutation = useSignOut();

	// Debug session status
	console.log("Session status:", { session, sessionLoading, sessionError });

	// Redirect to login if no session
	useEffect(() => {
		if (!sessionLoading && !session) {
			console.log("No session found, redirecting to login");
			router.push("/login");
		}
	}, [session, sessionLoading, router]);

	// Step management
	const [currentStep, setCurrentStep] = useState(1);
	const [stepData, setStepData] = useState<StepData>({
		employeeId: "",
		templateId: "",
		month: new Date().getMonth() + 1,
		year: new Date().getFullYear(),
		kpiNames: [],
		values: [],
		existingEntry: undefined,
	});

	// State for real-time progress tracking
	const [progressValues, setProgressValues] = useState<{
		[key: number]: number;
	}>({});

	// State for employee search and filtering
	const [employeeNameSearch, setEmployeeNameSearch] = useState("");
	const [employeeRoleSearch, setEmployeeRoleSearch] = useState("");

	// KPI Names state for step 4
	const [kpiNameInputs, setKpiNameInputs] = useState<KpiName[]>([
		{ label: "", value: "" },
	]);

	// UI states
	const [searchValue, setSearchValue] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");

	// Advanced search state
	const [searchParams, setSearchParams] = useState<SearchEntriesParams>({});
	const [kpiNameFilters, setKpiNameFilters] = useState<KpiName[]>([
		{ label: "", value: "" },
	]);

	// API queries - using search API only
	const { data: employeesData, isLoading: employeesLoading } =
		useGetDepartmentEmployees(params.department as string);

	const { data: templatesData, isLoading: templatesLoading } =
		useGetEmployeeTemplates(stepData.employeeId);

	// Filter employees based on search criteria
	const filteredEmployees =
		employeesData?.employees?.filter((employee: Employee) => {
			const nameMatch = employee.name
				.toLowerCase()
				.includes(employeeNameSearch.toLowerCase());

			// Check for role in different possible locations
			const employeeRole = employee.departmentRole;
			const roleMatch =
				employeeRoleSearch === "" ||
				employeeRole.toLowerCase().includes(employeeRoleSearch.toLowerCase());

			return nameMatch && roleMatch;
		}) || [];

	// Get template data for form generation
	const { data: templateData, isLoading: templateLoading } = useGetTemplate(
		stepData.templateId
	) as { data: GetTemplateResponse | undefined; isLoading: boolean };

	// Search entries
	const { data: searchData, isLoading: searchLoading } =
		useSearchEntries(searchParams);

	// Debug search hook
	useEffect(() => {
		console.log("Search hook triggered:", {
			searchParams,
			searchData,
			searchLoading,
		});
	}, [searchParams, searchData, searchLoading]);

	// Use search data if available, otherwise use regular entries
	const entriesData = (searchData as any)?.entries
		? {
				docs: (searchData as any).entries,
				total: (searchData as any).entries.length,
				page: 1,
				limit: 10,
				totalPages: 1,
				hasNextPage: false,
				hasPreviousPage: false,
		  }
		: {
				docs: [],
				total: 0,
				page: 1,
				limit: 10,
				totalPages: 0,
				hasNextPage: false,
				hasPreviousPage: false,
		  };
	const entriesLoading = searchLoading;

	// Regular entries for fallback
	const { refetch: refetchEntries } = useListEntries({
		page: 1,
		limit: 10,
		search: searchValue,
		status: statusFilter === "all" ? undefined : (statusFilter as any),
	});

	// Mutations
	const createEntryMutation = useCreateEntry();
	const updateEntryMutation = useUpdateEntry();
	const updateEntryStatusMutation = useUpdateEntryStatus();

	// Step navigation
	const nextStep = () => {
		if (currentStep < 7) {
			// Updated to 7 steps (removed workflow step)
			setCurrentStep(currentStep + 1);
		}
	};

	const prevStep = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
		}
	};

	const goToStep = (step: number) => {
		setCurrentStep(step);
	};

	// Step 1: Choose Employee
	const handleEmployeeSelect = (employeeId: string) => {
		setStepData((prev) => ({ ...prev, employeeId }));
		nextStep();
	};

	// Step 2: Choose Template
	const handleTemplateSelect = (templateId: string) => {
		setStepData((prev) => ({ ...prev, templateId }));
		nextStep();
	};

	// Step 3: Choose Month and Year
	const handleMonthYearSelect = (month: number, year: number) => {
		setStepData((prev) => ({ ...prev, month, year }));
		nextStep();
	};

	// Step 4: Add KPI Names
	const addKpiNameInput = () => {
		setKpiNameInputs([...kpiNameInputs, { label: "", value: "" }]);
	};

	const removeKpiNameInput = (index: number) => {
		if (kpiNameInputs.length > 1) {
			setKpiNameInputs(kpiNameInputs.filter((_, i) => i !== index));
		}
	};

	const updateKpiNameInput = (
		index: number,
		field: "label" | "value",
		value: string
	) => {
		const updated = [...kpiNameInputs];
		updated[index] = { ...updated[index], [field]: value };
		setKpiNameInputs(updated);
	};

	const handleKpiNamesSubmit = () => {
		// Filter out empty labels
		const validKpiNames = kpiNameInputs.filter((kpi) => kpi.label.trim());
		setStepData((prev) => ({ ...prev, kpiNames: validKpiNames }));
		nextStep();
	};

	// Step 5: Search KPI
	const handleSearchKpi = () => {
		nextStep();
	};

	// Handle edit existing entry
	const handleEditExistingEntry = (entry: any) => {
		// Set the existing entry data for editing
		// IMPORTANT: Keep the original manually entered KPI names, don't override with template names
		setStepData((prev) => ({
			...prev,
			existingEntry: entry,
			values: entry.values,
			// Keep the original kpiNames from Step 4, don't use entry.kpiNames
			kpiNames: prev.kpiNames,
		}));

		// Initialize progress values for existing entry
		const initialProgress: { [key: number]: number } = {};
		entry.values?.forEach((value: any, index: number) => {
			initialProgress[index] = value.value || 0;
		});
		setProgressValues(initialProgress);

		nextStep();
	};

	// Handle real-time progress updates
	const handleProgressUpdate = (index: number, value: number) => {
		setProgressValues((prev) => ({
			...prev,
			[index]: value,
		}));
	};

	// Trigger search when reaching Step 5
	useEffect(() => {
		if (currentStep === 5) {
			// Set up search parameters for existing entries
			const searchParams: SearchEntriesParams = {
				employeeId: stepData.employeeId,
				templateId: stepData.templateId,
				month: stepData.month,
				year: stepData.year,
				kpiNames: stepData.kpiNames.filter((kpi) => kpi.label.trim() !== ""),
			};

			// Set search parameters to trigger the search
			console.log("Step 5: Triggering search with params:", searchParams);
			setSearchParams(searchParams);
		}
	}, [
		currentStep,
		stepData.employeeId,
		stepData.templateId,
		stepData.month,
		stepData.year,
		stepData.kpiNames,
	]);

	// Get selected employee name
	const getSelectedEmployeeName = () => {
		return (
			employeesData?.employees.find(
				(emp: any) => emp._id === stepData.employeeId
			)?.name || ""
		);
	};

	// Get selected template name
	const getSelectedTemplateName = () => {
		return (
			templatesData?.templates.find(
				(temp: any) => temp._id === stepData.templateId
			)?.name || ""
		);
	};

	// Generate form data when template is loaded
	useEffect(() => {
		if (templateData?.template && stepData.templateId) {
			const kpiTemplates = templateData.template.template;
			const values: KpiValue[] = kpiTemplates.map((kpi: KpiTemplate) => ({
				key: kpi.name.toLowerCase().replace(/\s+/g, ""),
				value: 0,
				subKpis: kpi.subKpis
					? kpi.subKpis.map((subKpi: any) => ({
							key: subKpi.key,
							value: 0,
					  }))
					: [],
			}));

			// Don't override KPI names - keep the ones from Step 4
			setStepData((prev) => ({
				...prev,
				values,
			}));
		}
	}, [templateData, stepData.templateId]);

	// Get status color
	const getStatusColor = (status: string) => {
		switch (status) {
			case "initiated":
				return "bg-blue-100 text-blue-800";
			case "inprogress":
				return "bg-yellow-100 text-yellow-800";
			case "generated":
				return "bg-green-100 text-green-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	// Format date
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-GB");
	};

	// Advanced search helpers
	const addKpiNameFilter = () => {
		setKpiNameFilters([...kpiNameFilters, { label: "", value: "" }]);
	};

	const removeKpiNameFilter = (index: number) => {
		if (kpiNameFilters.length > 1) {
			setKpiNameFilters(kpiNameFilters.filter((_, i) => i !== index));
		}
	};

	const updateKpiNameFilter = (
		index: number,
		field: "label" | "value",
		value: string
	) => {
		const updated = [...kpiNameFilters];
		updated[index] = { ...updated[index], [field]: value };
		setKpiNameFilters(updated);
	};

	const handleAdvancedSearch = () => {
		const params: SearchEntriesParams = {};

		// Add search parameters
		if (searchParams.employeeId) params.employeeId = searchParams.employeeId;
		if (searchParams.templateId) params.templateId = searchParams.templateId;
		if (searchParams.month) params.month = searchParams.month;
		if (searchParams.year) params.year = searchParams.year;
		if (statusFilter !== "all") params.status = statusFilter as any;

		// Add KPI name filters if they have labels
		const validKpiNames = kpiNameFilters.filter((kpi) => kpi.label.trim());
		if (validKpiNames.length > 0) {
			params.kpiNames = validKpiNames;
		}

		setSearchParams(params);
	};

	const clearAdvancedSearch = () => {
		setSearchParams({});
		setKpiNameFilters([{ label: "", value: "" }]);
		setSearchValue("");
		setStatusFilter("all");
	};

	// Show loading while checking session
	if (sessionLoading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
					<p>Loading session...</p>
				</div>
			</div>
		);
	}

	// Show error if session failed to load
	if (sessionError) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
					<p className="text-red-600">Session error: {sessionError.message}</p>
					<Button onClick={() => router.push("/login")} className="mt-4">
						Go to Login
					</Button>
				</div>
			</div>
		);
	}

	// Show login prompt if no session
	if (!session) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-4" />
					<p>No active session found</p>
					<Button onClick={() => router.push("/login")} className="mt-4">
						Go to Login
					</Button>
				</div>
			</div>
		);
	}

	const handleLogout = () => {
		signOutMutation.mutate();
		router.push("/login");
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
			{/* Header */}
			<header className="bg-gradient-to-r from-orange-500 via-white to-green-600 shadow-lg border-b-4 border-amber-500 relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-r from-orange-500/90 via-white/95 to-green-600/90"></div>
				<div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-blue-100/50"></div>

				<div className="container mx-auto px-4 py-4 relative z-10">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<div className="w-16 h-16 flex items-center justify-center">
								<img
									src="/images/bharat-sarkar-logo.png"
									alt="Government of India Emblem"
									className="w-full h-full object-contain drop-shadow-lg"
								/>
							</div>
							<div className="w-16 h-16 flex items-center justify-center">
								<img
									src="/images/cg-logo.png"
									alt="Chhattisgarh Government Logo"
									className="w-full h-full object-contain drop-shadow-lg"
								/>
							</div>
							<div>
								<h1 className="text-xl font-bold text-blue-900 drop-shadow-md">
									ENTRY MANAGEMENT DASHBOARD
								</h1>
								<p className="text-sm text-red-700 font-medium drop-shadow-sm">
									PROJECT श्रेष्ठ | District Administration Raipur
								</p>
							</div>
						</div>

						<div className="flex items-center space-x-4">
							<Button
								onClick={() => router.push(`/${params.department}/users`)}
								variant="outline"
								size="sm"
								className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-white/90 shadow-md">
								<ArrowLeft className="w-4 h-4 mr-2" />
								Back to Users
							</Button>
							<Button
								onClick={() => router.push(`/${params.department}/template`)}
								variant="outline"
								size="sm"
								className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-white/90 shadow-md">
								<FileText className="w-4 h-4 mr-2" />
								Back to Templates
							</Button>
							<Button
								onClick={handleLogout}
								variant="outline"
								size="sm"
								className="border-red-300 text-red-700 hover:bg-red-50 bg-white/90 shadow-md">
								<LogOut className="w-4 h-4 mr-2" />
								Logout
							</Button>
						</div>
					</div>
				</div>
			</header>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Step-by-Step Workflow */}
				<div className="mb-8">
					<div className="bg-white rounded-lg shadow p-6">
						<h2 className="text-lg font-semibold mb-4">
							Create KPI Entry - Step {currentStep} of 7
						</h2>

						{/* Step Progress */}
						<div className="flex items-center justify-between mb-6">
							{Array.from({ length: 7 }, (_, i) => (
								<div key={i} className="flex items-center">
									<div
										className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
											i + 1 < currentStep
												? "bg-green-500 text-white"
												: i + 1 === currentStep
												? "bg-blue-500 text-white"
												: "bg-gray-200 text-gray-600"
										}`}>
										{i + 1}
									</div>
									{i < 6 && (
										<div
											className={`w-16 h-1 mx-2 ${
												i + 1 < currentStep ? "bg-green-500" : "bg-gray-200"
											}`}
										/>
									)}
								</div>
							))}
						</div>

						{/* Step Content */}
						<div className="min-h-[400px]">
							{/* Step 1: Choose Employee */}
							{currentStep === 1 && (
								<div>
									<h3 className="text-lg font-medium mb-4">
										Step 1: Choose Employee
									</h3>

									{/* Search and Filter Section */}
									<div className="bg-gray-50 p-4 rounded-lg mb-6">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<Label
													htmlFor="search-name"
													className="text-sm font-medium text-gray-700">
													Search by Name
												</Label>
												<div className="relative mt-1">
													<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
													<Input
														id="search-name"
														placeholder="Search employee name..."
														value={employeeNameSearch}
														onChange={(e) =>
															setEmployeeNameSearch(e.target.value)
														}
														className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
													/>
												</div>
											</div>
											<div>
												<Label
													htmlFor="search-role"
													className="text-sm font-medium text-gray-700">
													Search by Role
												</Label>
												<div className="relative mt-1">
													<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
													<Input
														id="search-role"
														placeholder="Search employee role..."
														value={employeeRoleSearch}
														onChange={(e) =>
															setEmployeeRoleSearch(e.target.value)
														}
														className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
													/>
												</div>
											</div>
										</div>
										<div className="flex justify-between items-center mt-4">
											<div className="text-sm text-gray-600">
												Showing {filteredEmployees.length} of{" "}
												{employeesData?.employees.length || 0} employees
											</div>
											<Button
												variant="outline"
												size="sm"
												onClick={() => {
													setEmployeeNameSearch("");
													setEmployeeRoleSearch("");
												}}
												className="text-gray-600 hover:text-gray-800">
												Clear Filters
											</Button>
										</div>
									</div>

									{employeesLoading ? (
										<div className="flex items-center justify-center py-8">
											<Loader2 className="w-6 h-6 animate-spin" />
										</div>
									) : (
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
											{filteredEmployees.map((employee: any) => (
												<Card
													key={employee._id}
													className="cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 border-l-4 border-blue-500 bg-gradient-to-br from-white to-blue-50"
													onClick={() => handleEmployeeSelect(employee._id)}>
													<CardContent className="p-6">
														<div className="flex items-start space-x-4">
															<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
																<Users className="w-6 h-6 text-blue-600" />
															</div>
															<div className="flex-1 min-w-0">
																<h4 className="font-semibold text-gray-900 text-lg mb-1 truncate">
																	{employee.name}
																</h4>
																{employee.departmentRole && (
																	<div className="mb-2">
																		<Badge className="bg-blue-100 text-blue-800 text-xs">
																			{employee.departmentRole}
																		</Badge>
																	</div>
																)}
																{employee.contact?.email && (
																	<div className="flex items-center space-x-2 mb-1">
																		<Mail className="w-3 h-3 text-gray-400" />
																		<p className="text-sm text-gray-600 truncate">
																			{employee.contact.email}
																		</p>
																	</div>
																)}
																{employee.contact?.phone && (
																	<div className="flex items-center space-x-2">
																		<Phone className="w-3 h-3 text-gray-400" />
																		<p className="text-sm text-gray-600">
																			{employee.contact.phone}
																		</p>
																	</div>
																)}
															</div>
														</div>
													</CardContent>
												</Card>
											))}
										</div>
									)}

									{filteredEmployees.length === 0 && !employeesLoading && (
										<div className="text-center py-8">
											<Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
											<h3 className="text-lg font-medium text-gray-900 mb-2">
												No employees found
											</h3>
											<p className="text-gray-600">
												Try adjusting your search criteria
											</p>
										</div>
									)}
								</div>
							)}

							{/* Step 2: Choose Template */}
							{currentStep === 2 && (
								<div>
									<h3 className="text-lg font-medium mb-4">
										Step 2: Choose Template
									</h3>
									<p className="text-sm text-gray-600 mb-4">
										Selected Employee: {getSelectedEmployeeName()}
									</p>
									{templatesLoading ? (
										<div className="flex items-center justify-center py-8">
											<Loader2 className="w-6 h-6 animate-spin" />
										</div>
									) : (
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
											{templatesData?.templates.map((template: any) => (
												<Card
													key={template._id}
													className="cursor-pointer hover:shadow-md transition-shadow"
													onClick={() => handleTemplateSelect(template._id)}>
													<CardContent className="p-4">
														<div className="flex items-center space-x-3">
															<FileText className="w-5 h-5 text-green-500" />
															<div>
																<h4 className="font-medium">{template.name}</h4>
																<p className="text-sm text-gray-500">
																	{template.description}
																</p>
																<div className="flex space-x-2 mt-2">
																	<Badge variant="outline">
																		{template.frequency}
																	</Badge>
																	<Badge variant="outline">
																		{template.role}
																	</Badge>
																</div>
															</div>
														</div>
													</CardContent>
												</Card>
											))}
										</div>
									)}
								</div>
							)}

							{/* Step 3: Choose Month and Year */}
							{currentStep === 3 && (
								<div>
									<h3 className="text-lg font-medium mb-4">
										Step 3: Choose Month and Year
									</h3>
									<p className="text-sm text-gray-600 mb-4">
										Employee: {getSelectedEmployeeName()} | Template:{" "}
										{getSelectedTemplateName()}
									</p>
									<div className="max-w-md space-y-4">
										<div>
											<Label htmlFor="month">Month</Label>
											<Select
												value={stepData.month.toString()}
												onValueChange={(value) =>
													setStepData((prev) => ({
														...prev,
														month: parseInt(value),
													}))
												}>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{Array.from({ length: 12 }, (_, i) => (
														<SelectItem key={i + 1} value={(i + 1).toString()}>
															{new Date(2024, i, 1).toLocaleDateString(
																"en-US",
																{ month: "long" }
															)}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div>
											<Label htmlFor="year">Year</Label>
											<Select
												value={stepData.year.toString()}
												onValueChange={(value) =>
													setStepData((prev) => ({
														...prev,
														year: parseInt(value),
													}))
												}>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{Array.from({ length: 10 }, (_, i) => {
														const year = new Date().getFullYear() - 2 + i;
														return (
															<SelectItem key={year} value={year.toString()}>
																{year}
															</SelectItem>
														);
													})}
												</SelectContent>
											</Select>
										</div>
										<Button onClick={nextStep} className="w-full">
											Continue
										</Button>
									</div>
								</div>
							)}

							{/* Step 4: Add KPI Names */}
							{currentStep === 4 && (
								<div>
									<h3 className="text-lg font-medium mb-4">
										Step 4: Add KPI Names
									</h3>
									<p className="text-sm text-gray-600 mb-4">
										{getSelectedEmployeeName()} | {getSelectedTemplateName()} |{" "}
										{stepData.month}/{stepData.year}
									</p>
									<div className="space-y-4">
										<div className="space-y-2">
											<Label className="text-sm font-medium">KPI Names</Label>
											{kpiNameInputs.map((kpi, index) => (
												<Card key={index}>
													<CardContent className="p-4">
														<div className="flex space-x-2">
															<Input
																placeholder="KPI Label (e.g., Task Completion Rate)"
																value={kpi.label}
																onChange={(e) =>
																	updateKpiNameInput(
																		index,
																		"label",
																		e.target.value
																	)
																}
																className="flex-1"
															/>
															<Input
																placeholder="KPI Value (optional)"
																value={kpi.value}
																onChange={(e) =>
																	updateKpiNameInput(
																		index,
																		"value",
																		e.target.value
																	)
																}
																className="flex-1"
															/>
															{kpiNameInputs.length > 1 && (
																<Button
																	variant="outline"
																	size="sm"
																	onClick={() => removeKpiNameInput(index)}>
																	<Trash2 className="w-4 h-4" />
																</Button>
															)}
														</div>
													</CardContent>
												</Card>
											))}
											<Button
												variant="outline"
												size="sm"
												onClick={addKpiNameInput}>
												<Plus className="w-4 h-4 mr-2" />
												Add KPI Name
											</Button>
										</div>
										<div className="flex space-x-4">
											<Button
												type="button"
												variant="outline"
												onClick={prevStep}>
												Back
											</Button>
											<Button onClick={handleKpiNamesSubmit} className="flex-1">
												Continue
											</Button>
										</div>
									</div>
								</div>
							)}

							{/* Step 5: Search KPI */}
							{currentStep === 5 && (
								<div>
									<h3 className="text-lg font-medium mb-4">
										Step 5: Search KPI
									</h3>
									<p className="text-sm text-gray-600 mb-4">
										{getSelectedEmployeeName()} | {getSelectedTemplateName()} |{" "}
										{stepData.month}/{stepData.year}
									</p>
									<div className="space-y-4">
										{searchLoading ? (
											<div className="text-center py-8">
												<Loader2 className="w-16 h-16 animate-spin text-blue-500 mx-auto mb-4" />
												<h4 className="text-lg font-medium mb-2">
													Searching for Existing Entries
												</h4>
												<p className="text-gray-600 mb-4">
													Searching for existing KPIs based on your criteria...
												</p>
											</div>
										) : (
											<div className="space-y-4">
												<div className="bg-gray-50 p-4 rounded-lg">
													<h4 className="text-lg font-medium mb-2">
														Search Criteria
													</h4>
													<div className="space-y-2 text-sm">
														<div>
															<strong>Employee:</strong>{" "}
															{getSelectedEmployeeName()}
														</div>
														<div>
															<strong>Template:</strong>{" "}
															{getSelectedTemplateName()}
														</div>
														<div>
															<strong>Period:</strong> {stepData.month}/
															{stepData.year}
														</div>
														<div>
															<strong>KPI Names:</strong>
														</div>
														<ul className="list-disc list-inside ml-4">
															{stepData.kpiNames
																.filter((kpi) => kpi.label.trim() !== "")
																.map((kpi, index) => (
																	<li key={index}>
																		{kpi.label}
																		{kpi.value && ` (${kpi.value})`}
																	</li>
																))}
														</ul>
													</div>
												</div>

												{(searchData as any)?.entries &&
												(searchData as any).entries.length > 0 ? (
													<div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
														<div className="flex items-center mb-2">
															<AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
															<h4 className="text-lg font-medium text-yellow-800">
																Existing Entries Found
															</h4>
														</div>
														<p className="text-yellow-700 mb-3">
															Found {(searchData as any)?.entries?.length || 0}{" "}
															existing entry(ies) for this criteria.
														</p>
														<div className="space-y-2">
															{(searchData as any)?.entries
																?.slice(0, 3)
																.map((entry: any, index: number) => (
																	<div
																		key={index}
																		className="bg-white p-3 rounded border">
																		<div className="flex justify-between items-center">
																			<span className="font-medium">
																				Entry #{index + 1}
																			</span>
																			<Badge
																				className={getStatusColor(
																					entry.status
																				)}>
																				{entry.status}
																			</Badge>
																		</div>
																		<div className="text-sm text-gray-600 mt-1">
																			Score: {entry.score || 0} | Created:{" "}
																			{formatDate(entry.createdAt)}
																		</div>
																		<div className="mt-3 flex space-x-2">
																			<Button
																				variant="outline"
																				size="sm"
																				onClick={() =>
																					handleEditExistingEntry(entry)
																				}>
																				<Edit className="w-4 h-4 mr-1" />
																				Edit Entry
																			</Button>
																		</div>
																	</div>
																))}
															{(searchData as any)?.entries?.length > 3 && (
																<div className="text-sm text-yellow-600">
																	... and{" "}
																	{(searchData as any)?.entries?.length - 3}{" "}
																	more entries
																</div>
															)}
														</div>
													</div>
												) : (
													<div className="bg-green-50 p-4 rounded-lg border border-green-200">
														<div className="flex items-center mb-2">
															<CheckCircle className="w-5 h-5 text-green-600 mr-2" />
															<h4 className="text-lg font-medium text-green-800">
																No Existing Entries Found
															</h4>
														</div>
														<p className="text-green-700">
															No existing entries found for this criteria. You
															can proceed to create a new entry.
														</p>
													</div>
												)}
											</div>
										)}

										<div className="flex space-x-4">
											<Button
												type="button"
												variant="outline"
												onClick={prevStep}>
												Back
											</Button>
											<Button onClick={handleSearchKpi} className="flex-1">
												Continue to Form
											</Button>
										</div>
									</div>
								</div>
							)}

							{/* Step 6: Generate Form */}
							{currentStep === 6 && (
								<div>
									{/* Header Section */}
									<div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-lg mb-6">
										<h3 className="text-xl font-bold mb-2">
											KPI Performance Assessment
										</h3>
										<p className="text-green-100">
											Complete your KPI assessment based on the template
											criteria.
										</p>
									</div>

									{/* Template Information */}
									<div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
										<div className="flex items-center justify-between mb-3">
											<h4 className="text-lg font-semibold text-gray-800">
												Template Information
											</h4>
											<Badge className="bg-blue-100 text-blue-800">
												{stepData.existingEntry ? "Edit Mode" : "Create Mode"}
											</Badge>
										</div>
										<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
											<div>
												<span className="font-medium text-gray-600">
													Template:
												</span>
												<p className="text-gray-800">
													{getSelectedTemplateName()}
												</p>
											</div>
											<div>
												<span className="font-medium text-gray-600">
													Employee:
												</span>
												<p className="text-gray-800">
													{getSelectedEmployeeName()}
												</p>
											</div>
											<div>
												<span className="font-medium text-gray-600">
													Period:
												</span>
												<p className="text-gray-800">
													{stepData.month}/{stepData.year}
												</p>
											</div>
										</div>
									</div>
									<form
										onSubmit={(e) => {
											e.preventDefault();
											const formData = new FormData(
												e.target as HTMLFormElement
											);

											const values: KpiValue[] = stepData.values.map(
												(value, index) => {
													// Check if this KPI has subKpis
													const hasSubKpis =
														value.subKpis && value.subKpis.length > 0;

													if (hasSubKpis) {
														// For KPIs with subKpis, collect subKpi values
														return {
															key: value.key,
															value: 0, // Will be calculated by backend
															subKpis: value.subKpis.map(
																(subKpi, subIndex) => ({
																	key: subKpi.key,
																	value:
																		Number(
																			formData.get(
																				`subkpi_${index}_${subIndex}`
																			)
																		) || 0,
																})
															),
														};
													} else {
														// For KPIs without subKpis, use direct value
														return {
															key: value.key,
															value:
																Number(formData.get(`value_${index}`)) || 0,
															subKpis: [],
														};
													}
												}
											);

											// Only use the KPI names that were entered in Step 4
											const kpiNames: KpiName[] = stepData.kpiNames.filter(
												(kpi) => kpi.label.trim() !== ""
											);

											if (stepData.existingEntry) {
												// Update existing entry
												const updateData: UpdateEntryData = {
													values,
													kpiNames,
													status: "inprogress",
												};

												console.log("Updating entry with data:", updateData);

												updateEntryMutation.mutate(
													{ id: stepData.existingEntry._id, data: updateData },
													{
														onSuccess: () => {
															setStepData({
																employeeId: "",
																templateId: "",
																month: new Date().getMonth() + 1,
																year: new Date().getFullYear(),
																kpiNames: [],
																values: [],
																existingEntry: undefined,
															});
															setCurrentStep(7);
															refetchEntries();
														},
													}
												);
											} else {
												// Create new entry
												const createData: CreateEntryData = {
													employeeId: stepData.employeeId,
													templateId: stepData.templateId,
													month: stepData.month,
													year: stepData.year,
													kpiNames,
													values,
													status: "initiated",
													dataSource: "manual",
												};

												console.log("Creating entry with data:", createData);

												createEntryMutation.mutate(createData, {
													onSuccess: () => {
														setStepData({
															employeeId: "",
															templateId: "",
															month: new Date().getMonth() + 1,
															year: new Date().getFullYear(),
															kpiNames: [],
															values: [],
															existingEntry: undefined,
														});
														setCurrentStep(7);
														refetchEntries();
													},
												});
											}
										}}
										className="space-y-6">
										{templateData?.template.template.map(
											(kpi: KpiTemplate, index: number) => (
												<Card
													key={index}
													className="bg-white shadow-md border-l-4 border-green-500">
													<CardHeader className="pb-3">
														<div className="flex items-center justify-between">
															<div className="flex-1">
																<CardTitle className="text-lg text-gray-800">
																	{kpi.name}
																</CardTitle>
																<p className="text-sm text-gray-600 mt-1">
																	Max Marks: {kpi.maxMarks} | Type:{" "}
																	{kpi.kpiType}
																</p>
															</div>
															<div className="text-right">
																<div className="text-2xl font-bold text-green-600">
																	{Math.round(
																		((progressValues[index] ||
																			stepData.existingEntry?.values?.[index]
																				?.value ||
																			0) /
																			100) *
																			kpi.maxMarks
																	)}
																	/{kpi.maxMarks}
																</div>
																<div className="text-xs text-gray-500">
																	Score
																</div>
															</div>
														</div>
													</CardHeader>
													<CardContent className="space-y-4 pb-4">
														{kpi.subKpis && kpi.subKpis.length > 0 ? (
															<div>
																<Label className="text-sm font-medium text-gray-700 mb-2 block">
																	Sub-KPIs Performance
																</Label>
																<div className="grid grid-cols-2 gap-4">
																	{kpi.subKpis.map(
																		(subKpi: any, subIndex: number) => (
																			<div key={subIndex} className="space-y-2">
																				<Label
																					htmlFor={`subkpi_${index}_${subIndex}`}
																					className="text-sm font-medium text-gray-600">
																					{subKpi.name}
																				</Label>
																				<Input
																					id={`subkpi_${index}_${subIndex}`}
																					name={`subkpi_${index}_${subIndex}`}
																					type="number"
																					min="0"
																					className="border-gray-300 focus:border-green-500 focus:ring-green-500"
																					defaultValue={
																						stepData.existingEntry?.values?.[
																							index
																						]?.subKpis?.[subIndex]?.value || 0
																					}
																					required
																				/>
																			</div>
																		)
																	)}
																</div>
															</div>
														) : (
															<div className="space-y-3">
																<Label
																	htmlFor={`value_${index}`}
																	className="text-sm font-medium text-gray-700">
																	Performance Level [%]
																</Label>
																<Input
																	id={`value_${index}`}
																	name={`value_${index}`}
																	type="number"
																	min="0"
																	max="100"
																	className="border-gray-300 focus:border-green-500 focus:ring-green-500"
																	defaultValue={
																		stepData.existingEntry?.values?.[index]
																			?.value || 0
																	}
																	onChange={(e) =>
																		handleProgressUpdate(
																			index,
																			Number(e.target.value) || 0
																		)
																	}
																	required
																/>
																{/* Progress Bar */}
																<div className="w-full bg-gray-200 rounded-full h-2">
																	<div
																		className="bg-green-500 h-2 rounded-full transition-all duration-300"
																		style={{
																			width: `${
																				progressValues[index] ||
																				stepData.existingEntry?.values?.[index]
																					?.value ||
																				0
																			}%`,
																		}}></div>
																</div>
																<div className="flex justify-between text-xs text-gray-500">
																	<span>0%</span>
																	<span>100%</span>
																</div>
															</div>
														)}

														{/* Action Buttons */}
													</CardContent>
												</Card>
											)
										)}
										{/* Overall Performance Summary */}
										<div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200 mt-6">
											<div className="flex items-center justify-between">
												<div className="flex items-center space-x-4">
													<div className="text-center">
														<div className="text-2xl font-bold text-green-800">
															{templateData?.template.template.reduce(
																(sum: number, kpi: any, index: number) => {
																	const value =
																		progressValues[index] ||
																		stepData.existingEntry?.values?.[index]
																			?.value ||
																		0;
																	return (
																		sum +
																		Math.round((value / 100) * kpi.maxMarks)
																	);
																},
																0
															) || 0}
														</div>
														<div className="text-sm text-green-600">
															Total Score
														</div>
													</div>
													<div className="text-center">
														<div className="text-2xl font-bold text-blue-800">
															{templateData?.template.template.reduce(
																(sum, kpi) => sum + kpi.maxMarks,
																0
															) || 0}
														</div>
														<div className="text-sm text-blue-600">
															Maximum Score
														</div>
													</div>
													<div className="text-center">
														<div className="text-2xl font-bold text-purple-800">
															{templateData?.template.template.length || 0}
														</div>
														<div className="text-sm text-purple-600">
															Total KPIs
														</div>
													</div>
												</div>
												<div className="flex space-x-3">
													<Button
														type="button"
														variant="outline"
														onClick={prevStep}
														className="border-gray-300 text-gray-700 hover:bg-gray-50">
														<ArrowLeft className="w-4 h-4 mr-2" />
														Back
													</Button>
													<Button
														type="submit"
														className="bg-green-600 hover:bg-green-700 text-white px-6">
														{stepData.existingEntry
															? "Update KPI Entry"
															: "Submit KPI Entry"}
													</Button>
												</div>
											</div>
										</div>
									</form>
								</div>
							)}

							{/* Step 7: Success */}
							{currentStep === 7 && (
								<div className="text-center py-8">
									<CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
									<h4 className="text-lg font-medium mb-2">
										Entry {stepData.existingEntry ? "Updated" : "Created"}{" "}
										Successfully!
									</h4>
									<p className="text-gray-600 mb-4">
										The KPI entry has been{" "}
										{stepData.existingEntry ? "updated" : "created"}{" "}
										successfully.
									</p>
									<Button
										onClick={() => {
											setCurrentStep(1);
											setStepData({
												employeeId: "",
												templateId: "",
												month: new Date().getMonth() + 1,
												year: new Date().getFullYear(),
												kpiNames: [],
												values: [],
											});
											setKpiNameInputs([{ label: "", value: "" }]);
										}}>
										Create Another Entry
									</Button>
								</div>
							)}
						</div>

						{/* Navigation */}
						{currentStep < 7 && (
							<div className="flex justify-between pt-6 border-t">
								<Button
									variant="outline"
									onClick={prevStep}
									disabled={currentStep === 1}>
									<ChevronLeft className="w-4 h-4 mr-2" />
									Previous
								</Button>
								<div className="flex space-x-2">
									{Array.from({ length: 6 }, (_, i) => (
										<Button
											key={i}
											variant={i + 1 === currentStep ? "default" : "outline"}
											size="sm"
											onClick={() => goToStep(i + 1)}>
											{i + 1}
										</Button>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
