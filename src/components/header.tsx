import React from "react";

function Header() {
	return (
		<header className="bg-gradient-to-r from-orange-500 via-white to-green-600 shadow-lg border-b-4 border-amber-500 relative overflow-hidden">
			<div className="absolute inset-0 bg-gradient-to-r from-orange-500/90 via-white/95 to-green-600/90"></div>
			<div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-blue-100/50"></div>

			<div className="container mx-auto px-4 py-4 relative z-10">
				<div className="flex items-center justify-between">
					{/* Logos and Title */}
					<div className="flex items-center space-x-4">
						<div className="w-20 h-20">
							<img
								src="/images/bharat-sarkar-logo.png"
								alt="Gov Logo"
								className="object-contain drop-shadow-lg"
							/>
						</div>
						<div className="w-20 h-20">
							<img
								src="/images/cg-logo.png"
								alt="CG Logo"
								className="object-contain drop-shadow-lg"
							/>
						</div>
						<div>
							<h1 className="text-2xl font-bold text-blue-900 drop-shadow-md">
								Project श्रेष्ठ
							</h1>
							<p className="text-sm text-red-700 font-medium drop-shadow-sm">
								PROJECT श्रेष्ठ | District Administration Raipur
							</p>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}

export default Header;
