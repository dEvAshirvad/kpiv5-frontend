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
	Phone,
	FileText,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import {
	useGetEmployeesByDepartment,
	useCreateEmployee,
	useUpdateEmployee,
	useDeleteEmployee,
	CreateEmployeeData,
	UpdateEmployeeData,
} from "@/queries/employees";
import { useListDepartments } from "@/queries/departments";
import { useSession, useSignOut } from "@/queries";

export default function EmployeeManagementPage() {
	const params = useParams();
	console.log(params.department);
	const router = useRouter();
	const [showEditEmployee, setShowEditEmployee] = React.useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
	const [selectedEmployee, setSelectedEmployee] = React.useState<any>(null);
	const [searchValue, setSearchValue] = React.useState("");
	const [debouncedSearchValue, setDebouncedSearchValue] = React.useState("");
	const [currentPage, setCurrentPage] = React.useState(1);
	const [pageSize, setPageSize] = React.useState(10);

	// API hooks
	const {
		data: employeesData,
		isLoading,
		error,
	} = useGetEmployeesByDepartment({
		department: params.department as string,
		page: currentPage,
		limit: pageSize,
		search: debouncedSearchValue || "",
	});

	const { data: departmentsData } = useListDepartments();
	const createEmployeeMutation = useCreateEmployee();
	const updateEmployeeMutation = useUpdateEmployee();
	const deleteEmployeeMutation = useDeleteEmployee();
	const { data: session } = useSession();
	const signOutMutation = useSignOut();

	const employees = employeesData?.docs || [];
	const departments = departmentsData?.docs || [];

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);

		const createData: CreateEmployeeData = {
			name: formData.get("name") as string,
			contact: {
				email: (formData.get("email") as string) || undefined,
				phone: formData.get("phone") as string,
			},
			department: formData.get("department") as string,
			departmentRole: formData.get("departmentRole") as string,
			metadata: formData.get("metadata")
				? JSON.parse(formData.get("metadata") as string)
				: undefined,
		};

		createEmployeeMutation.mutate(createData, {
			onSuccess: () => {
				// Close modal and reset form
				const form = e.target as HTMLFormElement;
				form.reset();
			},
		});
	};

	const handleLogout = () => {
		console.log("Logout clicked");
		signOutMutation.mutate(undefined, {
			onSuccess: () => {
				router.push("/login");
			},
		});
		router.push("/login");
	};

	const handleEditEmployee = (e: React.FormEvent) => {
		e.preventDefault();
		const formData = new FormData(e.target as HTMLFormElement);

		const updateData: UpdateEmployeeData = {
			name: formData.get("name") as string,
			contact: {
				email: (formData.get("email") as string) || undefined,
				phone: formData.get("phone") as string,
			},
			department: formData.get("department") as string,
			departmentRole: formData.get("departmentRole") as string,
			metadata: formData.get("metadata")
				? JSON.parse(formData.get("metadata") as string)
				: undefined,
		};

		updateEmployeeMutation.mutate(
			{ id: selectedEmployee._id, data: updateData },
			{
				onSuccess: () => {
					setShowEditEmployee(false);
					setSelectedEmployee(null);
				},
			}
		);
	};

	const handleDeleteEmployee = () => {
		deleteEmployeeMutation.mutate(selectedEmployee._id, {
			onSuccess: () => {
				setShowDeleteConfirm(false);
				setSelectedEmployee(null);
			},
		});
	};

	const getRoleColor = (role: string) => {
		switch (role) {
			case "admin":
				return "bg-red-100 text-red-800";
			case "nodal-officer":
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

	// Debounce search value to reduce API calls
	React.useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchValue(searchValue);
		}, 500); // 500ms delay

		return () => clearTimeout(timer);
	}, [searchValue]);

	// Reset to first page when debounced search changes
	React.useEffect(() => {
		setCurrentPage(1);
	}, [debouncedSearchValue]);

	// Department and role options
	const departmentOptions = departments.map((dept) => dept.slug);
	const roles = ["sdm", "tehsildar", "patwari", "ri", "nodal-officer"];

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
									EMPLOYEE MANAGEMENT DASHBOARD
								</h1>
								<p className="text-sm text-red-700 font-medium drop-shadow-sm">
									PROJECT श्रेष्ठ | District Administration Raipur
								</p>
							</div>
						</div>

						<div className="flex items-center space-x-4">
							<Button
								onClick={() => router.push(`/${params.department}/entry`)}
								variant="outline"
								size="sm"
								className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-white/90 shadow-md">
								<FileText className="w-4 h-4 mr-2" />
								Manage Entries
							</Button>
							<Button
								onClick={() => router.push(`/${params.department}/template`)}
								variant="outline"
								size="sm"
								className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-white/90 shadow-md">
								<FileText className="w-4 h-4 mr-2" />
								Manage Templates
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
								👥 Employee Management
							</h2>
							<p className="text-slate-600">
								Manage government employees and their department assignments
							</p>
						</div>
						<Dialog>
							<DialogTrigger asChild>
								<Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
									<UserPlus className="w-4 h-4 mr-2" />
									Create New Employee
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-md">
								<DialogHeader>
									<DialogTitle>Create New Employee</DialogTitle>
								</DialogHeader>
								<form onSubmit={handleSubmit} className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="name">Full Name</Label>
										<Input name="name" placeholder="Enter full name" required />
									</div>
									<div className="space-y-2">
										<Label htmlFor="email">Email (Optional)</Label>
										<Input
											name="email"
											type="email"
											placeholder="Enter email address"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="phone">Phone Number</Label>
										<Input
											name="phone"
											placeholder="Enter phone number"
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="department">Department</Label>
										<Select name="department" value={session?.user.department}>
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
									<div className="space-y-2">
										<Label htmlFor="departmentRole">Role</Label>
										<Input
											name="departmentRole"
											placeholder="Enter Department Role"
											required
										/>
									</div>
									<div className="flex justify-end space-x-2">
										<Button type="button" variant="outline">
											Cancel
										</Button>
										<Button
											type="submit"
											disabled={createEmployeeMutation.isPending}>
											{createEmployeeMutation.isPending ? (
												<>
													<Loader2 className="w-4 h-4 mr-2 animate-spin" />
													Creating...
												</>
											) : (
												"Create Employee"
											)}
										</Button>
									</div>
								</form>
							</DialogContent>
						</Dialog>

						{/* Edit Employee Modal */}
						<Dialog open={showEditEmployee} onOpenChange={setShowEditEmployee}>
							<DialogContent className="sm:max-w-md">
								<DialogHeader>
									<DialogTitle>
										Edit Employee: {selectedEmployee?.name}
									</DialogTitle>
								</DialogHeader>
								<form onSubmit={handleEditEmployee} className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="edit-name">Full Name</Label>
										<Input
											name="name"
											placeholder="Enter full name"
											defaultValue={selectedEmployee?.name}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="edit-email">Email (Optional)</Label>
										<Input
											name="email"
											type="email"
											placeholder="Enter email address"
											defaultValue={selectedEmployee?.contact?.email}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="edit-phone">Phone Number</Label>
										<Input
											name="phone"
											placeholder="Enter phone number"
											defaultValue={selectedEmployee?.contact?.phone}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="edit-department">Department</Label>
										<Select
											name="department"
											disabled
											defaultValue={selectedEmployee?.department}>
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
									<div className="space-y-2">
										<Label htmlFor="edit-role">Role</Label>
										<Input
											name="departmentRole"
											placeholder="Enter Department Role"
											defaultValue={selectedEmployee?.departmentRole}
											required
										/>
									</div>
									<div className="flex justify-end space-x-2">
										<Button
											type="button"
											variant="outline"
											onClick={() => {
												setShowEditEmployee(false);
												setSelectedEmployee(null);
											}}>
											Cancel
										</Button>
										<Button
											type="submit"
											disabled={updateEmployeeMutation.isPending}>
											{updateEmployeeMutation.isPending ? (
												<>
													<Loader2 className="w-4 h-4 mr-2 animate-spin" />
													Updating...
												</>
											) : (
												"Update Employee"
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
									<DialogTitle>Delete Employee</DialogTitle>
								</DialogHeader>
								<div className="space-y-4">
									<p className="text-red-600">
										Are you sure you want to delete{" "}
										<strong>{selectedEmployee?.name}</strong>? This action
										cannot be undone.
									</p>
									<div className="flex justify-end space-x-2">
										<Button
											type="button"
											variant="outline"
											onClick={() => {
												setShowDeleteConfirm(false);
												setSelectedEmployee(null);
											}}>
											Cancel
										</Button>
										<Button
											onClick={handleDeleteEmployee}
											disabled={deleteEmployeeMutation.isPending}
											className="bg-red-600 hover:bg-red-700 text-white">
											{deleteEmployeeMutation.isPending ? (
												<>
													<Loader2 className="w-4 h-4 mr-2 animate-spin" />
													Deleting...
												</>
											) : (
												"Delete Employee"
											)}
										</Button>
									</div>
								</div>
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
									<p className="text-sm text-emerald-700">Total Employees</p>
									<p className="text-2xl font-bold text-emerald-800">
										{employeesData?.total || 0}
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
									<p className="text-sm text-blue-700">Departments</p>
									<p className="text-2xl font-bold text-blue-800">
										{new Set(employees.map((emp: any) => emp.department)).size}
									</p>
								</div>
								<Building className="w-8 h-8 text-blue-600" />
							</div>
						</CardContent>
					</Card>

					<Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-600">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-purple-700">Roles</p>
									<p className="text-2xl font-bold text-purple-800">
										{
											new Set(employees.map((emp: any) => emp.departmentRole))
												.size
										}
									</p>
								</div>
								<Shield className="w-8 h-8 text-purple-600" />
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
									onChange={(e) => setSearchValue(e.target.value)}
									placeholder="Search by name..."
									className="pl-10 pr-10"
								/>
								{searchValue !== debouncedSearchValue && (
									<Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-slate-400" />
								)}
							</div>
							<Select
								value={pageSize.toString()}
								onValueChange={(value) => {
									setPageSize(parseInt(value));
									setCurrentPage(1);
								}}>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Page size" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="5">5 per page</SelectItem>
									<SelectItem value="10">10 per page</SelectItem>
									<SelectItem value="20">20 per page</SelectItem>
									<SelectItem value="50">50 per page</SelectItem>
								</SelectContent>
							</Select>
							<Button
								variant="outline"
								onClick={() => {
									setSearchValue("");
									setDebouncedSearchValue("");
									setCurrentPage(1);
								}}
								className="border-slate-300 text-slate-700 hover:bg-slate-50">
								Clear Filters
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Employees Table */}
				<Card className="bg-white/95 backdrop-blur-sm shadow-lg border-l-4 border-emerald-600">
					<CardHeader className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white">
						<CardTitle className="text-lg flex items-center space-x-2">
							<Users className="w-5 h-5" />
							<span>👥 Employee Directory</span>
						</CardTitle>
					</CardHeader>
					<CardContent className="p-0">
						{isLoading ? (
							<div className="flex items-center justify-center p-8">
								<Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
								<span className="ml-2 text-slate-600">
									Loading employees...
								</span>
							</div>
						) : error ? (
							<div className="flex items-center justify-center p-8">
								<XCircle className="w-6 h-6 text-red-600" />
								<span className="ml-2 text-red-600">
									Error loading employees
								</span>
							</div>
						) : (
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Name</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>Phone</TableHead>
										<TableHead>Department</TableHead>
										<TableHead>Role</TableHead>
										<TableHead>Created</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{employees.length === 0 ? (
										<TableRow>
											<TableCell colSpan={7} className="text-center py-8">
												No employees found
											</TableCell>
										</TableRow>
									) : (
										employees.map((employee: any) => (
											<TableRow key={employee._id}>
												<TableCell className="font-medium">
													{employee.name}
												</TableCell>
												<TableCell>
													<div className="flex items-center space-x-2">
														<Mail className="w-4 h-4 text-slate-400" />
														<span>{employee.contact?.email || "N/A"}</span>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center space-x-2">
														<Phone className="w-4 h-4 text-slate-400" />
														<span>{employee.contact?.phone}</span>
													</div>
												</TableCell>
												<TableCell>
													<Badge variant="outline" className="capitalize">
														{employee.department}
													</Badge>
												</TableCell>
												<TableCell>
													<Badge
														className={getRoleColor(employee.departmentRole)}>
														{formatRole(employee.departmentRole)}
													</Badge>
												</TableCell>
												<TableCell>
													<div className="flex items-center space-x-2">
														<Calendar className="w-4 h-4 text-slate-400" />
														<span className="text-sm">
															{new Date(employee.createdAt).toLocaleDateString(
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
																setSelectedEmployee(employee);
																setShowEditEmployee(true);
															}}
															title="Edit Employee">
															<Edit className="w-4 h-4" />
														</Button>
														<Button
															variant="outline"
															size="sm"
															className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
															onClick={() => {
																setSelectedEmployee(employee);
																setShowDeleteConfirm(true);
															}}
															title="Delete Employee">
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

				{/* Pagination Controls */}
				{employeesData && employeesData.totalPages > 1 && (
					<Card className="mt-6 bg-white/95 backdrop-blur-sm shadow-lg border-l-4 border-emerald-600">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div className="text-sm text-slate-600">
									Showing {(currentPage - 1) * pageSize + 1} to{" "}
									{Math.min(currentPage * pageSize, employeesData.total)} of{" "}
									{employeesData.total} employees
								</div>
								<div className="flex items-center space-x-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setCurrentPage(1)}
										disabled={currentPage === 1}>
										First
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setCurrentPage(currentPage - 1)}
										disabled={currentPage === 1}>
										Previous
									</Button>
									<div className="flex items-center space-x-1">
										{Array.from(
											{ length: Math.min(5, employeesData.totalPages) },
											(_, i) => {
												const pageNum =
													Math.max(
														1,
														Math.min(
															employeesData.totalPages - 4,
															currentPage - 2
														)
													) + i;
												return (
													<Button
														key={pageNum}
														variant={
															currentPage === pageNum ? "default" : "outline"
														}
														size="sm"
														onClick={() => setCurrentPage(pageNum)}
														className="w-8 h-8 p-0">
														{pageNum}
													</Button>
												);
											}
										)}
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setCurrentPage(currentPage + 1)}
										disabled={currentPage === employeesData.totalPages}>
										Next
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setCurrentPage(employeesData.totalPages)}
										disabled={currentPage === employeesData.totalPages}>
										Last
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
