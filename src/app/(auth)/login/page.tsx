"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { User, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useSession, useSignIn } from "@/queries/auth";
import { useRouter } from "next/navigation";

const formSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
});

function LoginPage() {
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();
	const signInMutation = useSignIn();
	const [enabled, setEnabled] = useState(false);
	const { data: session, isLoading: isSessionLoading } = useSession(enabled);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		setError(null);

		try {
			const result = await signInMutation.mutateAsync({
				email: data.email,
				password: data.password,
			});
			setEnabled(true);
		} catch (error: any) {
			console.error("Login failed:", error);
			setError(
				error.response?.data?.message ||
					error.message ||
					"Login failed. Please check your credentials and try again."
			);
		}
	};

	useEffect(() => {
		if (session && !isSessionLoading) {
			if (session.user.departmentRole === "nodalOfficer") {
				router.push(`/${session.user.department}/users`);
			} else if (session.user.department === "collector-office") {
				router.push("/admin");
			} else {
				router.push("/");
			}
		}
	}, [session]);

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
				{/* Sidebar */}
				<div className="lg:col-span-1">
					<Sidebar />
				</div>

				{/* Login Card */}
				<div className="lg:col-span-3">
					<div className="relative mb-8">
						<div className="bg-gradient-to-r from-emerald-600 via-blue-700 to-slate-700 rounded-lg p-8 text-white relative overflow-hidden shadow-xl">
							<div className="absolute inset-0 bg-black/20" />
							<div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
								<div>
									<h2 className="text-4xl font-bold mb-4">
										Project <br />
										<span className="text-amber-300">Shrestha</span>
									</h2>
									<p className="text-lg mb-2">KPI Portal</p>
									<p className="text-sm">KPI Portal for Chhattisgarh</p>
								</div>

								{/* Login Form */}
								<Card className="bg-white/95 backdrop-blur-sm shadow-2xl p-0 rounded-lg">
									<CardHeader className="bg-gradient-to-r from-slate-700 py-4 to-slate-800 text-white rounded-t-lg text-center">
										<CardTitle className="text-xl font-bold">
											Secure Login Portal
										</CardTitle>
										<p className="text-slate-200 text-sm">
											Government Officials & Citizens
										</p>
									</CardHeader>
									<CardContent className="p-6">
										<Form {...form}>
											<form
												onSubmit={form.handleSubmit(onSubmit)}
												className="space-y-4">
												<FormField
													control={form.control}
													name="email"
													render={({ field }) => (
														<FormItem>
															<div>
																<FormLabel
																	htmlFor="username"
																	className="text-sm font-medium text-slate-700">
																	Username / Email ID
																</FormLabel>
																<div className="relative">
																	<User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
																	<Input
																		id="username"
																		{...field}
																		required
																		placeholder="Enter your username"
																		className="pl-10"
																	/>
																</div>
															</div>
														</FormItem>
													)}
												/>

												<FormField
													control={form.control}
													name="password"
													render={({ field }) => (
														<FormItem>
															<div>
																<Label
																	htmlFor="password"
																	className="text-sm font-medium text-slate-700">
																	Password
																</Label>
																<div className="relative">
																	<Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
																	<Input
																		id="password"
																		type={showPassword ? "text" : "password"}
																		{...field}
																		required
																		placeholder="Enter your password"
																		className="pl-10 pr-10"
																	/>
																	<button
																		type="button"
																		onClick={() =>
																			setShowPassword(!showPassword)
																		}
																		className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
																		{showPassword ? (
																			<EyeOff className="h-4 w-4" />
																		) : (
																			<Eye className="h-4 w-4" />
																		)}
																	</button>
																</div>
															</div>
														</FormItem>
													)}
												/>

												{/* Error Display */}
												{error && (
													<div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
														<AlertCircle className="h-4 w-4 text-red-600" />
														<p className="text-sm text-red-600">{error}</p>
													</div>
												)}

												<Button
													type="submit"
													disabled={signInMutation.isPending}
													className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white font-medium py-2.5">
													{signInMutation.isPending
														? "Authenticating..."
														: "Secure Login"}
												</Button>

												<div className="text-center space-y-2">
													<div className="text-xs text-slate-500">
														For technical support: <strong>0771-2234567</strong>
													</div>
												</div>
											</form>
										</Form>
									</CardContent>
								</Card>
							</div>
						</div>
					</div>

					{/* Info Cards */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-600">
							<CardContent className="p-4 text-center">
								<h3 className="font-bold text-blue-800 mb-2">₹1.5 Lakh</h3>
								<p className="text-sm text-blue-700">Financial Assistance</p>
							</CardContent>
						</Card>

						<Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-600">
							<CardContent className="p-4 text-center">
								<h3 className="font-bold text-green-800 mb-2">9 Stages</h3>
								<p className="text-sm text-green-700">
									Case Resolution Process
								</p>
							</CardContent>
						</Card>

						<Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-l-4 border-amber-600">
							<CardContent className="p-4 text-center">
								<h3 className="font-bold text-amber-800 mb-2">24/7</h3>
								<p className="text-sm text-amber-700">Online Support</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}

export default LoginPage;
