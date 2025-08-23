"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	LogOut,
	Plus,
	Search,
	Filter,
	Edit,
	Trash2,
	FileText,
	Calendar,
	CheckCircle,
	XCircle,
	ArrowLeft,
	Loader2,
	Clock,
	Users,
	History,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import {
	useListTemplates,
	useCreateTemplate,
	useUpdateTemplate,
	useDeleteTemplate,
	useGetTemplateVersions,
	CreateTemplateData,
	UpdateTemplateData,
	KpiTemplate,
	SubKpi,
} from "@/queries/templates";
import { useSession, useSignOut } from "@/queries";
import { useListDepartments } from "@/queries/departments";
import { z } from "zod";

const kpitemplateZodSchema = z.object({
	name: z.string().nonempty("Name is required"),
	description: z.string().nonempty("Description is required"),
	role: z.string().nonempty("Role is required"),
	frequency: z.enum(["daily", "weekly", "monthly", "quarterly"]),
	departmentSlug: z.string().nonempty("Department slug is required"),
	kpiName: z.string().nonempty("KPI name is required"),
	template: z
		.array(
			z.object({
				name: z.string().nonempty("KPI name is required"),
				description: z.string().nonempty("KPI description is required"),
				maxMarks: z.number().int().min(0, "maxMarks must be non-negative"),
				kpiType: z.literal("percentage"),
				kpiUnit: z.literal("%"),
				subKpis: z
					.array(
						z.object({
							name: z.string().nonempty("Sub-KPI name is required"),
							key: z.string().nonempty("Sub-KPI key is required"),
							value_type: z.literal("number"),
						})
					)
					.default([])
					.optional(),
			})
		)
		.min(2, "At least 2 KPIs required")
		.refine(
			(templates) =>
				new Set(templates.map((t) => t.name)).size === templates.length,
			"Template KPI names must be unique"
		),
	createdBy: z.string(),
	updatedBy: z.string(),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
});

