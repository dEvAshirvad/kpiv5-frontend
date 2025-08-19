import Header from "@/components/header";
import React from "react";

function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
			<Header />
			{children}
		</div>
	);
}

export default AuthLayout;
