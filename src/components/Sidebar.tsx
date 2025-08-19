"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Sidebar() {
	return (
		<div className="space-y-4">
			<Card className="bg-white shadow-lg border-l-4 border-emerald-600">
				<CardHeader className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white rounded-t-lg">
					<CardTitle className="text-lg">Quick Links</CardTitle>
				</CardHeader>
				<CardContent className="p-4 space-y-3">
					{[
						[
							"Chhattisgarh Government Portal",
							"https://cgstate.gov.in",
							"emerald",
						],
						["Citizen Services", "#", "blue"],
						["Online Applications", "#", "amber"],
						["RTI Portal", "#", "red"],
						["Employment Portal", "#", "indigo"],
						["Rahat Portal", "/", "green"],
					].map(([label, link, color]) => (
						<a
							key={label}
							href={link}
							className={`block p-3 rounded-lg bg-${color}-50 hover:bg-${color}-100 border-l-4 border-${color}-600 transition-colors`}>
							<span className={`text-sm font-medium text-${color}-800`}>
								{label}
							</span>
						</a>
					))}
				</CardContent>
			</Card>

			{/* Location Info */}
			<Card className="bg-gradient-to-br from-amber-50 to-red-50 border-l-4 border-amber-600">
				<CardContent className="p-4 text-center">
					<h3 className="font-bold text-amber-800 mb-2">राजधानी</h3>
					<p className="text-2xl font-bold text-red-800">रायपुर</p>
					<p className="text-sm text-amber-700">Capital City</p>
					<p className="text-xs text-amber-600 mt-2">Chhattisgarh - 492001</p>
				</CardContent>
			</Card>

			{/* Emergency Contacts */}
			<Card className="bg-gradient-to-br from-red-50 to-orange-50 border-l-4 border-red-600">
				<CardHeader className="bg-gradient-to-r from-red-700 to-red-800 text-white">
					<CardTitle className="text-lg">Emergency Contacts</CardTitle>
				</CardHeader>
				<CardContent className="p-4 space-y-2">
					<div className="text-sm">
						<p className="font-semibold text-red-800">Police Control Room</p>
						<p className="text-red-700">100</p>
					</div>
					<div className="text-sm">
						<p className="font-semibold text-red-800">Ambulance</p>
						<p className="text-red-700">108</p>
					</div>
					<div className="text-sm">
						<p className="font-semibold text-red-800">Fire Station</p>
						<p className="text-red-700">101</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
