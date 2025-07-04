import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { TokenStorage } from "@/utils/storage";
import { router } from "expo-router";

const API_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

interface RetryConfig extends InternalAxiosRequestConfig {
	_retry?: boolean;
}

class ApiService {
	private api: AxiosInstance;
	private isRefreshing = false;
	private failedQueue: Array<{
		resolve: (value?: any) => void;
		reject: (reason?: any) => void;
	}> = [];

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

	private processQueue(error: Error | null, token: string | null = null) {
		this.failedQueue.forEach((prom) => {
			if (error) {
				prom.reject(error);
			} else {
				prom.resolve(token);
			}
		});

		this.failedQueue = [];
	}

	private setupInterceptors() {
		// Request interceptor - add auth token
		this.api.interceptors.request.use(
			async (config) => {
				const tokenUrl = ["/auth/me", "/auth/subAccount/login"];
				const token = tokenUrl.some((url) => config.url?.includes(url))
					? await TokenStorage.getToken()
					: await TokenStorage.getSubAccountToken();

				if (token) {
					config.headers.Authorization = `Bearer ${token}`;
				}

				return config;
			},
			(error) => {
				return Promise.reject(error);
			}
		);

		this.api.interceptors.response.use(
			(response) => response,
			async (error: AxiosError) => {
				const originalRequest = error.config as RetryConfig;

				if (!originalRequest) {
					return Promise.reject(error);
				}

				if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
					const currentPath = router.canGoBack() ? undefined : "/(auth)/login";
					if (currentPath === "/(auth)/login") {
						return Promise.reject(error);
					}

					if (error.response?.status === 403) {
						console.log("Token is forbidden (403). Logging out...");
						// await this.handleLogout();
						return Promise.reject(error);
					}

					if (this.isRefreshing) {
						return new Promise((resolve, reject) => {
							this.failedQueue.push({ resolve, reject });
						})
							.then((token) => {
								if (originalRequest.headers) {
									originalRequest.headers.Authorization = `Bearer ${token}`;
								}
								return this.api(originalRequest);
							})
							.catch((err) => {
								return Promise.reject(err);
							});
					}

					originalRequest._retry = true;
					this.isRefreshing = true;

					try {
						this.processQueue(new Error("Session expired"), null);
						// await this.handleLogout();
						return Promise.reject(error);
					} catch (refreshError) {
						this.processQueue(refreshError as Error, null);
						// await this.handleLogout();
						return Promise.reject(refreshError);
					} finally {
						this.isRefreshing = false;
					}
				}

				if (!error.response) {
					console.error("Network error:", error.message);
					return Promise.reject({
						message: "Network error. Please check your connection.",
						isNetworkError: true,
					});
				}

				console.error("API Error:", {
					status: error.response?.status,
					data: error.response?.data,
					url: error.config?.url,
				});

				return Promise.reject(error);
			}
		);
	}

	private async handleLogout() {
		try {
			await TokenStorage.clear();

			setTimeout(() => {
				router.replace("/(auth)/login");
			}, 0);
		} catch (error) {
			console.error("Logout error:", error);
			setTimeout(() => {
				router.replace("/(auth)/login");
			}, 0);
		}
	}

	async get<T>(url: string, params?: any): Promise<T> {
		try {
			const response = await this.api.get(url, { params });
			return response.data;
		} catch (error) {
			this.handleApiError(error);
			throw error;
		}
	}

	async post<T>(url: string, data?: any): Promise<T> {
		try {
			const response = await this.api.post(url, data);
			return response.data;
		} catch (error) {
			this.handleApiError(error);
			throw error;
		}
	}

	async put<T>(url: string, data?: any): Promise<T> {
		try {
			const response = await this.api.put(url, data);
			return response.data;
		} catch (error) {
			this.handleApiError(error);
			throw error;
		}
	}

	async delete<T>(url: string): Promise<T> {
		try {
			const response = await this.api.delete(url);
			return response.data;
		} catch (error) {
			this.handleApiError(error);
			throw error;
		}
	}

	private handleApiError(error: any) {
		if (error.isNetworkError) {
			console.error("Network connectivity issue");
		}
	}
}

export const apiService = new ApiService();
