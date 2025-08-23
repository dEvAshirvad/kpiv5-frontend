import React from "react";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";

function NodalLayout({ children }: { children: React.ReactNode }) {
	return (
		<RoleProtectedRoute
			allowedDepartmentRoles={["nodalOfficer"]}
			redirectTo="/login"
			showAccessDenied={true}>
			{children}
		</RoleProtectedRoute>
	);
}

export default NodalLayout;
