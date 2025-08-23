import Header from "@/components/header";
import React from "react";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";

function AdminLayout({ children }: { children: React.ReactNode }) {
	return (
		<RoleProtectedRoute
			allowedRoles={["admin"]}
			redirectTo="/login"
			showAccessDenied={true}>
			{children}
		</RoleProtectedRoute>
	);
}

export default AdminLayout;
