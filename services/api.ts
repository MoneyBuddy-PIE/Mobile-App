import axios, { AxiosInstance, AxiosError } from "axios";
import { TokenStorage } from "../utils/storage";
const API_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

console.log("API_BASE_URL", API_BASE_URL);

class ApiService {
	private api: AxiosInstance;

	constructor() {
		this.api = axios.create({
			baseURL: API_BASE_URL,
			timeout: 10000,
			headers: {
				"Content-Type": "application/json",
			},
		});

		this.setupInterceptors();
	}

	private setupInterceptors() {
		// Request interceptor - add auth token
		this.api.interceptors.request.use(async (config) => {
			const token = config.url?.includes("/subAccount/me") ? await TokenStorage.getSubAccountToken() : await TokenStorage.getToken();
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
			return config;
		});

		// Response interceptor - handle common errors
		this.api.interceptors.response.use(
			(response) => response,
			(error: AxiosError) => {
				if (error.response?.status === 401) {
					// Handle unauthorized - redirect to login
					console.log("Unauthorized - redirect to login");
				}
				return Promise.reject(error);
			}
		);
	}

	// Generic methods
	async get<T>(url: string, params?: any): Promise<T> {
		const response = await this.api.get(url, { params });
		return response.data;
	}

	async post<T>(url: string, data?: any): Promise<T> {
		const response = await this.api.post(url, data);
		return response.data;
	}

	async put<T>(url: string, data?: any): Promise<T> {
		const response = await this.api.put(url, data);
		return response.data;
	}

	async delete<T>(url: string): Promise<T> {
		const response = await this.api.delete(url);
		return response.data;
	}
}

export const apiService = new ApiService();
