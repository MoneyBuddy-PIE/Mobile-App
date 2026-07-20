import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { TokenStorage, clear } from '@/utils/storage';
import { router } from 'expo-router';
import { logger } from '@/utils/logger';

const API_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

interface RetryConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

interface RefreshResponse {
    token: string;
    refreshToken?: string;
}

class ApiService {
    private api: AxiosInstance;
    private isRefreshing = false;
    private failedQueue: Array<{
        resolve: (value?: any) => void;
        reject: (reason?: any) => void;
    }> = [];
    private logoutCallback: (() => Promise<void>) | null = null;

    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    setLogoutCallback(callback: (() => Promise<void>) | null) {
        this.logoutCallback = callback;
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
        this.api.interceptors.request.use(
            async (config) => {
                const isPublicEndpoint =
                    config.url?.includes('/auth/login') ||
                    config.url?.includes('/auth/register') ||
                    config.url?.includes('/auth/forgot-password') ||
                    config.url?.includes('/auth/refreshToken');

                if (isPublicEndpoint) {
                    return config;
                }

                const mainTokenUrls = ['/auth/me', '/auth/subAccount/login'];

                let token: string | null;
                if (mainTokenUrls.some((url) => config.url?.includes(url))) {
                    token = await TokenStorage.getToken();
                } else {
                    token = await TokenStorage.getSubAccountToken();
                }

                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                return config;
            },
            (error) => {
                return Promise.reject(error);
            },
        );

        this.api.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const originalRequest = error.config as RetryConfig;

                if (!originalRequest) {
                    return Promise.reject(error);
                }

                if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
                    const isAuthEndpoint =
                        originalRequest.url?.includes('/auth/login') ||
                        originalRequest.url?.includes('/auth/register') ||
                        originalRequest.url?.includes('/auth/forgot-password') ||
                        originalRequest.url?.includes('/auth/refreshToken');
                    if (isAuthEndpoint) {
                        return Promise.reject(error);
                    }

                    if (error.response?.status === 403) {
                        return Promise.reject(error);
                    }

                    // Wrong PIN returns 401 with INVALID_PIN code — skip refresh, it's not an expired token
                    const errorCode = (error.response?.data as any)?.code;
                    if (errorCode === 'INVALID_PIN') {
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
                        const refreshToken = await TokenStorage.getRefreshToken();
                        if (!refreshToken) {
                            throw new Error('No refresh token available');
                        }

                        // Direct axios call to avoid triggering this interceptor again
                        const refreshResponse = await axios.post<RefreshResponse>(
                            `${API_BASE_URL}/auth/refreshToken`,
                            { refreshToken },
                            { headers: { 'Content-Type': 'application/json' } },
                        );

                        const newToken = refreshResponse.data.token;
                        await TokenStorage.saveToken(newToken);
                        if (refreshResponse.data.refreshToken) {
                            await TokenStorage.saveRefreshToken(refreshResponse.data.refreshToken);
                        }

                        this.processQueue(null, newToken);

                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        }
                        return this.api(originalRequest);
                    } catch (refreshError: any) {
                        this.processQueue(refreshError as Error, null);
                        // Only logout if the server explicitly rejected the refresh token.
                        // A network error means the server was unreachable — the session may still be valid.
                        const isAuthRejection =
                            refreshError?.response?.status === 401 ||
                            refreshError?.response?.status === 403 ||
                            refreshError?.response?.status === 409 || // refresh token not found in DB
                            refreshError?.response?.status === 417 || // refresh token expired
                            refreshError?.message === 'No refresh token available';
                        if (isAuthRejection) {
                            await this.handleLogout();
                        }
                        return Promise.reject(refreshError);
                    } finally {
                        this.isRefreshing = false;
                    }
                }

                if (!error.response) {
                    console.log('[API] Network error detail:', {
                        message: error.message,
                        code: (error as any).code,
                        config: { url: error.config?.url, baseURL: error.config?.baseURL, method: error.config?.method },
                    });
                    logger.error('Network error:', error.message);
                    return Promise.reject({
                        message: 'Network error. Please check your connection.',
                        isNetworkError: true,
                    });
                }

                if (error.response?.status !== 409) {
                    logger.error('API Error:', {
                        status: error.response?.status,
                        data: error.response?.data,
                        url: error.config?.url,
                    });
                }

                return Promise.reject(error);
            },
        );
    }

    private async handleLogout() {
        try {
            if (this.logoutCallback) {
                await this.logoutCallback();
            } else {
                await clear();
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setTimeout(() => {
                router.replace('/(auth)/login');
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
            logger.error('POST request error:', error);
            this.handleApiError(error);
            throw error;
        }
    }

    async postFormData<T>(url: string, formData: FormData, timeout = 30000): Promise<T> {
        try {
            const response = await this.api.post(url, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout,
            });
            return response.data;
        } catch (error: any) {
            logger.error('POST form-data request error:', {
                name: error?.name,
                message: error?.message,
                code: error?.code,
                status: error?.response?.status,
                responseData: error?.response?.data,
            });
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
            console.error('Network connectivity issue');
        }
    }
}

export const apiService = new ApiService();
