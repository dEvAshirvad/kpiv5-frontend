"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useCurrentMember } from "@/queries/auth";
import { splitRole } from "@/lib/utils";

interface AuthProviderProps {
	children: React.ReactNode;
}

// Public routes that don't require authentication
const publicRoutes = ["/", "/login"];

export default function AuthProvider({ children }: AuthProviderProps) {
	const { isAuthenticated, isLoading, error } = useAuth();
	const { data: currentMember } = useCurrentMember();
	const router = useRouter();
	const pathname = usePathname();

	// Check if current route is public
	const isPublicRoute = publicRoutes.includes(pathname);

	useEffect(() => {
		// Only redirect if not loading and authentication state is determined
		if (!isLoading) {
			// If not authenticated and not on a public route, redirect to login
			if (!isAuthenticated && !isPublicRoute) {
				router.push("/login");
			}

			// If authenticated and on login page, redirect to appropriate dashboard
			if (isAuthenticated && isPublicRoute && currentMember) {
				if (currentMember.member.role === "admin") {
					router.push("/admin");
				} else {
					const [userRole, departmentRole] =
						currentMember.member.role.split("-");
					router.push(
						`/kpi-entry/${currentMember.member.departmentSlug}/${departmentRole}`
					);
				}
			}
		}
	}, [isLoading, isAuthenticated, isPublicRoute, currentMember, router]);

	// Show loading spinner while checking authentication
	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-blue-50">
				<div className="text-center">
					<Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
					<p className="text-slate-600">Loading...</p>
				</div>
			</div>
		);
	}

	// Show error state
	if (error && !isPublicRoute) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-blue-50">
				<div className="text-center">
					<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg
							className="w-8 h-8 text-red-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
							/>
						</svg>
					</div>
					<h3 className="text-lg font-medium text-slate-800 mb-2">
						Authentication Error
					</h3>
					<p className="text-slate-600 mb-4">
						There was an error verifying your authentication status.
					</p>
					<button
						onClick={() => router.push("/login")}
						className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
						Go to Login
					</button>
				</div>
			</div>
		);
	}

	// Allow access to public routes or authenticated users
	if (isPublicRoute || isAuthenticated) {
		return <>{children}</>;
	}

	// This should not be reached, but just in case
	return null;
}
