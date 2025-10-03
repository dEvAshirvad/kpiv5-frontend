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
	TrendingUp,
	BarChart3,
	X,
	Users,
	Award,
	Building,
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
	StatisticsFilters,
	RankingEntry,
	useAvailableFilters,
	useAllDepartmentStats,
} from "@/queries/statistics";

export default function AdminPage() {
	const router = useRouter();
	const [searchTerm, setSearchTerm] = React.useState("");
	const [departmentFilter, setDepartmentFilter] = React.useState("all");
	const [roleFilter, setRoleFilter] = React.useState("all");
	const [statusFilter, setStatusFilter] = React.useState("all");
	// Default: month = currentMonth - 1 (so if Oct -> 9), year = current year
	const now = new Date();
	const defaultMonth = Math.max(1, now.getMonth()); // getMonth() is 0-based; previous month number
	const defaultYear = now.getFullYear().toString();
	const [monthFilter, setMonthFilter] = React.useState<string>(
		String(defaultMonth)
	);
	const [yearFilter, setYearFilter] = React.useState<string>(defaultYear);
	const [page, setPage] = React.useState<number>(1);
	const [limit, setLimit] = React.useState<number>(20);
	const [selectedMember, setSelectedMember] =
		React.useState<RankingEntry | null>(null);
	const [showDetailModal, setShowDetailModal] = React.useState(false);
	const signOutMutation = useSignOut();

	// Build statistics filters synchronously when all required values are present
	const computedStatsFilters: StatisticsFilters | null = React.useMemo(() => {
		if (
			departmentFilter !== "all" &&
			roleFilter !== "all" &&
			monthFilter &&
			yearFilter
		) {
			return {
				department: departmentFilter,
				role: roleFilter,
				month: parseInt(monthFilter, 10),
				year: parseInt(yearFilter, 10),
				page,
				limit,
			};
		}
		return null;
	}, [departmentFilter, roleFilter, monthFilter, yearFilter, page, limit]);

	// Fetch statistics data
	const {
		data: statsData,
		isLoading,
		error,
	} = useStatistics({
		filters: computedStatsFilters || undefined,
		enabled: Boolean(computedStatsFilters),
	});

	const {
		data: availableAllFiltersData,
		isLoading: isAllFiltersLoading,
		error: allFiltersError,
	} = useAvailableFilters("all");

	// Fetch available filters independently of statistics
	const {
		data: availableFiltersData,
		isLoading: isFiltersLoading,
		error: filtersError,
	} = useAvailableFilters(
		departmentFilter !== "all" ? departmentFilter : undefined
	);

	// Removed effect-based sync to avoid an intermediate empty-fetch

	const handleLogout = () => {
		console.log("Logout clicked");
		signOutMutation.mutate(undefined, {
			onSuccess: () => {
				router.push("/login");
			},
		});
	};

	const handleViewDetails = (member: RankingEntry) => {
		console.log("View details for:", member.employee?.name || "Unknown");
		setSelectedMember(member);
		setShowDetailModal(true);
	};

	const handleDownloadReport = (member: RankingEntry) => {
		console.log("Download report for:", member.employee?.name || "Unknown");
		const reportContent = `
KPI Performance Report - Overall Statistics
Department: ${member.employee?.department || "Unknown"}
Role: ${member.employee?.departmentRole || "Unknown"}

Member Details:
Name: ${member.employee?.name || "Unknown"}
Email: ${member.employee?.contact?.email || "Unknown"}
Department: ${member.employee?.department || "Unknown"}
Role: ${member.employee?.departmentRole || "Unknown"}

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
		a.download = `kpi-report-${member.employee?.name || "unknown"}.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const getScoreColor = (score: number, maxScore?: number) => {
		const pct = maxScore && maxScore > 0 ? (score / maxScore) * 100 : score;
		if (pct >= 85) return "text-emerald-700 bg-emerald-100";
		if (pct >= 70) return "text-blue-700 bg-blue-100";
		if (pct >= 60) return "text-amber-700 bg-amber-100";
		if (pct >= 50) return "text-orange-700 bg-orange-100";
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
				(member.employee?.name?.toLowerCase() || "").includes(
					searchTerm.toLowerCase()
				) ||
				(member.employee?.contact?.email?.toLowerCase() || "").includes(
					searchTerm.toLowerCase()
				);

			const matchesDepartment =
				departmentFilter === "all" ||
				member.employee?.department === departmentFilter;

			const matchesRole =
				roleFilter === "all" || member.employee?.departmentRole === roleFilter;

			const matchesStatus =
				statusFilter === "all" || member.status === statusFilter;

			return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
		}) || [];

	// Determine if we should show detailed KPI names (when department and role are selected)
	const showDetailedKpiNames =
		departmentFilter !== "all" && roleFilter !== "all";

	// Get unique KPI name labels from the data
	const uniqueKpiLabels = React.useMemo(() => {
		if (!statsData?.ranking) return [];

		const allLabels = new Set<string>();
		statsData.ranking.forEach((member) => {
			member.kpiNames?.forEach((kpi) => {
				allLabels.add(kpi.label);
			});
		});

		return Array.from(allLabels).sort();
	}, [statsData?.ranking]);

	// Calculate statistics from API data (scores are absolute, not percentages)
	const computeRawScoreDistribution = React.useCallback(
		(scores: number[], maxScore: number) => {
			if (scores.length === 0 || maxScore <= 0) {
				return { excellent: 0, good: 0, average: 0, belowAverage: 0, poor: 0 };
			}
			const dist = {
				excellent: 0,
				good: 0,
				average: 0,
				belowAverage: 0,
				poor: 0,
			};
			scores.forEach((s) => {
				const pct = (s / maxScore) * 100;
				if (pct >= 85) dist.excellent++;
				else if (pct >= 70) dist.good++;
				else if (pct >= 60) dist.average++;
				else if (pct >= 50) dist.belowAverage++;
				else dist.poor++;
			});
			return dist;
		},
		[]
	);

	const overallStats = statsData?.statistics
		? {
				averageScore: statsData.statistics.averageScore,
				totalEmployees: statsData.statistics.totalEntries,
				excellentPerformers:
					statsData.statistics.scoreDistribution?.counts?.excellent ?? 0,
				poorPerformers:
					statsData.statistics.scoreDistribution?.counts?.poor ?? 0,
				scoreDistribution: {
					excellent:
						statsData.statistics.scoreDistribution?.counts?.excellent ?? 0,
					good: statsData.statistics.scoreDistribution?.counts?.good ?? 0,
					average: statsData.statistics.scoreDistribution?.counts?.average ?? 0,
					belowAverage:
						// Not provided explicitly; derive from percentages/buckets if needed
						0,
					poor: statsData.statistics.scoreDistribution?.counts?.poor ?? 0,
				},
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

	// Dynamic labels from API buckets for distribution
	const distributionLabels = React.useMemo(() => {
		const b = statsData?.statistics?.scoreDistribution?.buckets;
		return {
			excellent: b?.excellent ? `Excellent` : "Excellent",
			good: b?.good ? `Good` : "Good",
			average: b?.average ? `Average` : "Average",
			poor: b?.poor ? `Poor` : "Poor",
		};
	}, [statsData?.statistics?.scoreDistribution?.buckets]);

	// Department statistics from API data (optional in new API)
	// Department-wise cards now driven by all-department-stats API with pagination
	const deptPageSize = 6;
	const [deptPage, setDeptPage] = React.useState(1);
	const allDeptFilters = React.useMemo(() => {
		const m = parseInt(monthFilter, 10);
		const y = parseInt(yearFilter, 10);
		if (!m || !y) return null;
		return { month: m, year: y, page: deptPage, limit: deptPageSize };
	}, [monthFilter, yearFilter, deptPage]);
	const { data: allDeptData } = useAllDepartmentStats(allDeptFilters);

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

				<Card className="mb-6">
					<CardContent className="p-4">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
										{availableFiltersData?.availableFilters?.departments?.map(
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
										{availableFiltersData?.availableFilters?.roles?.map(
											(role) => (
												<SelectItem key={role} value={role}>
													{role}
												</SelectItem>
											)
										)}
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label
									htmlFor="month"
									className="text-sm font-medium text-slate-700 mb-2 block">
									Month
								</Label>
								<Select value={monthFilter} onValueChange={setMonthFilter}>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select Month" />
									</SelectTrigger>
									<SelectContent>
										{(
											availableFiltersData?.availableFilters?.months || [
												1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
											]
										).map((m) => (
											<SelectItem key={m} value={String(m)}>
												{m}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label
									htmlFor="year"
									className="text-sm font-medium text-slate-700 mb-2 block">
									Year
								</Label>
								<Select value={yearFilter} onValueChange={setYearFilter}>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select Year" />
									</SelectTrigger>
									<SelectContent>
										{(
											availableFiltersData?.availableFilters?.years || [
												2024, 2025,
											]
										).map((y) => (
											<SelectItem key={y} value={String(y)}>
												{y}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					</CardContent>
				</Card>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
					<Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-l-4 border-emerald-600">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-emerald-700">Total Entries</p>
									<p className="text-2xl font-bold text-emerald-800">
										{availableAllFiltersData?.summary?.totalEntries || 0}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-600">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-blue-700">Total Departments</p>
									<p className="text-2xl font-bold text-blue-800">
										{availableAllFiltersData?.summary?.totalDepartments || 0}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-l-4 border-amber-600">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-amber-700">Total Roles</p>
									<p className="text-2xl font-bold text-amber-800">
										{availableAllFiltersData?.summary?.totalRoles || 0}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-l-4 border-slate-600">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-slate-700">Month</p>
									<p className="text-2xl font-bold text-slate-800">
										{new Date(
											parseInt(yearFilter),
											parseInt(monthFilter) - 1,
											1
										).toLocaleDateString("en-US", { month: "long" })}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

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
							{(allDeptData?.stats || []).map((dept) => (
								<div
									key={dept.department}
									className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200">
									<h4 className="font-bold text-slate-800 mb-3 capitalize">
										{dept.department}
									</h4>
									<div className="space-y-2">
										<div className="flex justify-between">
											<span className="text-sm text-slate-600">
												Total Entries:
											</span>
											<span className="font-bold text-slate-800">
												{dept.totalEntries}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-sm text-slate-600">
												Average Score:
											</span>
											<span className="font-bold text-blue-700">
												{dept.averageScore.toFixed(2)}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-sm text-slate-600">Max Score:</span>
											<span className="font-bold text-emerald-700">
												{dept.maxScore.toFixed(2)}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-sm text-slate-600">Min Score:</span>
											<span className="font-bold text-amber-700">
												{dept.minScore.toFixed(2)}
											</span>
										</div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

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
												{overallStats.averageScore.toFixed(2)}
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
											<p className="text-sm text-blue-700">Total Entries</p>
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
										<p className="text-sm text-emerald-600">
											{distributionLabels.excellent}
										</p>
									</div>
									<div className="text-center">
										<div className="text-3xl font-bold text-blue-700 mb-2">
											{overallStats.scoreDistribution.good}
										</div>
										<p className="text-sm text-blue-600">
											{distributionLabels.good}
										</p>
									</div>
									<div className="text-center">
										<div className="text-3xl font-bold text-amber-700 mb-2">
											{overallStats.scoreDistribution.average}
										</div>
										<p className="text-sm text-amber-600">
											{distributionLabels.average}
										</p>
									</div>
									<div className="text-center">
										<div className="text-3xl font-bold text-red-700 mb-2">
											{overallStats.scoreDistribution.poor}
										</div>
										<p className="text-sm text-red-600">
											{distributionLabels.poor}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Filters */}

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

						{/* Top Performers */}
						<Card className="mb-6 bg-white/95 backdrop-blur-sm shadow-lg border-l-4 border-emerald-600">
							<CardHeader className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white">
								<CardTitle className="text-lg flex items-center space-x-2">
									<Award className="w-5 h-5" />
									<span className="uppercase">
										🏆 Top Performers Across {departmentFilter}
									</span>
								</CardTitle>
							</CardHeader>
							<CardContent className="p-4 space-y-4">
								{(statsData.topFivePercent || filteredMembers.slice(0, 5)).map(
									(member, index) => (
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
													{member.employee?.name || "Unknown"}
												</p>
												<p className="text-xs text-slate-600">
													{member.employee?.contact?.email || "No email"}
												</p>
												<p className="text-xs text-slate-600 capitalize">
													{member.employee?.department || "Unknown"} •{" "}
													{member.employee?.departmentRole || "Unknown"}
												</p>
												<div
													className={`inline-block px-2 py-1 rounded-full text-xs font-bold mt-1 ${getScoreColor(
														member.score,
														statsData.statistics.maxScore
													)}`}>
													{member.score.toFixed(1)}
												</div>
											</div>
										</div>
									)
								)}
							</CardContent>
						</Card>

						{/* Reports Table */}
						<Card className="shadow-lg">
							<CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
								<CardTitle className="text-lg flex items-center space-x-2">
									<FileText className="w-5 h-5" />
									<span className="uppercase">
										📋 {departmentFilter} Performance Rankings (
										{statsData.pagination.totalItems})
									</span>
								</CardTitle>
							</CardHeader>
							<CardContent className="p-0">
								{statsData?.pagination && (
									<div className="flex items-center justify-between p-4 text-sm text-slate-700">
										<div>
											Page {statsData.pagination.currentPage} of{" "}
											{statsData.pagination.totalPages}
										</div>
										<div className="space-x-2">
											<Button
												variant="outline"
												size="sm"
												disabled={page === 1 || isLoading}
												onClick={() => setPage(1)}>
												First
											</Button>
											<Button
												variant="outline"
												size="sm"
												disabled={
													!statsData.pagination.hasPreviousPage || isLoading
												}
												onClick={() => setPage((p) => Math.max(1, p - 1))}>
												Previous
											</Button>
											<Button
												variant="outline"
												size="sm"
												disabled={
													!statsData.pagination.hasNextPage || isLoading
												}
												onClick={() => setPage((p) => p + 1)}>
												Next
											</Button>
											<Button
												variant="outline"
												size="sm"
												disabled={
													page === statsData.pagination.totalPages || isLoading
												}
												onClick={() =>
													setPage(statsData.pagination.totalPages)
												}>
												Last
											</Button>
										</div>
									</div>
								)}
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
												Division
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
														{statsData.pagination.itemsPerPage *
															(statsData.pagination.currentPage - 1) +
															index +
															1 <=
														3 ? (
															<Award
																className={`w-5 h-5 ${
																	statsData.pagination.itemsPerPage *
																		(statsData.pagination.currentPage - 1) +
																		index +
																		1 ===
																	1
																		? "text-amber-500"
																		: statsData.pagination.itemsPerPage *
																				(statsData.pagination.currentPage - 1) +
																				index +
																				1 ===
																		  2
																		? "text-slate-400"
																		: "text-orange-500"
																}`}
															/>
														) : (
															<span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-slate-600">
																{statsData.pagination.itemsPerPage *
																	(statsData.pagination.currentPage - 1) +
																	index +
																	1}
															</span>
														)}
														<span className="text-slate-800">
															#
															{statsData.pagination.itemsPerPage *
																(statsData.pagination.currentPage - 1) +
																index +
																1}
														</span>
													</div>
												</TableCell>
												<TableCell>
													<div>
														<h4 className="font-semibold text-slate-800">
															{member.employee?.name || "Unknown"}
														</h4>
														<p className="text-sm text-slate-600">
															{member.employee?.contact?.email || "No email"}
														</p>
													</div>
												</TableCell>
												<TableCell className="text-center">
													<span className="text-sm text-slate-700 capitalize">
														{member.employee?.department || "Unknown"}
													</span>
												</TableCell>
												<TableCell className="text-center">
													<span className="text-sm text-slate-700 uppercase">
														{member.employee?.departmentRole || "Unknown"}
													</span>
												</TableCell>

												<TableCell className="text-center">
													<span className="text-sm text-slate-700 font-medium">
														{member.kpiNames?.[0]?.value || "-"}
													</span>
												</TableCell>

												<TableCell className="text-center">
													<span
														className={`inline-block px-3 py-2 rounded-full text-sm font-bold ${getScoreColor(
															member.score,
															statsData.statistics.maxScore
														)}`}>
														{member.score.toFixed(2)}
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

						{/* Bottom Performers */}
						<Card className="mb-6 mt-6 bg-white/95 backdrop-blur-sm shadow-lg border-l-4 border-emerald-600">
							<CardHeader className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white">
								<CardTitle className="text-lg flex items-center space-x-2">
									<span className="uppercase">
										Bottom Performers Across {departmentFilter}
									</span>
								</CardTitle>
							</CardHeader>
							<CardContent className="p-4 space-y-4">
								{(
									statsData.bottomFivePercent || filteredMembers.slice(0, 5)
								).map((member, index) => (
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
												{member.employee?.name || "Unknown"}
											</p>
											<p className="text-xs text-slate-600">
												{member.employee?.contact?.email || "No email"}
											</p>
											<p className="text-xs text-slate-600 capitalize">
												{member.employee?.department || "Unknown"} •{" "}
												{member.employee?.departmentRole || "Unknown"}
											</p>
											<div
												className={`inline-block px-2 py-1 rounded-full text-xs font-bold mt-1 ${getScoreColor(
													member.score,
													statsData.statistics.maxScore
												)}`}>
												{member.score.toFixed(1)}
											</div>
										</div>
									</div>
								))}
							</CardContent>
						</Card>
					</>
				)}
			</div>

			{/* Member Detail Modal */}
			{showDetailModal && selectedMember && (
				<div className="fixed inset-0 mt-16 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
											{selectedMember.employee?.name || "Unknown"}
										</p>
										<p>
											<span className="font-medium">Email:</span>{" "}
											{selectedMember.employee?.contact?.email || "No email"}
										</p>
										<p>
											<span className="font-medium">Department:</span>{" "}
											{selectedMember.employee?.department || "Unknown"}
										</p>
										<p>
											<span className="font-medium">Role:</span>{" "}
											{selectedMember.employee?.departmentRole || "Unknown"}
										</p>
										<p>
											<span className="font-medium">Employee ID:</span>{" "}
											{selectedMember.employee?._id || "Unknown"}
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
