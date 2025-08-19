"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
	useStatistics,
	useDepartmentStatistics,
	useRoleStatistics,
	useTimeBasedStatistics,
	useFilteredStatistics,
	getTopPerformers,
	calculateScoreDistribution,
	StatisticsFilters,
} from "@/queries/statistics";
import { Trophy, TrendingUp, Users, Target } from "lucide-react";

export function StatisticsExample() {
	const [filters, setFilters] = useState<StatisticsFilters>({});

	// Fetch statistics with current filters
	const { data: statsData, isLoading, error } = useTimeBasedStatistics(8, 2025);

	if (isLoading) {
		return <div className="text-center py-8">Loading statistics...</div>;
	}

	if (error) {
		return (
			<div className="text-center py-8 text-red-600">
				Error loading statistics
			</div>
		);
	}

	if (!statsData) {
		return <div className="text-center py-8">No statistics available</div>;
	}

	const { statistics, ranking, availableFilters } = statsData;
	const topPerformers = getTopPerformers(ranking, 5);
	const scoreDistribution = calculateScoreDistribution(ranking);

	return (
		<div className="space-y-6">
			{/* Filters Section */}
			<Card>
				<CardHeader>
					<CardTitle>Statistics Filters</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div>
							<Label htmlFor="department">Department</Label>
							<Select
								value={filters.department || "all"}
								onValueChange={(value) =>
									setFilters((prev) => ({
										...prev,
										department: value === "all" ? undefined : value,
									}))
								}>
								<SelectTrigger>
									<SelectValue placeholder="All Departments" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Departments</SelectItem>
									{availableFilters.departments.map((dept) => (
										<SelectItem key={dept} value={dept}>
											{dept.toUpperCase()}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label htmlFor="role">Role</Label>
							<Select
								value={filters.role || "all"}
								onValueChange={(value) =>
									setFilters((prev) => ({
										...prev,
										role: value === "all" ? undefined : value,
									}))
								}>
								<SelectTrigger>
									<SelectValue placeholder="All Roles" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Roles</SelectItem>
									{availableFilters.roles.map((role) => (
										<SelectItem key={role} value={role}>
											{role}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label htmlFor="month">Month</Label>
							<Select
								value={filters.month?.toString() || "all"}
								onValueChange={(value) =>
									setFilters((prev) => ({
										...prev,
										month: value === "all" ? undefined : parseInt(value),
									}))
								}>
								<SelectTrigger>
									<SelectValue placeholder="All Months" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Months</SelectItem>
									{availableFilters.months.map((month) => (
										<SelectItem key={month} value={month.toString()}>
											{new Date(2024, month - 1, 1).toLocaleDateString(
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
								value={filters.year?.toString() || "all"}
								onValueChange={(value) =>
									setFilters((prev) => ({
										...prev,
										year: value === "all" ? undefined : parseInt(value),
									}))
								}>
								<SelectTrigger>
									<SelectValue placeholder="All Years" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Years</SelectItem>
									{availableFilters.years.map((year) => (
										<SelectItem key={year} value={year.toString()}>
											{year}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="mt-4">
						<Button variant="outline" onClick={() => setFilters({})}>
							Clear Filters
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Overall Statistics */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center space-x-2">
							<Users className="w-5 h-5 text-blue-500" />
							<div>
								<p className="text-sm text-gray-600">Total Entries</p>
								<p className="text-2xl font-bold">{statistics.totalEntries}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center space-x-2">
							<Target className="w-5 h-5 text-green-500" />
							<div>
								<p className="text-sm text-gray-600">Average Score</p>
								<p className="text-2xl font-bold">
									{statistics.averageScore.toFixed(1)}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center space-x-2">
							<TrendingUp className="w-5 h-5 text-purple-500" />
							<div>
								<p className="text-sm text-gray-600">Max Score</p>
								<p className="text-2xl font-bold">{statistics.maxScore}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center space-x-2">
							<TrendingUp className="w-5 h-5 text-orange-500" />
							<div>
								<p className="text-sm text-gray-600">Min Score</p>
								<p className="text-2xl font-bold">{statistics.minScore}</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Top Performers */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<Trophy className="w-5 h-5 text-yellow-500" />
						<span>Top Performers</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{topPerformers.map((entry, index) => (
							<div
								key={entry.entryId}
								className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
								<div className="flex items-center space-x-3">
									<div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
										<span className="text-sm font-bold text-yellow-600">
											{entry.rank}
										</span>
									</div>
									<div>
										<p className="font-medium">{entry.employee.name}</p>
										<p className="text-sm text-gray-600">
											{entry.employee.departmentRole} •{" "}
											{entry.employee.department}
										</p>
									</div>
								</div>
								<div className="text-right">
									<p className="text-lg font-bold text-green-600">
										{entry.score}
									</p>
									<p className="text-xs text-gray-500">Score</p>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Score Distribution */}
			<Card>
				<CardHeader>
					<CardTitle>Score Distribution</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
						<div className="text-center">
							<div className="text-2xl font-bold text-green-600">
								{scoreDistribution.excellent}
							</div>
							<div className="text-sm text-gray-600">Excellent (90-100)</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-blue-600">
								{scoreDistribution.good}
							</div>
							<div className="text-sm text-gray-600">Good (80-89)</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-yellow-600">
								{scoreDistribution.average}
							</div>
							<div className="text-sm text-gray-600">Average (70-79)</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-orange-600">
								{scoreDistribution.belowAverage}
							</div>
							<div className="text-sm text-gray-600">Below Avg (60-69)</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-red-600">
								{scoreDistribution.poor}
							</div>
							<div className="text-sm text-gray-600">Poor (0-59)</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
