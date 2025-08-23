"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/queries/auth";
import { Loader2, AlertCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RoleProtectedRouteProps {
	children: React.ReactNode;
	allowedRoles?: string[];
	allowedDepartments?: string[];
	allowedDepartmentRoles?: string[];
	fallbackComponent?: React.ReactNode;
	redirectTo?: string;
	showAccessDenied?: boolean;
}

export default function RoleProtectedRoute({
	children,
	allowedRoles = [],
	allowedDepartments = [],
	allowedDepartmentRoles = [],
	fallbackComponent,
	redirectTo = "/login",
	showAccessDenied = true,
}: RoleProtectedRouteProps) {
	const router = useRouter();
	const {
		data: session,
		isLoading: sessionLoading,
		error: sessionError,
		isFetched: sessionFetched,
	} = useSession();
	const [hasAccess, setHasAccess] = useState<boolean | null>(null);

	// Check access permissions
	useEffect(() => {
		if (!sessionLoading && sessionFetched && session) {
			const user = session.user;
			let access = false;

			// Check if user has any of the allowed roles
			if (allowedRoles.length > 0) {
				access = allowedRoles.some((role) => user.role === role);
			}

			// Check if user belongs to any of the allowed departments
			if (!access && allowedDepartments.length > 0) {
				access = allowedDepartments.some((dept) => user.department === dept);
			}

			// Check if user has any of the allowed department roles
			if (!access && allowedDepartmentRoles.length > 0) {
				access = allowedDepartmentRoles.some(
					(deptRole) => user.departmentRole === deptRole
				);
			}

			// If no specific restrictions, allow access
			if (
				allowedRoles.length === 0 &&
				allowedDepartments.length === 0 &&
				allowedDepartmentRoles.length === 0
			) {
				access = true;
			}

			setHasAccess(access);

			// Redirect if no access and redirectTo is specified
			if (!access && redirectTo) {
				router.push(redirectTo);
			}
		}
	}, [
		session,
		sessionLoading,
		allowedRoles,
		allowedDepartments,
		allowedDepartmentRoles,
		redirectTo,
		sessionFetched,
		router,
	]);

	// Show loading while checking session
	if (sessionLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex items-center justify-center">
				<div className="text-center">
					<Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
					<p className="text-slate-600">Checking permissions...</p>
				</div>
			</div>
		);
	}

	// Show error if session failed to load
	if (sessionError) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex items-center justify-center">
				<div className="text-center">
					<AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
					<p className="text-red-600 mb-4">
						Authentication error: {sessionError.message}
					</p>
					<Button
						onClick={() => router.push("/login")}
						className="bg-blue-600 hover:bg-blue-700">
						Go to Login
					</Button>
				</div>
			</div>
		);
	}

	// Show login prompt if no session
	if (!session) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex items-center justify-center">
				<div className="text-center">
					<AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-4" />
					<p className="text-yellow-600 mb-4">No active session found</p>
					<Button
						onClick={() => router.push("/login")}
						className="bg-blue-600 hover:bg-blue-700">
						Go to Login
					</Button>
				</div>
			</div>
		);
	}

	// Show access denied if user doesn't have required permissions
	if (hasAccess === false && showAccessDenied) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 flex items-center justify-center">
				<Card className="w-full max-w-md">
					<CardHeader className="text-center">
						<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<Shield className="w-8 h-8 text-red-600" />
						</div>
						<CardTitle className="text-xl text-red-800">
							Access Denied
						</CardTitle>
					</CardHeader>
					<CardContent className="text-center">
						<p className="text-gray-600 mb-4">
							You don't have permission to access this page.
						</p>
						<div className="space-y-2 text-sm text-gray-500 mb-6">
							<p>
								<strong>Your Role:</strong> {session.user.role}
							</p>
							<p>
								<strong>Department:</strong> {session.user.department}
							</p>
							<p>
								<strong>Department Role:</strong> {session.user.departmentRole}
							</p>
						</div>
						<div className="flex space-x-3">
							<Button
								variant="outline"
								onClick={() => router.back()}
								className="flex-1">
								Go Back
							</Button>
							<Button
								onClick={() => router.push("/login")}
								className="flex-1 bg-blue-600 hover:bg-blue-700">
								Login as Different User
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Show custom fallback component if provided
	if (hasAccess === false && fallbackComponent) {
		return <>{fallbackComponent}</>;
	}

	// Render children if user has access
	if (hasAccess === true) {
		return <>{children}</>;
	}

	// Default fallback (should not be reached)
	return null;
}
