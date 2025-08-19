import axios from "axios";

// Create axios instance for KPI service (port 3002)
export const kpiApi = axios.create({
	baseURL: process.env.NEXT_PUBLIC_KPI_API_URL || "http://localhost:3001/api",
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
	withCredentials: true,
});

// Create axios instance for Auth service (port 3001) - using proxy to avoid CORS
export const authApi = axios.create({
	baseURL: process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:3001/api", // Use proxy instead of direct connection
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
	withCredentials: true,
});

// Request interceptor for Auth API to add debugging
authApi.interceptors.request.use(
	(config) => {
		console.log("Auth API Request:", {
			method: config.method?.toUpperCase(),
			url: config.url,
			baseURL: config.baseURL,
			fullURL: `${config.baseURL}${config.url}`,
			headers: config.headers,
			data: config.data,
		});
		return config;
	},
	(error) => {
		console.error("Auth API Request Error:", error);
		return Promise.reject(error);
	}
);

// Response interceptor for KPI API
kpiApi.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		console.error(
			"KPI API Error:",
			error.response?.status,
			error.response?.data
		);
		if (error.response?.status === 401) {
			alert("Unauthorized");
			window.location.href = "/";
		}
		return Promise.reject(error);
	}
);

// Response interceptor for Auth API
authApi.interceptors.response.use(
	(response) => {
		console.log("Auth API Response:", response.status, response.data);
		return response;
	},
	(error) => {
		console.error("Auth API Error Details:", {
			message: error.message,
			code: error.code,
			status: error.response?.status,
			statusText: error.response?.statusText,
			data: error.response?.data,
			headers: error.response?.headers,
			config: {
				method: error.config?.method,
				url: error.config?.url,
				baseURL: error.config?.baseURL,
				headers: error.config?.headers,
			},
		});

		if (error.response?.status === 401) {
			alert("Unauthorized");
			window.location.href = "/";
		}

		if (error.code === "ERR_NETWORK") {
			console.error(
				"Network error - check if auth service is running on port 3001"
			);
		}

		return Promise.reject(error);
	}
);
