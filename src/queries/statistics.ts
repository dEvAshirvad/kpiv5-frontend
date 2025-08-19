import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/axios";

// Types for Statistics API
export interface StatisticsFilters {
	department?: string;
	role?: string;
	month?: number;
	year?: number;
}

export interface DepartmentStat {
	department: string;
	totalEntries: number;
	averageScore: number;
	topScore: number;
}

export interface RoleStat {
	role: string;
	totalEntries: number;
	averageScore: number;
	topScore: number;
}

export interface StatisticsData {
	totalEntries: number;
	averageScore: number;
	maxScore: number;
	minScore: number;
	departmentStats: DepartmentStat[];
	roleStats: RoleStat[];
}

export interface AvailableFilters {
	departments: string[];
	roles: string[];
	months: number[];
	years: number[];
}

export interface RankingEntry {
	rank: number;
	entryId: string;
	employee: {
		_id: string;
		name: string;
		contact: {
			email: string;
			phone: string;
		};
		department: string;
		departmentRole: string;
	};
	template: {
		_id: string;
		name: string;
		description: string;
		role: string;
		frequency: string;
		departmentSlug: string;
	};
	month: number;
	year: number;
	score: number;
	status: string;
	kpiNames: Array<{
		label: string;
		value: string;
	}>;
	values: Array<{
		key: string;
		value: number;
		score: number;
		subKpis: Array<{
			key: string;
			value: number;
		}>;
	}>;
	createdAt: string;
	updatedAt: string;
}

export interface StatisticsResponse {
	success: boolean;
	message: string;
	filters: StatisticsFilters;
	statistics: StatisticsData;
	availableFilters: AvailableFilters;
	ranking: RankingEntry[];
}

// API function to fetch statistics
export const getStatistics = async (
	filters: StatisticsFilters = {}
): Promise<StatisticsResponse> => {
	const params = new URLSearchParams();

	if (filters.department) params.append("department", filters.department);
	if (filters.role) params.append("role", filters.role);
	if (filters.month) params.append("month", filters.month.toString());
	if (filters.year) params.append("year", filters.year.toString());

	const queryString = params.toString();
	const url = `/v1/entries/statistics${queryString ? `?${queryString}` : ""}`;

	const response = await authApi.get(url);
	return response.data;
};

// React Query hook for statistics
export const useStatistics = ({
	filters,
	enabled,
}: {
	filters?: StatisticsFilters | null;
	enabled: boolean;
}) => {
	return useQuery({
		queryKey: ["statistics", filters],
		queryFn: () => getStatistics(filters || {}),
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
};

// Hook for department-specific statistics
export const useDepartmentStatistics = (department: string | null) => {
	return useStatistics({
		filters: department ? { department } : undefined,
		enabled: department !== null,
	});
};

// Hook for role-specific statistics
export const useRoleStatistics = (role: string | null) => {
	return useStatistics({
		filters: role ? { role } : undefined,
		enabled: role !== null,
	});
};

// Hook for time-based statistics
export const useTimeBasedStatistics = (month: number, year: number) => {
	return useStatistics({ filters: { month, year }, enabled: true });
};

// Hook for combined filters statistics
export const useFilteredStatistics = (filters: StatisticsFilters) => {
	return useStatistics({ filters, enabled: true });
};

// Utility functions for statistics
export const getTopPerformers = (
	ranking: RankingEntry[],
	limit: number = 10
) => {
	return ranking.slice(0, limit);
};

export const getDepartmentTopPerformers = (
	ranking: RankingEntry[],
	department: string,
	limit: number = 5
) => {
	return ranking
		.filter((entry) => entry.employee.department === department)
		.slice(0, limit);
};

export const getRoleTopPerformers = (
	ranking: RankingEntry[],
	role: string,
	limit: number = 5
) => {
	return ranking
		.filter((entry) => entry.employee.departmentRole === role)
		.slice(0, limit);
};

export const calculateScoreDistribution = (ranking: RankingEntry[]) => {
	const distribution = {
		excellent: 0, // 90-100
		good: 0, // 80-89
		average: 0, // 70-79
		belowAverage: 0, // 60-69
		poor: 0, // 0-59
	};

	ranking.forEach((entry) => {
		const score = entry.score;
		if (score >= 90) distribution.excellent++;
		else if (score >= 80) distribution.good++;
		else if (score >= 70) distribution.average++;
		else if (score >= 60) distribution.belowAverage++;
		else distribution.poor++;
	});

	return distribution;
};

export const getScoreTrends = (ranking: RankingEntry[]) => {
	const trends = ranking.reduce((acc, entry) => {
		const key = `${entry.year}-${entry.month.toString().padStart(2, "0")}`;
		if (!acc[key]) {
			acc[key] = {
				period: key,
				totalEntries: 0,
				averageScore: 0,
				totalScore: 0,
			};
		}
		acc[key].totalEntries++;
		acc[key].totalScore += entry.score;
		acc[key].averageScore = acc[key].totalScore / acc[key].totalEntries;
		return acc;
	}, {} as Record<string, { period: string; totalEntries: number; averageScore: number; totalScore: number }>);

	return Object.values(trends).sort((a, b) => a.period.localeCompare(b.period));
};
