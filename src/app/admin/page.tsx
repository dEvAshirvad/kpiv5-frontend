"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
	FileText,
	Download,
	Eye,
	Search,
	Filter,
	TrendingUp,
	BarChart3,
	X,
	Users,
	Award,
	Target,
	CheckCircle,
	AlertCircle,
	Clock,
	Building,
	UserCheck,
	UserX,
	AlertTriangle,
} from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useSignOut } from "@/queries/auth";
import {
	useStatistics,
	calculateScoreDistribution,
	getTopPerformers,
	StatisticsFilters,
} from "@/queries/statistics";

export default function AdminPage() {
	const router = useRouter();
	const [searchTerm, setSearchTerm] = React.useState("");
	const [departmentFilter, setDepartmentFilter] = React.useState("all");
	const [roleFilter, setRoleFilter] = React.useState("all");
	const [statusFilter, setStatusFilter] = React.useState("all");
	const [selectedMember, setSelectedMember] = React.useState<any>(null);
	const [showDetailModal, setShowDetailModal] = React.useState(false);
	const signOutMutation = useSignOut();

	// Statistics API filters
	const [statsFilters, setStatsFilters] = React.useState<StatisticsFilters>({});

	// Fetch statistics data
	const {
		data: statsData,
		isLoading,
		error,
	} = useStatistics({
		filters: statsFilters,
		enabled: true,
	});

	const handleLogout = () => {
		console.log("Logout clicked");
		signOutMutation.mutate(undefined, {
			onSuccess: () => {
				router.push("/login");
			},
		});
	};

	const handleViewDetails = (member: any) => {
		console.log("View details for:", member.employee.name);
		setSelectedMember(member);
		setShowDetailModal(true);
	};

	const handleDownloadReport = (member: any) => {
		console.log("Download report for:", member.employee.name);
		const reportContent = `
KPI Performance Report - Overall Statistics
Department: ${member.employee.department}
Role: ${member.employee.departmentRole}

Member Details:
Name: ${member.employee.name}
Email: ${member.employee.contact.email}
Department: ${member.employee.department}
Role: ${member.employee.departmentRole}

Performance Summary:
Ranking: ${member.rank}
Score: ${member.score}%
Status: ${member.status}

Report Generated: ${new Date().toLocaleString()}
		`.trim();

		const blob = new Blob([reportContent], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `kpi-report-${member.name}.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const getScoreColor = (score: number) => {
		if (score >= 85) return "text-emerald-700 bg-emerald-100";
		if (score >= 80) return "text-blue-700 bg-blue-100";
		if (score >= 75) return "text-amber-700 bg-amber-100";
		if (score >= 70) return "text-orange-700 bg-orange-100";
		return "text-red-700 bg-red-100";
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "Completed":
				return "bg-emerald-100 text-emerald-800";
			case "In Progress":
				return "bg-blue-100 text-blue-800";
			case "Pending":
				return "bg-red-100 text-red-800";
			default:
				return "bg-slate-100 text-slate-800";
		}
	};

	// Filter members based on search and filters
	const filteredMembers =
		statsData?.ranking?.filter((member) => {
			const matchesSearch =
				member.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				member.employee.contact.email
					.toLowerCase()
					.includes(searchTerm.toLowerCase());

			const matchesDepartment =
				departmentFilter === "all" ||
				member.employee.department === departmentFilter;

			const matchesRole =
				roleFilter === "all" || member.employee.departmentRole === roleFilter;

			const matchesStatus =
				statusFilter === "all" || member.status === statusFilter;

			return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
		}) || [];

	// Calculate statistics from API data
	const overallStats = statsData?.statistics
		? {
				averageScore: statsData.statistics.averageScore,
				totalEmployees: statsData.statistics.totalEntries,
				excellentPerformers: calculateScoreDistribution(statsData.ranking || [])
					.excellent,
				poorPerformers: calculateScoreDistribution(statsData.ranking || [])
					.poor,
				scoreDistribution: calculateScoreDistribution(statsData.ranking || []),
		  }
		: {
				averageScore: 0,
				totalEmployees: 0,
				excellentPerformers: 0,
				poorPerformers: 0,
				scoreDistribution: {
					excellent: 0,
					good: 0,
					average: 0,
					belowAverage: 0,
					poor: 0,
				},
		  };

	// Department statistics from API data
	const departmentStats =
		statsData?.statistics?.departmentStats?.reduce((acc, dept) => {
			acc[dept.department] = {
				totalMembers: dept.totalEntries,
				membersWithEntries: dept.totalEntries,
				averageScore: dept.averageScore,
				highestScore: dept.topScore,
			};
			return acc;
		}, {} as Record<string, any>) || {};

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
									ADMIN PERFORMANCE DASHBOARD
								</h1>
								<p className="text-sm text-red-700 font-medium drop-shadow-sm">
									PROJECT श्रेष्ठ | District Administration Raipur
								</p>
							</div>
						</div>

						<div className="flex items-center space-x-4">
							<Button
								onClick={() => router.push("/admin/users")}
								variant="outline"
								size="sm"
								className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-white/90 shadow-md">
								<Users className="w-4 h-4 mr-2" />
								Manage Users
							</Button>
							<Button
								onClick={() => router.push("/admin/departments")}
								variant="outline"
								size="sm"
								className="border-green-300 text-green-700 hover:bg-green-50 bg-white/90 shadow-md">
								<Building className="w-4 h-4 mr-2" />
								Manage Departments
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
				{/* Loading State */}
				{isLoading && (
					<div className="text-center py-8">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
						<p className="text-gray-600">Loading statistics...</p>
					</div>
				)}

				{/* Error State */}
				{error && (
					<div className="text-center py-8">
						<AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
						<p className="text-red-600">
							Error loading statistics. Please try again.
						</p>
					</div>
				)}

				{/* Content when data is loaded */}
				{!isLoading && !error && statsData && (
					<>
						{/* Performance Analytics */}
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
							<Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-l-4 border-emerald-600">
								<CardContent className="p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm text-emerald-700">Average Score</p>
											<p className="text-2xl font-bold text-emerald-800">
												{overallStats.averageScore.toFixed(1)}
											</p>
										</div>
										<TrendingUp className="w-8 h-8 text-emerald-600" />
									</div>
								</CardContent>
							</Card>

							<Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-600">
								<CardContent className="p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm text-blue-700">Total Employees</p>
											<p className="text-2xl font-bold text-blue-800">
												{overallStats.totalEmployees}
											</p>
										</div>
										<Users className="w-8 h-8 text-blue-600" />
									</div>
								</CardContent>
							</Card>

							<Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-l-4 border-amber-600">
								<CardContent className="p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm text-amber-700">
												Excellent Performers
											</p>
											<p className="text-2xl font-bold text-amber-800">
												{overallStats.excellentPerformers}
											</p>
										</div>
										<Award className="w-8 h-8 text-amber-600" />
									</div>
								</CardContent>
							</Card>

							<Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-l-4 border-slate-600">
								<CardContent className="p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm text-slate-700">Poor Performers</p>
											<p className="text-2xl font-bold text-slate-800">
												{overallStats.poorPerformers}
											</p>
										</div>
										<AlertTriangle className="w-8 h-8 text-slate-600" />
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Score Distribution */}
						<Card className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-500">
							<CardHeader className="bg-gradient-to-r from-purple-700 to-purple-800 text-white">
								<CardTitle className="text-lg flex items-center space-x-2">
									<BarChart3 className="w-5 h-5" />
									<span>📊 Score Distribution</span>
								</CardTitle>
							</CardHeader>
							<CardContent className="p-4">
								<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
									<div className="text-center">
										<div className="text-3xl font-bold text-emerald-700 mb-2">
											{overallStats.scoreDistribution.excellent}
										</div>
										<p className="text-sm text-emerald-600">Excellent (85%+)</p>
									</div>
									<div className="text-center">
										<div className="text-3xl font-bold text-blue-700 mb-2">
											{overallStats.scoreDistribution.good}
										</div>
										<p className="text-sm text-blue-600">Good (70-84%)</p>
									</div>
									<div className="text-center">
										<div className="text-3xl font-bold text-amber-700 mb-2">
											{overallStats.scoreDistribution.average}
										</div>
										<p className="text-sm text-amber-600">Average (50-69%)</p>
									</div>
									<div className="text-center">
										<div className="text-3xl font-bold text-red-700 mb-2">
											{overallStats.scoreDistribution.poor}
										</div>
										<p className="text-sm text-red-600">Poor (&lt;50%)</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Filters */}
						<Card className="mb-6">
							<CardContent className="p-4">
								<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
									<div>
										<Label
											htmlFor="search"
											className="text-sm font-medium text-slate-700 mb-2 block">
											Search Members
										</Label>
										<div className="relative">
											<Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
											<Input
												id="search"
												type="text"
												placeholder="Search by name, email or ID..."
												value={searchTerm}
												onChange={(e) => setSearchTerm(e.target.value)}
												className="pl-10"
											/>
										</div>
									</div>

									<div>
										<Label
											htmlFor="department"
											className="text-sm font-medium text-slate-700 mb-2 block">
											Filter by Department
										</Label>
										<Select
											value={departmentFilter}
											onValueChange={setDepartmentFilter}>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="All Departments" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">All Departments</SelectItem>
												{statsData?.availableFilters?.departments?.map(
													(dept) => (
														<SelectItem key={dept} value={dept}>
															{dept}
														</SelectItem>
													)
												)}
											</SelectContent>
										</Select>
									</div>

									<div>
										<Label
											htmlFor="role"
											className="text-sm font-medium text-slate-700 mb-2 block">
											Filter by Role
										</Label>
										<Select value={roleFilter} onValueChange={setRoleFilter}>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="All Roles" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">All Roles</SelectItem>
												{statsData?.availableFilters?.roles?.map((role) => (
													<SelectItem key={role} value={role}>
														{role}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div>
										<Label
											htmlFor="status"
											className="text-sm font-medium text-slate-700 mb-2 block">
											Filter by Status
										</Label>
										<Select
											value={statusFilter}
											onValueChange={setStatusFilter}>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="All Status" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="All">All Status</SelectItem>
												<SelectItem value="Completed">Completed</SelectItem>
												<SelectItem value="In Progress">In Progress</SelectItem>
												<SelectItem value="Pending">Pending</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Period Info */}
						<Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500">
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<h4 className="font-bold text-blue-800 mb-2">
											📊 Overall KPI Statistics Report
										</h4>
										<p className="text-sm text-blue-700">
											Comprehensive performance analysis across all departments
										</p>
									</div>
									<div className="text-right">
										<p className="text-lg font-bold text-blue-800">
											Overall Statistics
										</p>
										<p className="text-sm text-blue-600">Current Period</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Department Statistics */}
						<Card className="mb-6 bg-white/95 backdrop-blur-sm shadow-lg border-l-4 border-purple-600">
							<CardHeader className="bg-gradient-to-r from-purple-700 to-purple-800 text-white">
								<CardTitle className="text-lg flex items-center space-x-2">
									<Building className="w-5 h-5" />
									<span>🏢 Department-wise Statistics</span>
								</CardTitle>
							</CardHeader>
							<CardContent className="p-4">
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{Object.entries(departmentStats).map(
										([dept, stats]: [string, any]) => (
											<div
												key={dept}
												className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200">
												<h4 className="font-bold text-slate-800 mb-3 capitalize">
													{dept}
												</h4>
												<div className="space-y-2">
													<div className="flex justify-between">
														<span className="text-sm text-slate-600">
															Total Members:
														</span>
														<span className="font-bold text-slate-800">
															{stats.totalMembers}
														</span>
													</div>
													<div className="flex justify-between">
														<span className="text-sm text-slate-600">
															With Entries:
														</span>
														<span className="font-bold text-emerald-700">
															{stats.membersWithEntries}
														</span>
													</div>
													<div className="flex justify-between">
														<span className="text-sm text-slate-600">
															Average Score:
														</span>
														<span className="font-bold text-blue-700">
															{stats.averageScore.toFixed(1)}%
														</span>
													</div>
													<div className="flex justify-between">
														<span className="text-sm text-slate-600">
															Highest Score:
														</span>
														<span className="font-bold text-amber-700">
															{stats.highestScore.toFixed(1)}%
														</span>
													</div>
												</div>
											</div>
										)
									)}
								</div>
							</CardContent>
						</Card>

						{/* Top Performers */}
						<Card className="mb-6 bg-white/95 backdrop-blur-sm shadow-lg border-l-4 border-emerald-600">
							<CardHeader className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white">
								<CardTitle className="text-lg flex items-center space-x-2">
									<Award className="w-5 h-5" />
									<span className="uppercase">
										🏆 Top Performers Across All Departments
									</span>
								</CardTitle>
							</CardHeader>
							<CardContent className="p-4 space-y-4">
								{filteredMembers.slice(0, 5).map((member, index) => (
									<div
										key={member.entryId}
										className={`flex items-center space-x-3 p-3 rounded-lg ${
											index === 0
												? "bg-amber-50 border border-amber-200"
												: index === 1
												? "bg-slate-50 border border-slate-200"
												: "bg-orange-50 border border-orange-200"
										}`}>
										<div
											className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
												index === 0
													? "bg-amber-500"
													: index === 1
													? "bg-slate-400"
													: "bg-orange-500"
											}`}>
											{index + 1}
										</div>
										<div className="flex-1">
											<p className="font-bold text-slate-800 text-sm">
												{member.employee.name}
											</p>
											<p className="text-xs text-slate-600">
												{member.employee.contact.email}
											</p>
											<p className="text-xs text-slate-600 capitalize">
												{member.employee.department} •{" "}
												{member.employee.departmentRole}
											</p>
											<div
												className={`inline-block px-2 py-1 rounded-full text-xs font-bold mt-1 ${getScoreColor(
													member.score
												)}`}>
												{member.score.toFixed(1)}%
											</div>
										</div>
									</div>
								))}
							</CardContent>
						</Card>

						{/* Reports Table */}
						<Card className="shadow-lg">
							<CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
								<CardTitle className="text-lg flex items-center space-x-2">
									<FileText className="w-5 h-5" />
									<span>
										📋 All Department Performance Rankings (
										{filteredMembers.length})
									</span>
								</CardTitle>
							</CardHeader>
							<CardContent className="p-0">
								<Table>
									<TableHeader>
										<TableRow className="bg-slate-100">
											<TableHead className="font-bold text-slate-700">
												Ranking
											</TableHead>
											<TableHead className="font-bold text-slate-700">
												Member Details
											</TableHead>
											<TableHead className="font-bold text-slate-700 text-center">
												Department
											</TableHead>
											<TableHead className="font-bold text-slate-700 text-center">
												Role
											</TableHead>
											<TableHead className="font-bold text-slate-700 text-center">
												Score
											</TableHead>
											<TableHead className="font-bold text-slate-700 text-center">
												Status
											</TableHead>
											<TableHead className="font-bold text-slate-700 text-center">
												Actions
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{filteredMembers.map((member, index) => (
											<TableRow
												key={member.entryId}
												className={`${
													index % 2 === 0 ? "bg-white" : "bg-slate-50"
												} hover:bg-blue-50 transition-colors`}>
												<TableCell className="font-medium">
													<div className="flex items-center space-x-2">
														{index <= 3 ? (
															<Award
																className={`w-5 h-5 ${
																	index === 0
																		? "text-amber-500"
																		: index === 1
																		? "text-slate-400"
																		: "text-orange-500"
																}`}
															/>
														) : (
															<span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-slate-600">
																{index + 1}
															</span>
														)}
														<span className="text-slate-800">#{index + 1}</span>
													</div>
												</TableCell>
												<TableCell>
													<div>
														<h4 className="font-semibold text-slate-800">
															{member.employee.name}
														</h4>
														<p className="text-sm text-slate-600">
															{member.employee.contact.email}
														</p>
													</div>
												</TableCell>
												<TableCell className="text-center">
													<span className="text-sm text-slate-700 capitalize">
														{member.employee.department}
													</span>
												</TableCell>
												<TableCell className="text-center">
													<span className="text-sm text-slate-700 uppercase">
														{member.employee.departmentRole}
													</span>
												</TableCell>
												<TableCell className="text-center">
													<span
														className={`inline-block px-3 py-2 rounded-full text-sm font-bold ${getScoreColor(
															member.score
														)}`}>
														{member.score.toFixed(1)}%
													</span>
												</TableCell>
												<TableCell className="text-center">
													<Badge
														className={`font-bold ${getStatusColor(
															member.status
														)}`}>
														{member.status}
													</Badge>
												</TableCell>
												<TableCell className="text-center">
													<div className="flex items-center justify-center space-x-2">
														<Button
															onClick={() => handleViewDetails(member)}
															variant="outline"
															size="sm"
															className="border-blue-300 text-blue-700 hover:bg-blue-50">
															<Eye className="w-4 h-4" />
														</Button>
														<Button
															onClick={() => handleDownloadReport(member)}
															variant="outline"
															size="sm"
															className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
															<Download className="w-4 h-4" />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</CardContent>
						</Card>
					</>
				)}
			</div>

			{/* Member Detail Modal */}
			{showDetailModal && selectedMember && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
						<div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
							<h3 className="text-xl font-bold text-slate-800">
								Member Performance Details
							</h3>
							<button
								onClick={() => setShowDetailModal(false)}
								className="text-slate-500 hover:text-slate-700">
								<X className="w-6 h-6" />
							</button>
						</div>

						<div className="p-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
								<div>
									<h4 className="font-semibold text-slate-700 mb-2">
										Member Information
									</h4>
									<div className="space-y-2">
										<p>
											<span className="font-medium">Name:</span>{" "}
											{selectedMember.employee.name}
										</p>
										<p>
											<span className="font-medium">Email:</span>{" "}
											{selectedMember.employee.contact.email}
										</p>
										<p>
											<span className="font-medium">Department:</span>{" "}
											{selectedMember.employee.department}
										</p>
										<p>
											<span className="font-medium">Role:</span>{" "}
											{selectedMember.employee.departmentRole}
										</p>
										<p>
											<span className="font-medium">Employee ID:</span>{" "}
											{selectedMember.employee._id}
										</p>
									</div>
								</div>

								<div className="bg-slate-50 p-4 rounded-lg">
									<h4 className="font-semibold text-slate-700 mb-4">
										Performance Summary
									</h4>
									<div className="space-y-3">
										<div className="flex justify-between">
											<span className="text-slate-600">Ranking:</span>
											<span className="font-bold text-slate-800">
												#{selectedMember.rank}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-slate-600">Score:</span>
											<span
												className={`font-bold ${
													getScoreColor(selectedMember.score).split(" ")[0]
												}`}>
												{selectedMember.score.toFixed(1)}%
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-slate-600">Status:</span>
											<Badge
												className={`font-bold ${getStatusColor(
													selectedMember.status
												)}`}>
												{selectedMember.status}
											</Badge>
										</div>
									</div>
								</div>
							</div>

							<div className="mt-6 flex justify-end space-x-3">
								<Button
									onClick={() => handleDownloadReport(selectedMember)}
									variant="outline"
									className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
									<Download className="w-4 h-4 mr-2" />
									Download Report
								</Button>
								<Button
									onClick={() => setShowDetailModal(false)}
									className="bg-blue-600 hover:bg-blue-700">
									Close
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