export default function TemplateManagementPage() {
	const params = useParams();
	const router = useRouter();
	const [showCreateTemplate, setShowCreateTemplate] = React.useState(false);
	const [showEditTemplate, setShowEditTemplate] = React.useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
	const [showVersions, setShowVersions] = React.useState(false);
	const [selectedTemplate, setSelectedTemplate] = React.useState<any>(null);
	const [searchValue, setSearchValue] = React.useState("");
	const [frequencyFilter, setFrequencyFilter] = React.useState("All");
	const [roleFilter, setRoleFilter] = React.useState("All");
	const [debouncedRoleFilter, setDebouncedRoleFilter] = React.useState("All");
	const [kpiCount, setKpiCount] = React.useState(1);
	const [subKpiCounts, setSubKpiCounts] = React.useState<{
		[key: number]: number;
	}>({ 0: 2 });

	// State for edit template KPIs
	const [editKpiCount, setEditKpiCount] = React.useState(1);
	const [editSubKpiCounts, setEditSubKpiCounts] = React.useState<{
		[key: number]: number;
	}>({ 0: 2 });

	// State to track KPI type for each KPI (create form)
	const [kpiTypes, setKpiTypes] = React.useState<{ [key: number]: string }>({});

	// State to track KPI type for each KPI (edit form)
	const [editKpiTypes, setEditKpiTypes] = React.useState<{
		[key: number]: string;
	}>({});

	// API hooks
	const {
		data: templatesData,
		isLoading,
		error,
	} = useListTemplates({
		page: 1,
		limit: 10,
		search: searchValue || undefined,
		departmentSlug: params.department as string,
		frequency: frequencyFilter !== "All" ? (frequencyFilter as any) : undefined,
		role: debouncedRoleFilter !== "All" ? debouncedRoleFilter : undefined,
	});

	const { data: session } = useSession();
	const signOutMutation = useSignOut();
	const createTemplateMutation = useCreateTemplate();
	const updateTemplateMutation = useUpdateTemplate();
	const deleteTemplateMutation = useDeleteTemplate();
	const { data: versionsData } = useGetTemplateVersions(selectedTemplate?._id);
	const { data: departmentsData } = useListDepartments();

	const templates = templatesData?.docs || [];
	const versions = versionsData?.versions || [];

	// Debounce role filter to reduce API calls
	React.useEffect(() => {
		const timeout = setTimeout(() => {
			setDebouncedRoleFilter(roleFilter);
		}, 500);

		return () => clearTimeout(timeout);
	}, [roleFilter]);

	const handleCreateTemplate = (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const formData = new FormData(e.target as HTMLFormElement);

			// Parse multiple KPIs from form data
			const templateArray: KpiTemplate[] = [];

			for (let i = 0; i < kpiCount; i++) {
				const kpiType = formData.get(`kpi_${i}_type`) as string;
				const subKpis: SubKpi[] = [];

				if (kpiType === "subkpis") {
					const subKpiCount = subKpiCounts[i] || 2;
					for (let j = 0; j < subKpiCount; j++) {
						const subKpiName = formData.get(
							`kpi_${i}_subkpi_${j}_name`
						) as string;
						const subKpiKey = formData.get(
							`kpi_${i}_subkpi_${j}_key`
						) as string;

						if (subKpiName && subKpiKey) {
							subKpis.push({
								name: subKpiName,
								key: subKpiKey,
								value_type: "number",
							});
						}
					}
				}

				const kpi: KpiTemplate = {
					name: formData.get(`kpi_${i}_name`) as string,
					description: formData.get(`kpi_${i}_description`) as string,
					maxMarks:
						parseInt(formData.get(`kpi_${i}_maxMarks`) as string) || 100,
					kpiType: "percentage",
					kpiUnit: "%",
					isDynamic: false,
					subKpis: [],
				};
				templateArray.push(kpi);
			}

			const createData = {
				name: formData.get("name") as string,
				description: formData.get("description") as string,
				role: formData.get("role") as string,
				frequency: "monthly",
				kpiName: formData.get("kpiName") as string,
				departmentSlug: params.department as string,
				template: templateArray,
				createdBy: session?.user?.id || "unknown",
				updatedBy: session?.user?.id || "unknown",
			};

			// Validate data using Zod schema
			const validatedData = kpitemplateZodSchema.parse(createData);

			createTemplateMutation.mutate(validatedData as CreateTemplateData, {
				onSuccess: () => {
					setShowCreateTemplate(false);
					const form = e.target as HTMLFormElement;
					form.reset();
				},
				onError: (error: any) => {
					console.error("Template creation failed:", error);

					// Handle API errors gracefully
					let errorMessage = "Failed to create template. ";

					if (error?.response?.data?.message) {
						errorMessage += error.response.data.message;
					} else if (error?.message) {
						errorMessage += error.message;
					} else {
						errorMessage += "Please try again.";
					}

					alert(errorMessage);
				},
			});
		} catch (error: any) {
			console.error("Template creation error:", error);

			// Handle all errors gracefully (including Zod validation)
			let errorMessage = "Please check the form data. ";

			if (error?.errors && Array.isArray(error.errors)) {
				// Zod validation error
				const errorDetails = error.errors
					.map((err: any) => {
						const fieldPath = err.path.join(".");
						return `${fieldPath}: ${err.message}`;
					})
					.join(", ");
				errorMessage += errorDetails;
			} else if (error?.message) {
				errorMessage += error.message;
			} else {
				errorMessage += "Validation failed. Please check all required fields.";
			}

			// Show user-friendly error message
			alert(errorMessage);
		}
	};

	const handleEditTemplate = (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const formData = new FormData(e.target as HTMLFormElement);

			// Parse multiple KPIs from form data for editing
			const templateArray: KpiTemplate[] = [];

			for (let i = 0; i < editKpiCount; i++) {
				const kpiType = formData.get(`edit_kpi_${i}_type`) as string;
				const subKpis: SubKpi[] = [];

				if (kpiType === "subkpis") {
					const subKpiCount = editSubKpiCounts[i] || 2;
					for (let j = 0; j < subKpiCount; j++) {
						const subKpiName = formData.get(
							`edit_kpi_${i}_subkpi_${j}_name`
						) as string;
						const subKpiKey = formData.get(
							`edit_kpi_${i}_subkpi_${j}_key`
						) as string;

						if (subKpiName && subKpiKey) {
							subKpis.push({
								name: subKpiName,
								key: subKpiKey,
								value_type: "number",
							});
						}
					}
				}

				const kpi: KpiTemplate = {
					name: formData.get(`edit_kpi_${i}_name`) as string,
					description: formData.get(`edit_kpi_${i}_description`) as string,
					maxMarks:
						parseInt(formData.get(`edit_kpi_${i}_maxMarks`) as string) || 100,
					kpiType: "percentage",
					kpiUnit: "%",
					isDynamic: false,
					subKpis: [],
				};
				templateArray.push(kpi);
			}

			const updateData = {
				name: formData.get("name") as string,
				description: formData.get("description") as string,
				role: formData.get("role") as string,
				frequency: "monthly",
				kpiName: formData.get("kpiName") as string,
				departmentSlug: params.department as string,
				template: templateArray,
				updatedBy: session?.user?.id || "unknown",
			};

			// Validate data using Zod schema (excluding required fields that are already set)
			// Create a partial validation schema for updates
			const updateValidationSchema = kpitemplateZodSchema.partial().pick({
				name: true,
				description: true,
				role: true,
				frequency: true,
				template: true,
				updatedBy: true,
			});

			const validatedData = updateValidationSchema.parse(updateData);

			updateTemplateMutation.mutate(
				{ id: selectedTemplate._id, data: validatedData as UpdateTemplateData },
				{
					onSuccess: () => {
						setShowEditTemplate(false);
						setSelectedTemplate(null);
					},
					onError: (error: any) => {
						console.error("Template update failed:", error);

						// Handle API errors gracefully
						let errorMessage = "Failed to update template. ";

						if (error?.response?.data?.message) {
							errorMessage += error.response.data.message;
						} else if (error?.message) {
							errorMessage += error.message;
						} else {
							errorMessage += "Please try again.";
						}

						alert(errorMessage);
					},
				}
			);
		} catch (error: any) {
			console.error("Template update error:", error);

			// Handle all errors gracefully (including Zod validation)
			let errorMessage = "Please check the form data. ";

			if (error?.errors && Array.isArray(error.errors)) {
				// Zod validation error
				const errorDetails = error.errors
					.map((err: any) => {
						const fieldPath = err.path.join(".");
						return `${fieldPath}: ${err.message}`;
					})
					.join(", ");
				errorMessage += errorDetails;
			} else if (error?.message) {
				errorMessage += error.message;
			} else {
				errorMessage += "Validation failed. Please check all required fields.";
			}

			// Show user-friendly error message
			alert(errorMessage);
		}
	};

	const handleDeleteTemplate = () => {
		deleteTemplateMutation.mutate(selectedTemplate._id, {
			onSuccess: () => {
				setShowDeleteConfirm(false);
				setSelectedTemplate(null);
			},
			onError: (error: any) => {
				console.error("Template deletion failed:", error);

				// Handle API errors gracefully
				let errorMessage = "Failed to delete template. ";

				if (error?.response?.data?.message) {
					errorMessage += error.response.data.message;
				} else if (error?.message) {
					errorMessage += error.message;
				} else {
					errorMessage += "Please try again.";
				}

				alert(errorMessage);
			},
		});
	};

	const handleLogout = () => {
		signOutMutation.mutate();
		router.push("/login");
	};

	const getFrequencyColor = (frequency: string) => {
		switch (frequency) {
			case "daily":
				return "bg-green-100 text-green-800";
			case "weekly":
				return "bg-blue-100 text-blue-800";
			case "monthly":
				return "bg-purple-100 text-purple-800";
			case "quarterly":
				return "bg-orange-100 text-orange-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getRoleColor = (role: string) => {
		switch (role) {
			case "manager":
				return "bg-red-100 text-red-800";
			case "sdm":
				return "bg-emerald-100 text-emerald-800";
			case "tehsildar":
				return "bg-amber-100 text-amber-800";
			case "patwari":
				return "bg-indigo-100 text-indigo-800";
			case "ri":
				return "bg-orange-100 text-orange-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const formatFrequency = (frequency: string) => {
		return frequency.charAt(0).toUpperCase() + frequency.slice(1);
	};

	const formatRole = (role: string) => {
		return role.charAt(0).toUpperCase() + role.slice(1);
	};

	const frequencies = ["daily", "weekly", "monthly", "quarterly"];
	const roles = ["manager", "sdm", "tehsildar", "patwari", "ri"];

	// Helper functions for managing KPIs and sub-KPIs
	const addKpi = () => {
		const newKpiIndex = kpiCount;
		setKpiCount((prev) => prev + 1);
		setSubKpiCounts((prev) => ({ ...prev, [newKpiIndex]: 2 }));
		setKpiTypes((prev) => ({ ...prev, [newKpiIndex]: "subkpis" }));
	};

	const removeKpi = (index: number) => {
		if (kpiCount > 1) {
			setKpiCount((prev) => prev - 1);
			const newSubKpiCounts = { ...subKpiCounts };
			const newKpiTypes = { ...kpiTypes };
			delete newSubKpiCounts[index];
			delete newKpiTypes[index];
			// Reindex the remaining KPIs
			const reindexedSubKpis: { [key: number]: number } = {};
			const reindexedTypes: { [key: number]: string } = {};
			Object.keys(newSubKpiCounts).forEach((key, newIndex) => {
				const oldIndex = parseInt(key);
				reindexedSubKpis[newIndex] = newSubKpiCounts[oldIndex];
				reindexedTypes[newIndex] = newKpiTypes[oldIndex];
			});
			setSubKpiCounts(reindexedSubKpis);
			setKpiTypes(reindexedTypes);
		}
	};

	const addSubKpi = (kpiIndex: number) => {
		setSubKpiCounts((prev) => ({
			...prev,
			[kpiIndex]: (prev[kpiIndex] || 2) + 1,
		}));
	};

	const removeSubKpi = (kpiIndex: number, subKpiIndex: number) => {
		const currentCount = subKpiCounts[kpiIndex] || 2;
		if (currentCount > 1) {
			setSubKpiCounts((prev) => ({
				...prev,
				[kpiIndex]: currentCount - 1,
			}));
		}
	};

	// Helper functions for managing edit KPIs and sub-KPIs
	const addEditKpi = () => {
		const newKpiIndex = editKpiCount;
		setEditKpiCount((prev) => prev + 1);
		setEditSubKpiCounts((prev) => ({ ...prev, [newKpiIndex]: 2 }));
		setEditKpiTypes((prev) => ({ ...prev, [newKpiIndex]: "subkpis" }));
	};

	// Function to toggle sub-KPI visibility based on KPI type
	const toggleSubKpiVisibility = (
		kpiIndex: number,
		type: string,
		isEdit: boolean = false
	) => {
		if (isEdit) {
			setEditKpiTypes((prev) => ({ ...prev, [kpiIndex]: type }));
		} else {
			setKpiTypes((prev) => ({ ...prev, [kpiIndex]: type }));
		}
	};

	// Initialize KPI types when edit modal opens
	React.useEffect(() => {
		if (showEditTemplate && selectedTemplate) {
			const newEditKpiTypes: { [key: number]: string } = {};
			selectedTemplate.template?.forEach((kpi: KpiTemplate, index: number) => {
				const hasSubKpis = kpi.subKpis && kpi.subKpis.length > 0;
				newEditKpiTypes[index] = hasSubKpis ? "subkpis" : "direct";
			});
			setEditKpiTypes(newEditKpiTypes);
		}
	}, [showEditTemplate, selectedTemplate]);

	// Initialize KPI types when create modal opens
	React.useEffect(() => {
		if (showCreateTemplate) {
			// Set default type for new KPIs
			const newKpiTypes: { [key: number]: string } = {};
			for (let i = 0; i < kpiCount; i++) {
				newKpiTypes[i] = "subkpis";
			}
			setKpiTypes(newKpiTypes);
		}
	}, [showCreateTemplate, kpiCount]);

	// Reset state when modals are closed
	React.useEffect(() => {
		if (!showCreateTemplate) {
			setKpiCount(1);
			setSubKpiCounts({ 0: 2 });
			setKpiTypes({ 0: "subkpis" });
		}
	}, [showCreateTemplate]);

	React.useEffect(() => {
		if (!showEditTemplate) {
			setEditKpiCount(1);
			setEditSubKpiCounts({ 0: 2 });
			setEditKpiTypes({ 0: "subkpis" });
		}
	}, [showEditTemplate]);

	const removeEditKpi = (index: number) => {
		if (editKpiCount > 1) {
			setEditKpiCount((prev) => prev - 1);
			const newSubKpiCounts = { ...editSubKpiCounts };
			const newKpiTypes = { ...editKpiTypes };
			delete newSubKpiCounts[index];
			delete newKpiTypes[index];
			// Reindex the remaining KPIs
			const reindexedSubKpis: { [key: number]: number } = {};
			const reindexedTypes: { [key: number]: string } = {};
			Object.keys(newSubKpiCounts).forEach((key, newIndex) => {
				const oldIndex = parseInt(key);
				reindexedSubKpis[newIndex] = newSubKpiCounts[oldIndex];
				reindexedTypes[newIndex] = newKpiTypes[oldIndex];
			});
			setEditSubKpiCounts(reindexedSubKpis);
			setEditKpiTypes(reindexedTypes);
		}
	};

	const addEditSubKpi = (kpiIndex: number) => {
		setEditSubKpiCounts((prev) => ({
			...prev,
			[kpiIndex]: (prev[kpiIndex] || 2) + 1,
		}));
	};

	const removeEditSubKpi = (kpiIndex: number, subKpiIndex: number) => {
		const currentCount = editSubKpiCounts[kpiIndex] || 2;
		if (currentCount > 1) {
			setEditSubKpiCounts((prev) => ({
				...prev,
				[kpiIndex]: currentCount - 1,
			}));
		}
	};

	const debounce = (func: (...args: any[]) => void, delay: number) => {
		let timeout: NodeJS.Timeout;
		return (...args: any[]) => {
			clearTimeout(timeout);
			timeout = setTimeout(() => func(...args), delay);
		};
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
									TEMPLATE MANAGEMENT DASHBOARD
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
								onClick={() => router.push(`/${params.department}/entry`)}
								variant="outline"
								size="sm"
								className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-white/90 shadow-md">
								<FileText className="w-4 h-4 mr-2" />
								Back to Entries
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

			{/* Main Content */}
			<div className="container mx-auto px-4 py-8">
				{/* Page Header */}
				<div className="mb-8">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-3xl font-bold text-slate-800 mb-2">
								📋 Template Management
							</h2>
							<p className="text-slate-600">
								Manage KPI templates for {params.department} department
							</p>
						</div>
						<Dialog
							open={showCreateTemplate}
							onOpenChange={setShowCreateTemplate}>
							<DialogTrigger asChild>
								<Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
									<Plus className="w-4 h-4 mr-2" />
									Create New Template
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-2xl overflow-y-auto max-h-[80vh]">
								<DialogHeader>
									<DialogTitle>Create New Template</DialogTitle>
								</DialogHeader>
								<form onSubmit={handleCreateTemplate} className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="name">Template Name</Label>
											<Input
												name="name"
												placeholder="Enter template name"
												required
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="role">Post</Label>
											<Input name="role" placeholder="Enter post" required />
										</div>
										<div className="space-y-2">
											<Label htmlFor="departmentSlug">Department</Label>
											<Select
												name="departmentSlug"
												disabled
												value={session?.user.department}>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Select department" />
												</SelectTrigger>
												<SelectContent>
													{departmentsData?.docs.map((dept) => (
														<SelectItem key={dept._id} value={dept.slug}>
															{dept.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-2">
											<Label htmlFor="kpiName">KPI Name</Label>
											<Input
												name="kpiName"
												placeholder="Enter KPI name"
												required
											/>
										</div>
										<div className="space-y-2 col-span-2">
											<Label htmlFor="description">Description</Label>
											<Input
												name="description"
												placeholder="Enter description"
												required
											/>
										</div>
									</div>

									{/* KPI Templates */}
									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<Label>KPI Templates</Label>
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={addKpi}
												className="text-emerald-600 hover:text-emerald-700">
												<Plus className="w-4 h-4 mr-1" />
												Add KPI
											</Button>
										</div>

										{Array.from({ length: kpiCount }, (_, kpiIndex) => (
											<div
												key={kpiIndex}
												className="border rounded-lg p-4 space-y-4">
												<div className="flex items-center justify-between">
													<h4 className="font-medium text-slate-700">
														KPI {kpiIndex + 1}
													</h4>
													{kpiCount > 1 && (
														<Button
															type="button"
															variant="outline"
															size="sm"
															onClick={() => removeKpi(kpiIndex)}
															className="text-red-600 hover:text-red-700">
															<Trash2 className="w-4 h-4" />
														</Button>
													)}
												</div>

												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<div className="space-y-2">
														<Label htmlFor={`kpi_${kpiIndex}_name`}>
															KPI Name
														</Label>
														<Input
															name={`kpi_${kpiIndex}_name`}
															placeholder="Enter KPI name"
															required
														/>
													</div>
													<div className="space-y-2">
														<Label htmlFor={`kpi_${kpiIndex}_maxMarks`}>
															Max Marks
														</Label>
														<Input
															name={`kpi_${kpiIndex}_maxMarks`}
															type="number"
															defaultValue="100"
															required
														/>
													</div>
												</div>
												<div className="space-y-2">
													<Label htmlFor={`kpi_${kpiIndex}_description`}>
														KPI Description
													</Label>
													<Input
														name={`kpi_${kpiIndex}_description`}
														placeholder="Enter KPI description"
														required
													/>
												</div>

												{/* KPI Type Selection */}
												<div className="space-y-2 hidden">
													<Label htmlFor={`kpi_${kpiIndex}_type`}>
														KPI Input Type
													</Label>
													<Select
														name={`kpi_${kpiIndex}_type`}
														value={kpiTypes[kpiIndex] || "direct"}
														onValueChange={(value) =>
															toggleSubKpiVisibility(kpiIndex, value, false)
														}>
														<SelectTrigger className="w-full">
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="subkpis">
																Sub-KPIs (Calculate from sub-values)
															</SelectItem>
															<SelectItem value="direct">
																Direct Value (Single input)
															</SelectItem>
														</SelectContent>
													</Select>
												</div>

												{/* Sub-KPIs - Only show if type is subkpis */}
												{/* {(kpiTypes[kpiIndex] || "subkpis") === "subkpis" && (
													<div className="space-y-3">
														<div className="flex items-center justify-between">
															<Label className="text-sm font-medium">
																Sub-KPIs
															</Label>
															<Button
																type="button"
																variant="outline"
																size="sm"
																onClick={() => addSubKpi(kpiIndex)}
																className="text-blue-600 hover:text-blue-700">
																<Plus className="w-3 h-3 mr-1" />
																Add Sub-KPI
															</Button>
														</div>

														{Array.from(
															{ length: subKpiCounts[kpiIndex] || 2 },
															(_, subKpiIndex) => (
																<div
																	key={subKpiIndex}
																	className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg">
																	<div className="flex-1 grid grid-cols-2 gap-2">
																		<div>
																			<Label
																				htmlFor={`kpi_${kpiIndex}_subkpi_${subKpiIndex}_name`}
																				className="text-xs">
																				Name
																			</Label>
																			<Input
																				name={`kpi_${kpiIndex}_subkpi_${subKpiIndex}_name`}
																				placeholder="e.g., दर्ज"
																				className="text-sm"
																				defaultValue={
																					subKpiIndex === 0
																						? "दर्ज"
																						: subKpiIndex === 1
																						? "निराकृत"
																						: ""
																				}
																				required
																			/>
																		</div>
																		<div>
																			<Label
																				htmlFor={`kpi_${kpiIndex}_subkpi_${subKpiIndex}_key`}
																				className="text-xs">
																				Key
																			</Label>
																			<Input
																				name={`kpi_${kpiIndex}_subkpi_${subKpiIndex}_key`}
																				placeholder="e.g., darj"
																				className="text-sm"
																				defaultValue={
																					subKpiIndex === 0
																						? "darj"
																						: subKpiIndex === 1
																						? "nirakrit"
																						: ""
																				}
																				required
																			/>
																		</div>
																	</div>
																	{(subKpiCounts[kpiIndex] || 2) > 0 && (
																		<div className="flex flex-col items-end justify-end">
																			<Label
																				htmlFor={`kpi_${kpiIndex}_subkpi_${subKpiIndex}_key`}
																				className="text-xs opacity-0">
																				R
																			</Label>
																			<Button
																				type="button"
																				variant="outline"
																				onClick={() =>
																					removeSubKpi(kpiIndex, subKpiIndex)
																				}
																				className="text-red-600 hover:text-red-700">
																				<Trash2 className="w-4 h-4" />
																			</Button>
																		</div>
																	)}
																</div>
															)
														)}
													</div>
												)} */}
											</div>
										))}
									</div>

									<div className="flex justify-end space-x-2">
										<Button
											type="button"
											variant="outline"
											onClick={() => setShowCreateTemplate(false)}>
											Cancel
										</Button>
										<Button
											type="submit"
											disabled={createTemplateMutation.isPending}>
											{createTemplateMutation.isPending ? (
												<>
													<Loader2 className="w-4 h-4 mr-2 animate-spin" />
													Creating...
												</>
											) : (
												"Create Template"
											)}
										</Button>
									</div>
								</form>
							</DialogContent>
						</Dialog>
					</div>
				</div>

				{/* Statistics Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
					<Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-l-4 border-emerald-600">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-emerald-700">Total Templates</p>
									<p className="text-2xl font-bold text-emerald-800">
										{templatesData?.total || 0}
									</p>
								</div>
								<FileText className="w-8 h-8 text-emerald-600" />
							</div>
						</CardContent>
					</Card>

					<Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-600">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-blue-700">Active Templates</p>
									<p className="text-2xl font-bold text-blue-800">
										{templates.length}
									</p>
								</div>
								<CheckCircle className="w-8 h-8 text-blue-600" />
							</div>
						</CardContent>
					</Card>

					<Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-600">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-purple-700">Frequencies</p>
									<p className="text-2xl font-bold text-purple-800">
										{new Set(templates.map((t: any) => t.frequency)).size}
									</p>
								</div>
								<Clock className="w-8 h-8 text-purple-600" />
							</div>
						</CardContent>
					</Card>

					<Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-l-4 border-amber-600">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-amber-700">Roles</p>
									<p className="text-2xl font-bold text-amber-800">
										{new Set(templates.map((t: any) => t.role)).size}
									</p>
								</div>
								<Users className="w-8 h-8 text-amber-600" />
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Filters and Search */}
				<Card className="mb-6 bg-white/95 backdrop-blur-sm shadow-lg border-l-4 border-slate-600">
					<CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
						<CardTitle className="text-lg flex items-center space-x-2">
							<Filter className="w-5 h-5" />
							<span>🔍 Search & Filters</span>
						</CardTitle>
					</CardHeader>
					<CardContent className="p-6">
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
							<div className="relative">
								<Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
								<Input
									value={searchValue}
									onChange={(e) => setSearchValue(e.target.value)}
									placeholder="Search by name or description..."
									className="pl-10"
								/>
							</div>
							<Select
								value={frequencyFilter}
								onValueChange={setFrequencyFilter}>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Filter by frequency" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="All">All Frequencies</SelectItem>
									{frequencies.map((freq) => (
										<SelectItem key={freq} value={freq}>
											{formatFrequency(freq)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Input
								value={roleFilter}
								onChange={(e) => {
									setRoleFilter(e.target.value);
								}}
								placeholder="Search by role"
							/>
							<Button
								variant="outline"
								onClick={() => {
									setSearchValue("");
									setFrequencyFilter("All");
									setRoleFilter("All");
								}}
								className="border-slate-300 text-slate-700 hover:bg-slate-50">
								Clear Filters
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Templates Table */}
				<Card className="bg-white/95 backdrop-blur-sm shadow-lg border-l-4 border-emerald-600">
					<CardHeader className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white">
						<CardTitle className="text-lg flex items-center space-x-2">
							<FileText className="w-5 h-5" />
							<span>📋 Template Directory</span>
						</CardTitle>
					</CardHeader>
					<CardContent className="p-0">
						{isLoading ? (
							<div className="flex items-center justify-center p-8">
								<Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
								<span className="ml-2 text-slate-600">
									Loading templates...
								</span>
							</div>
						) : error ? (
							<div className="flex items-center justify-center p-8">
								<XCircle className="w-6 h-6 text-red-600" />
								<span className="ml-2 text-red-600">
									Error loading templates
								</span>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Description</TableHead>
										<TableHead>Role</TableHead>
										<TableHead>Frequency</TableHead>
										<TableHead>KPIs</TableHead>
										<TableHead>Created</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{templates.length === 0 ? (
										<TableRow>
											<TableCell colSpan={7} className="text-center py-8">
												No templates found
											</TableCell>
										</TableRow>
									) : (
										templates.map((template: any) => (
											<TableRow key={template._id}>
												<TableCell className="font-medium">
													{template.name}
												</TableCell>
												<TableCell>
													<span className="text-sm text-slate-600">
														{template.description}
													</span>
												</TableCell>
												<TableCell>
													<Badge className={getRoleColor(template.role)}>
														{formatRole(template.role)}
													</Badge>
												</TableCell>
												<TableCell>
													<Badge
														className={getFrequencyColor(template.frequency)}>
														{formatFrequency(template.frequency)}
													</Badge>
												</TableCell>
												<TableCell>
													<span className="text-sm">
														{template.template?.length || 0} KPIs
													</span>
												</TableCell>
												<TableCell>
													<div className="flex items-center space-x-2">
														<Calendar className="w-4 h-4 text-slate-400" />
														<span className="text-sm">
															{new Date(template.createdAt).toLocaleDateString(
																"en-GB"
															)}
														</span>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center space-x-2">
														<Button
															variant="outline"
															size="sm"
															className="h-8 w-8 p-0"
															onClick={() => {
																setSelectedTemplate(template);
																setShowVersions(true);
															}}
															title="View Versions">
															<History className="w-4 h-4" />
														</Button>
														<Button
															variant="outline"
															size="sm"
															className="h-8 w-8 p-0"
															onClick={() => {
																setSelectedTemplate(template);
																setEditKpiCount(template.template?.length || 1);
																// Initialize subKpi counts for existing KPIs
																const initialSubKpiCounts: {
																	[key: number]: number;
																} = {};
																template.template?.forEach(
																	(kpi: any, index: number) => {
																		initialSubKpiCounts[index] =
																			kpi.subKpis?.length || 2;
																	}
																);
																setEditSubKpiCounts(initialSubKpiCounts);
																setShowEditTemplate(true);
															}}
															title="Edit Template">
															<Edit className="w-4 h-4" />
														</Button>
														<Button
															variant="outline"
															size="sm"
															className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
															onClick={() => {
																setSelectedTemplate(template);
																setShowDeleteConfirm(true);
															}}
															title="Delete Template">
															<Trash2 className="w-4 h-4" />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						)}
					</CardContent>
				</Card>

				{/* Edit Template Modal */}
				<Dialog open={showEditTemplate} onOpenChange={setShowEditTemplate}>
					<DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>Edit Template: {selectedTemplate?.name}</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleEditTemplate} className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="edit-name">Template Name</Label>
									<Input
										name="name"
										placeholder="Enter template name"
										defaultValue={selectedTemplate?.name}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="edit-role">Role</Label>
									<Input
										name="role"
										placeholder="Enter role"
										defaultValue={selectedTemplate?.role}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="edit-department">Department</Label>
									<Input
										name="department"
										placeholder="Enter department"
										defaultValue={selectedTemplate?.departmentSlug}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="edit-kpiName">KPI Name</Label>
									<Input
										name="kpiName"
										placeholder="Enter KPI name"
										defaultValue={selectedTemplate?.kpiName}
										required
									/>
								</div>

								<div className="space-y-2 col-span-2">
									<Label htmlFor="edit-description">Description</Label>
									<Input
										name="description"
										placeholder="Enter description"
										defaultValue={selectedTemplate?.description}
										required
									/>
								</div>
							</div>

							{/* KPI Templates */}
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<Label>KPI Templates</Label>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={addEditKpi}
										className="text-emerald-600 hover:text-emerald-700">
										<Plus className="w-4 h-4 mr-1" />
										Add KPI
									</Button>
								</div>
								{Array.from({ length: editKpiCount }, (_, kpiIndex) => {
									const existingKpi = selectedTemplate?.template?.[kpiIndex];
									return (
										<div
											key={kpiIndex}
											className="border rounded-lg p-4 space-y-4">
											<div className="flex items-center justify-between">
												<h4 className="font-medium text-slate-700">
													KPI {kpiIndex + 1}
												</h4>
												{editKpiCount > 1 && (
													<Button
														type="button"
														variant="outline"
														size="sm"
														onClick={() => removeEditKpi(kpiIndex)}
														className="text-red-600 hover:text-red-700">
														<Trash2 className="w-4 h-4" />
													</Button>
												)}
											</div>

											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div className="space-y-2">
													<Label htmlFor={`edit_kpi_${kpiIndex}_name`}>
														KPI Name
													</Label>
													<Input
														name={`edit_kpi_${kpiIndex}_name`}
														placeholder="Enter KPI name"
														defaultValue={existingKpi?.name || ""}
														required
													/>
												</div>
												<div className="space-y-2">
													<Label htmlFor={`edit_kpi_${kpiIndex}_maxMarks`}>
														Max Marks
													</Label>
													<Input
														name={`edit_kpi_${kpiIndex}_maxMarks`}
														type="number"
														defaultValue={existingKpi?.maxMarks || 100}
														required
													/>
												</div>
											</div>
											<div className="space-y-2">
												<Label htmlFor={`edit_kpi_${kpiIndex}_description`}>
													KPI Description
												</Label>
												<Input
													name={`edit_kpi_${kpiIndex}_description`}
													placeholder="Enter KPI description"
													defaultValue={existingKpi?.description || ""}
													required
												/>
											</div>
										</div>
									);
								})}
							</div>

							<div className="flex justify-end space-x-2">
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setShowEditTemplate(false);
										setSelectedTemplate(null);
									}}>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={updateTemplateMutation.isPending}>
									{updateTemplateMutation.isPending ? (
										<>
											<Loader2 className="w-4 h-4 mr-2 animate-spin" />
											Updating...
										</>
									) : (
										"Update Template"
									)}
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog>

				{/* Delete Confirmation Modal */}
				<Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>Delete Template</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							<p className="text-red-600">
								Are you sure you want to delete{" "}
								<strong>{selectedTemplate?.name}</strong>? This action cannot be
								undone.
							</p>
							<div className="flex justify-end space-x-2">
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setShowDeleteConfirm(false);
										setSelectedTemplate(null);
									}}>
									Cancel
								</Button>
								<Button
									onClick={handleDeleteTemplate}
									disabled={deleteTemplateMutation.isPending}
									className="bg-red-600 hover:bg-red-700 text-white">
									{deleteTemplateMutation.isPending ? (
										<>
											<Loader2 className="w-4 h-4 mr-2 animate-spin" />
											Deleting...
										</>
									) : (
										"Delete Template"
									)}
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>

				{/* Versions Modal */}
				<Dialog open={showVersions} onOpenChange={setShowVersions}>
					<DialogContent className="sm:max-w-2xl">
						<DialogHeader>
							<DialogTitle>
								Template Versions: {selectedTemplate?.name}
							</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							{versions.length === 0 ? (
								<p className="text-center text-slate-600 py-8">
									No versions found
								</p>
							) : (
								<div className="space-y-2">
									{versions.map((version: any) => (
										<div key={version._id} className="border rounded-lg p-4">
											<div className="flex items-center justify-between">
												<div>
													<h4 className="font-medium">
														Version {version.version}
													</h4>
													<p className="text-sm text-slate-600">
														{version.name}
													</p>
												</div>
												<div className="text-sm text-slate-500">
													{new Date(version.createdAt).toLocaleDateString(
														"en-GB"
													)}
												</div>
											</div>
										</div>
									))}
								</div>
							)}
							<div className="flex justify-end">
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setShowVersions(false);
										setSelectedTemplate(null);
									}}>
									Close
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
