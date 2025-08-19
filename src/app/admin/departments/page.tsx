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
	Building,
	Users,
	Shield,
	Mail,
	Calendar,
	CheckCircle,
	ArrowLeft,
	Phone,
	Loader2,
	XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
	useListDepartments,
	useCreateDepartment,
	useUpdateDepartment,
	useDeleteDepartment,
	CreateDepartmentData,
	UpdateDepartmentData,
} from "@/queries/departments";

export default function DepartmentManagementPage() {
	const router = useRouter();
	const [showCreateDepartment, setShowCreateDepartment] = React.useState(false);
	const [showEditDepartment, setShowEditDepartment] = React.useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
	const [selectedDepartment, setSelectedDepartment] = React.useState<any>(null);

	// API hooks
	const {
		data: departmentsData,
		isLoading,
		error,
		refetch,
	} = useListDepartments();
	const createDepartmentMutation = useCreateDepartment();
	const updateDepartmentMutation = useUpdateDepartment();
	const deleteDepartmentMutation = useDeleteDepartment();

	const departments = departmentsData?.docs || [];

	const generateSlug = (name: string) => {
		return name
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
			.replace(/\s+/g, "-") // Replace spaces with hyphens
			.replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
			.trim();
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const name = formData.get("name") as string;

		const createData: CreateDepartmentData = {
			name: name,
			slug: generateSlug(name),
		};

		createDepartmentMutation.mutate(createData, {
			onSuccess: () => {
				setShowCreateDepartment(false);
				const form = e.target as HTMLFormElement;
				form.reset();
				refetch();
			},
		});
	};

	const handleLogout = () => {
		console.log("Logout clicked");
		router.push("/login");
	};

	const handleCreateDepartment = () => {
		console.log("Create department");
		setShowCreateDepartment(false);
	};

	const handleEditDepartment = (e: React.FormEvent) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const name = formData.get("name") as string;

		const updateData: UpdateDepartmentData = {
			name: name,
			slug: generateSlug(name),
		};

		updateDepartmentMutation.mutate(
			{ id: selectedDepartment._id, data: updateData },
			{
				onSuccess: () => {
					setShowEditDepartment(false);
					setSelectedDepartment(null);
				},
			}
		);
	};

	const handleDeleteDepartment = () => {
		deleteDepartmentMutation.mutate(selectedDepartment._id, {
			onSuccess: () => {
				setShowDeleteConfirm(false);
				setSelectedDepartment(null);
			},
		});
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
									DEPARTMENT MANAGEMENT DASHBOARD
								</h1>
								<p className="text-sm text-red-700 font-medium drop-shadow-sm">
									PROJECT श्रेष्ठ | District Administration Raipur
								</p>
							</div>
						</div>

						<div className="flex items-center space-x-4">
							<Button
								onClick={() => router.push("/admin")}
								variant="outline"
								size="sm"
								className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-white/90 shadow-md">
								<ArrowLeft className="w-4 h-4 mr-2" />
								Back to Admin
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
								🏢 Department Management
							</h2>
							<p className="text-slate-600">
								Manage government departments and their organizational structure
							</p>
						</div>
						<Dialog
							open={showCreateDepartment}
							onOpenChange={setShowCreateDepartment}>
							<DialogTrigger asChild>
								<Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
									<Plus className="w-4 h-4 mr-2" />
									Create New Department
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-md">
								<DialogHeader>
									<DialogTitle>Create New Department</DialogTitle>
								</DialogHeader>
								<form onSubmit={handleSubmit} className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="name">Department Name</Label>
										<Input
											name="name"
											id="name"
											placeholder="Enter department name"
											required
										/>
										<p className="text-xs text-slate-500">
											Slug will be automatically generated from the name
										</p>
									</div>
									<div className="flex justify-end space-x-2">
										<Button
											type="button"
											variant="outline"
											onClick={() => setShowCreateDepartment(false)}>
											Cancel
										</Button>
										<Button
											type="submit"
											disabled={createDepartmentMutation.isPending}>
											{createDepartmentMutation.isPending ? (
												<>
													<Loader2 className="w-4 h-4 mr-2 animate-spin" />
													Creating...
												</>
											) : (
												"Create Department"
											)}
										</Button>
									</div>
								</form>
							</DialogContent>
						</Dialog>

						{/* Edit Department Modal */}
						<Dialog
							open={showEditDepartment}
							onOpenChange={setShowEditDepartment}>
							<DialogContent className="sm:max-w-md">
								<DialogHeader>
									<DialogTitle>
										Edit Department: {selectedDepartment?.name}
									</DialogTitle>
								</DialogHeader>
								<form onSubmit={handleEditDepartment} className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="edit-name">Department Name</Label>
										<Input
											name="name"
											id="edit-name"
											placeholder="Enter department name"
											defaultValue={selectedDepartment?.name}
											required
										/>
										<p className="text-xs text-slate-500">
											Slug will be automatically updated from the name
										</p>
									</div>
									<div className="flex justify-end space-x-2">
										<Button
											type="button"
											variant="outline"
											onClick={() => {
												setShowEditDepartment(false);
												setSelectedDepartment(null);
											}}>
											Cancel
										</Button>
										<Button
											type="submit"
											disabled={updateDepartmentMutation.isPending}>
											{updateDepartmentMutation.isPending ? (
												<>
													<Loader2 className="w-4 h-4 mr-2 animate-spin" />
													Updating...
												</>
											) : (
												"Update Department"
											)}
										</Button>
									</div>
								</form>
							</DialogContent>
						</Dialog>

						{/* Delete Confirmation Modal */}
						<Dialog
							open={showDeleteConfirm}
							onOpenChange={setShowDeleteConfirm}>
							<DialogContent className="sm:max-w-md">
								<DialogHeader>
									<DialogTitle>Delete Department</DialogTitle>
								</DialogHeader>
								<div className="space-y-4">
									<p className="text-red-600">
										Are you sure you want to delete{" "}
										<strong>{selectedDepartment?.name}</strong>? This action
										cannot be undone and will affect all associated users.
									</p>
									<div className="flex justify-end space-x-2">
										<Button
											type="button"
											variant="outline"
											onClick={() => {
												setShowDeleteConfirm(false);
												setSelectedDepartment(null);
											}}>
											Cancel
										</Button>
										<Button
											onClick={handleDeleteDepartment}
											disabled={deleteDepartmentMutation.isPending}
											className="bg-red-600 hover:bg-red-700 text-white">
											{deleteDepartmentMutation.isPending ? (
												<>
													<Loader2 className="w-4 h-4 mr-2 animate-spin" />
													Deleting...
												</>
											) : (
												"Delete Department"
											)}
										</Button>
									</div>
								</div>
							</DialogContent>
						</Dialog>
					</div>
				</div>

				{/* Statistics Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
					<Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-l-4 border-emerald-600">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-emerald-700">Total Departments</p>
									<p className="text-2xl font-bold text-emerald-800">
										{departments.length}
									</p>
								</div>
								<Building className="w-8 h-8 text-emerald-600" />
							</div>
						</CardContent>
					</Card>

					<Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-600">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-blue-700">Recently Added</p>
									<p className="text-2xl font-bold text-blue-800">
										{
											departments.filter((d: any) => {
												const createdAt = new Date(d.createdAt);
												const oneWeekAgo = new Date();
												oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
												return createdAt > oneWeekAgo;
											}).length
										}
									</p>
								</div>
								<Calendar className="w-8 h-8 text-blue-600" />
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Departments Table */}
				<Card className="bg-white/95 backdrop-blur-sm shadow-lg border-l-4 border-emerald-600">
					<CardHeader className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white">
						<CardTitle className="text-lg flex items-center space-x-2">
							<Building className="w-5 h-5" />
							<span>🏢 Department Directory</span>
						</CardTitle>
					</CardHeader>
					<CardContent className="p-0">
						{isLoading ? (
							<div className="flex items-center justify-center p-8">
								<Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
								<span className="ml-2 text-slate-600">
									Loading departments...
								</span>
							</div>
						) : error ? (
							<div className="flex items-center justify-center p-8 text-red-600">
								<XCircle className="w-8 h-8 mr-2" />
								<span>Error loading departments. Please try again.</span>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Department Name</TableHead>
										<TableHead>Slug</TableHead>
										<TableHead>Created</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{departments.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={4}
												className="text-center py-8 text-slate-500">
												No departments found.
											</TableCell>
										</TableRow>
									) : (
										departments.map((department: any) => (
											<TableRow key={department._id}>
												<TableCell className="font-medium">
													<div className="font-semibold">{department.name}</div>
												</TableCell>
												<TableCell>
													<div className="text-sm text-slate-500 font-mono">
														{department.slug}
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center space-x-2">
														<Calendar className="w-4 h-4 text-slate-400" />
														<span className="text-sm">
															{new Date(
																department.createdAt
															).toLocaleDateString("en-GB")}
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
																setSelectedDepartment(department);
																setShowEditDepartment(true);
															}}
															title="Edit Department">
															<Edit className="w-4 h-4" />
														</Button>
														<Button
															variant="outline"
															size="sm"
															className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
															onClick={() => {
																setSelectedDepartment(department);
																setShowDeleteConfirm(true);
															}}
															title="Delete Department">
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
			</div>
		</div>
	);
}
