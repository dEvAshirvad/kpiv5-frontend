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
	Eye,
	UserPlus,
	Users,
	Building,
	Shield,
	Mail,
	Calendar,
	CheckCircle,
	XCircle,
	ArrowLeft,
	Loader2,
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
	useListNodalOfficers,
	useCreateNodalOfficer,
	useUpdateNodalOfficer,
	useRemoveNodalOfficer,
	useSetNodalOfficerPassword,
	CreateNodalOfficerData,
	UpdateNodalOfficerData,
} from "@/queries/admin";
import { useListDepartments } from "@/queries/departments";

export default function NodalOfficerManagementPage() {
	const router = useRouter();
	const [showEditUser, setShowEditUser] = React.useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
	const [showSetPassword, setShowSetPassword] = React.useState(false);
	const [selectedUser, setSelectedUser] = React.useState<any>(null);
	const [searchValue, setSearchValue] = React.useState("");
	const [departmentFilter, setDepartmentFilter] = React.useState("All");
	const [currentPage, setCurrentPage] = React.useState(1);
	const [pageSize, setPageSize] = React.useState(10);

	// API hooks
	const {
		data: nodalOfficersData,
		isLoading,
		error,
	} = useListNodalOfficers({
		searchValue: searchValue || undefined,
		searchField: searchValue ? "name" : undefined,
		searchOperator: searchValue ? "contains" : undefined,
		filterField: departmentFilter !== "All" ? "department" : "departmentRole",
		filterValue: departmentFilter !== "All" ? departmentFilter : "nodalOfficer",
		filterOperator: "eq",
		offset: (currentPage - 1) * pageSize,
		limit: pageSize,
	});

	const { data: departmentsData } = useListDepartments();
	const createNodalOfficerMutation = useCreateNodalOfficer();
	const updateNodalOfficerMutation = useUpdateNodalOfficer();
	const removeNodalOfficerMutation = useRemoveNodalOfficer();
	const setPasswordMutation = useSetNodalOfficerPassword();

	const nodalOfficers = nodalOfficersData?.users || [];
	const departments = departmentsData?.docs || [];

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);

		const createData: CreateNodalOfficerData = {
			email: formData.get("email") as string,
			password: formData.get("password") as string,
			name: formData.get("name") as string,
			role: "nodalOfficer",
			data: {
				department: formData.get("department") as string,
				departmentRole: "nodalOfficer",
			},
		};

		createNodalOfficerMutation.mutate(createData, {
			onSuccess: () => {
				// Close modal and reset form
				const form = e.target as HTMLFormElement;
				form.reset();
			},
		});
	};

	const handleLogout = () => {
		console.log("Logout clicked");
		router.push("/login");
	};

	const handleEditUser = (e: React.FormEvent) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);

		const updateData: UpdateNodalOfficerData = {
			userId: selectedUser.id,
			data: {
				department: formData.get("department") as string,
				departmentRole: "nodalOfficer",
			},
		};

		updateNodalOfficerMutation.mutate(updateData, {
			onSuccess: () => {
				setShowEditUser(false);
				setSelectedUser(null);
			},
		});
	};

	const handleDeleteUser = () => {
		removeNodalOfficerMutation.mutate(
			{ userId: selectedUser.id },
			{
				onSuccess: () => {
					setShowDeleteConfirm(false);
					setSelectedUser(null);
				},
			}
		);
	};

	const handleSetPassword = (e: React.FormEvent) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);
		const newPassword = formData.get("password") as string;

		setPasswordMutation.mutate(
			{
				userId: selectedUser.id,
				newPassword: newPassword,
			},
			{
				onSuccess: () => {
					setShowSetPassword(false);
					setSelectedUser(null);
					// Reset form
					const form = e.target as HTMLFormElement;
					form.reset();
				},
			}
		);
	};

	// Pagination functions
	const totalPages = Math.ceil((nodalOfficersData?.total || 0) / pageSize);
	const hasNextPage = currentPage < totalPages;
	const hasPreviousPage = currentPage > 1;

	const goToPage = (page: number) => {
		setCurrentPage(page);
	};

	const goToNextPage = () => {
		if (hasNextPage) {
			setCurrentPage(currentPage + 1);
		}
	};

	const goToPreviousPage = () => {
		if (hasPreviousPage) {
			setCurrentPage(currentPage - 1);
		}
	};

	const goToFirstPage = () => {
		setCurrentPage(1);
	};

	const goToLastPage = () => {
		setCurrentPage(totalPages);
	};

	const getRoleColor = (role: string) => {
		switch (role) {
			case "admin":
				return "bg-red-100 text-red-800";
			case "nodalOfficer":
				return "bg-purple-100 text-purple-800";
			case "district-officer":
				return "bg-blue-100 text-blue-800";
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

	const formatDepartment = (department: string) => {
		return department
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	};

	const formatRole = (role: string) => {
		return role
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
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
									NODAL OFFICER MANAGEMENT DASHBOARD
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
								👥 Nodal Officer Management
							</h2>
							<p className="text-slate-600">
								Manage nodal officers and their access to the KPI portal
							</p>
						</div>
						<Dialog>
							<DialogTrigger asChild>
								<Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
									<UserPlus className="w-4 h-4 mr-2" />
									Create New Nodal Officer
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-md">
								<DialogHeader>
									<DialogTitle>Create New Nodal Officer</DialogTitle>
								</DialogHeader>
								<form onSubmit={handleSubmit} className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="name">Full Name</Label>
										<Input
											name="name"
											id="name"
											placeholder="Enter full name"
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="email">Email</Label>
										<Input
											name="email"
											id="email"
											type="email"
											placeholder="Enter email address"
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="password">Password</Label>
										<Input
											name="password"
											id="password"
											type="password"
											placeholder="Enter password"
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="department">Department</Label>
										<Select name="department">
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select department" />
											</SelectTrigger>
											<SelectContent>
												{departments.map((dept) => (
													<SelectItem key={dept._id} value={dept.slug}>
														{dept.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className="flex justify-end space-x-2">
										<Button type="button" variant="outline">
											Cancel
										</Button>
										<Button
											type="submit"
											disabled={createNodalOfficerMutation.isPending}>
											{createNodalOfficerMutation.isPending ? (
												<>
													<Loader2 className="w-4 h-4 mr-2 animate-spin" />
													Creating...
												</>
											) : (
												"Create Nodal Officer"
											)}
										</Button>
									</div>
								</form>
							</DialogContent>
						</Dialog>

						{/* Edit User Modal */}
						<Dialog open={showEditUser} onOpenChange={setShowEditUser}>
							<DialogContent className="sm:max-w-md">
								<DialogHeader>
									<DialogTitle>
										Edit Nodal Officer: {selectedUser?.name}
									</DialogTitle>
								</DialogHeader>
								<form onSubmit={handleEditUser} className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="edit-name">Full Name</Label>
										<Input
											id="edit-name"
											placeholder="Enter full name"
											defaultValue={selectedUser?.name}
											disabled
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="edit-email">Email</Label>
										<Input
											id="edit-email"
											type="email"
											placeholder="Enter email address"
											defaultValue={selectedUser?.email}
											disabled
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="edit-department">Department</Label>
										<Select
											name="department"
											defaultValue={selectedUser?.department}>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select department" />
											</SelectTrigger>
											<SelectContent>
												{departments.map((dept) => (
													<SelectItem key={dept._id} value={dept.slug}>
														{dept.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className="flex justify-end space-x-2">
										<Button
											type="button"
											variant="outline"
											onClick={() => {
												setShowEditUser(false);
												setSelectedUser(null);
											}}>
											Cancel
										</Button>
										<Button
											type="submit"
											disabled={updateNodalOfficerMutation.isPending}>
											{updateNodalOfficerMutation.isPending ? (
												<>
													<Loader2 className="w-4 h-4 mr-2 animate-spin" />
													Updating...
												</>
											) : (
												"Update Nodal Officer"
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
									<DialogTitle>Delete Nodal Officer</DialogTitle>
								</DialogHeader>
								<div className="space-y-4">
									<p className="text-red-600">
										Are you sure you want to delete{" "}
										<strong>{selectedUser?.name}</strong>? This action cannot be
										undone.
									</p>
									<div className="flex justify-end space-x-2">
										<Button
											type="button"
											variant="outline"
											onClick={() => {
												setShowDeleteConfirm(false);
												setSelectedUser(null);
											}}>
											Cancel
										</Button>
										<Button
											onClick={handleDeleteUser}
											disabled={removeNodalOfficerMutation.isPending}
											className="bg-red-600 hover:bg-red-700 text-white">
											{removeNodalOfficerMutation.isPending ? (
												<>
													<Loader2 className="w-4 h-4 mr-2 animate-spin" />
													Deleting...
												</>
											) : (
												"Delete Nodal Officer"
											)}
										</Button>
									</div>
								</div>
							</DialogContent>
						</Dialog>

						{/* Set Password Modal */}
						<Dialog open={showSetPassword} onOpenChange={setShowSetPassword}>
							<DialogContent className="sm:max-w-md">
								<DialogHeader>
									<DialogTitle>
										Set Password for: {selectedUser?.name}
									</DialogTitle>
								</DialogHeader>
								<form onSubmit={handleSetPassword} className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="set-password">New Password</Label>
										<Input
											id="set-password"
											name="password"
											type="password"
											placeholder="Enter new password"
											required
											minLength={6}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="confirm-password">Confirm Password</Label>
										<Input
											id="confirm-password"
											type="password"
											placeholder="Confirm new password"
											required
											minLength={6}
											onChange={(e) => {
												const password = (
													e.target.form?.elements.namedItem(
														"password"
													) as HTMLInputElement
												)?.value;
												const confirmPassword = e.target.value;
												if (password !== confirmPassword) {
													e.target.setCustomValidity("Passwords do not match");
												} else {
													e.target.setCustomValidity("");
												}
											}}
										/>
									</div>
									<div className="flex justify-end space-x-2">
										<Button
											type="button"
											variant="outline"
											onClick={() => {
												setShowSetPassword(false);
												setSelectedUser(null);
											}}>
											Cancel
										</Button>
										<Button
											type="submit"
											disabled={setPasswordMutation.isPending}
											className="bg-blue-600 hover:bg-blue-700 text-white">
											{setPasswordMutation.isPending ? (
												<>
													<Loader2 className="w-4 h-4 mr-2 animate-spin" />
													Setting Password...
												</>
											) : (
												"Set Password"
											)}
										</Button>
									</div>
								</form>
							</DialogContent>
						</Dialog>
					</div>
				</div>

				{/* Statistics Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-l-4 border-emerald-600">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-emerald-700">
										Total Nodal Officers
									</p>
									<p className="text-2xl font-bold text-emerald-800">
										{nodalOfficers.length}
									</p>
								</div>
								<Users className="w-8 h-8 text-emerald-600" />
							</div>
						</CardContent>
					</Card>

					<Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-600">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-blue-700">Active Officers</p>
									<p className="text-2xl font-bold text-blue-800">
										{nodalOfficers.filter((u: any) => u.emailVerified).length}
									</p>
								</div>
								<CheckCircle className="w-8 h-8 text-blue-600" />
							</div>
						</CardContent>
					</Card>

					<Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-l-4 border-amber-600">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-amber-700">Departments</p>
									<p className="text-2xl font-bold text-amber-800">
										{new Set(nodalOfficers.map((u: any) => u.department)).size}
									</p>
								</div>
								<Building className="w-8 h-8 text-amber-600" />
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
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="relative">
								<Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
								<Input
									value={searchValue}
									onChange={(e) => {
										setSearchValue(e.target.value);
										setCurrentPage(1);
									}}
									placeholder="Search by name or email..."
									className="pl-10"
								/>
							</div>
							<Select
								value={departmentFilter}
								onValueChange={(value) => {
									setDepartmentFilter(value);
									setCurrentPage(1);
								}}>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Filter by department" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="All">All Departments</SelectItem>
									{departments.map((dept) => (
										<SelectItem key={dept._id} value={dept.slug}>
											{dept.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Button
								variant="outline"
								onClick={() => {
									setSearchValue("");
									setDepartmentFilter("All");
									setCurrentPage(1);
								}}
								className="border-slate-300 text-slate-700 hover:bg-slate-50">
								Clear Filters
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Nodal Officers Table */}
				<Card className="bg-white/95 backdrop-blur-sm shadow-lg border-l-4 border-emerald-600">
					<CardHeader className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white">
						<CardTitle className="text-lg flex items-center space-x-2">
							<Users className="w-5 h-5" />
							<span>👥 Nodal Officer Directory</span>
						</CardTitle>
					</CardHeader>
					<CardContent className="p-0">
						{isLoading ? (
							<div className="flex items-center justify-center p-8">
								<Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
								<span className="ml-2 text-slate-600">
									Loading nodal officers...
								</span>
							</div>
						) : error ? (
							<div className="flex items-center justify-center p-8 text-red-600">
								<XCircle className="w-8 h-8 mr-2" />
								<span>Error loading nodal officers. Please try again.</span>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>Department</TableHead>
										<TableHead>Contact</TableHead>
										<TableHead>Created</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{nodalOfficers.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={6}
												className="text-center py-8 text-slate-500">
												No nodal officers found.
											</TableCell>
										</TableRow>
									) : (
										nodalOfficers.map((user: any) => (
											<TableRow key={user.id}>
												<TableCell className="font-medium">
													{user.name}
												</TableCell>
												<TableCell>
													<div className="flex items-center space-x-2">
														<Mail className="w-4 h-4 text-slate-400" />
														<span>{user.email}</span>
													</div>
												</TableCell>
												<TableCell>
													<Badge variant="outline" className="capitalize">
														{formatDepartment(user.department)}
													</Badge>
												</TableCell>
												<TableCell>
													<span className="text-sm">
														{user.contact || "N/A"}
													</span>
												</TableCell>
												<TableCell>
													<div className="flex items-center space-x-2">
														<Calendar className="w-4 h-4 text-slate-400" />
														<span className="text-sm">
															{new Date(user.createdAt).toLocaleDateString(
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
																setSelectedUser(user);
																setShowEditUser(true);
															}}
															title="Edit User">
															<Edit className="w-4 h-4" />
														</Button>
														<Button
															variant="outline"
															size="sm"
															className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
															onClick={() => {
																setSelectedUser(user);
																setShowSetPassword(true);
															}}
															title="Set Password">
															<Shield className="w-4 h-4" />
														</Button>
														<Button
															variant="outline"
															size="sm"
															className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
															onClick={() => {
																setSelectedUser(user);
																setShowDeleteConfirm(true);
															}}
															title="Delete User">
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

						{/* Pagination Controls */}
						{nodalOfficers.length > 0 && (
							<div className="flex items-center justify-between px-6 py-4 border-t rounded-b-lg bg-slate-50">
								<div className="flex items-center space-x-2 text-sm text-slate-600">
									<span>
										Showing {(currentPage - 1) * pageSize + 1} to{" "}
										{Math.min(
											currentPage * pageSize,
											nodalOfficersData?.users?.length || 0
										)}{" "}
										of {nodalOfficersData?.users?.length || 0} nodal officers
									</span>
								</div>

								<div className="flex items-center space-x-2">
									{/* Page Size Selector */}
									<div className="flex items-center space-x-2">
										<span className="text-sm text-slate-600">Show:</span>
										<Select
											value={pageSize.toString()}
											onValueChange={(value) => {
												setPageSize(Number(value));
												setCurrentPage(1);
											}}>
											<SelectTrigger className="w-20 h-8">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="5">5</SelectItem>
												<SelectItem value="10">10</SelectItem>
												<SelectItem value="20">20</SelectItem>
												<SelectItem value="50">50</SelectItem>
											</SelectContent>
										</Select>
									</div>

									{/* Pagination Buttons */}
									<div className="flex items-center space-x-1">
										<Button
											variant="outline"
											size="sm"
											onClick={goToFirstPage}
											disabled={!hasPreviousPage}
											className="h-8 w-8 p-0">
											<ChevronsLeft className="h-4 w-4" />
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={goToPreviousPage}
											disabled={!hasPreviousPage}
											className="h-8 w-8 p-0">
											<ChevronLeft className="h-4 w-4" />
										</Button>

										{/* Page Numbers */}
										{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
											let pageNum;
											if (totalPages <= 5) {
												pageNum = i + 1;
											} else if (currentPage <= 3) {
												pageNum = i + 1;
											} else if (currentPage >= totalPages - 2) {
												pageNum = totalPages - 4 + i;
											} else {
												pageNum = currentPage - 2 + i;
											}

											return (
												<Button
													key={pageNum}
													variant={
														currentPage === pageNum ? "default" : "outline"
													}
													size="sm"
													onClick={() => goToPage(pageNum)}
													className="h-8 w-8 p-0">
													{pageNum}
												</Button>
											);
										})}

										<Button
											variant="outline"
											size="sm"
											onClick={goToNextPage}
											disabled={!hasNextPage}
											className="h-8 w-8 p-0">
											<ChevronRight className="h-4 w-4" />
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={goToLastPage}
											disabled={!hasNextPage}
											className="h-8 w-8 p-0">
											<ChevronsRight className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
