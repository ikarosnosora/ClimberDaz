// API base URL - configurable via environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const config = {
  baseUrl: API_BASE_URL,
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      profile: '/auth/profile',
      logout: '/auth/logout',
    },
    users: {
      base: '/users',
      byId: (id: string) => `/users/${id}`,
      preferences: (userId: string) => `/users/${userId}/preferences`,
      reviews: (userId: string) => `/users/${userId}/reviews`,
      search: '/users/search',
      statistics: '/users/statistics',
    },
    activities: {
      base: '/activities',
      byId: (id: string) => `/activities/${id}`,
      join: (id: string) => `/activities/${id}/join`,
      leave: (id: string) => `/activities/${id}/leave`,
      search: '/activities/search',
      my: '/activities/my',
    },
    climbingGyms: {
      base: '/climbing-gyms',
      byId: (id: number) => `/climbing-gyms/${id}`,
      byCity: (city: string) => `/climbing-gyms/city/${city}`,
      search: '/climbing-gyms/search',
    },
    announcements: {
      base: '/announcements',
      byId: (id: string) => `/announcements/${id}`,
    },
    reviews: {
      base: '/reviews',
      byId: (id: string) => `/reviews/${id}`,
      chains: '/review-chains',
    },
    notifications: {
      base: '/notifications',
      byId: (id: string) => `/notifications/${id}`,
      markRead: (id: string) => `/notifications/${id}/read`,
    },
  },
  headers: {
    'Content-Type': 'application/json',
  },
} as const;

export default config;

// Basic API client for making HTTP requests
export const apiClient = {
  async get<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${config.baseUrl}${url}`, {
      method: 'GET',
      headers: {
        ...config.headers,
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async post<T>(url: string, data?: any, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${config.baseUrl}${url}`, {
      method: 'POST',
      headers: {
        ...config.headers,
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async put<T>(url: string, data?: any, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${config.baseUrl}${url}`, {
      method: 'PUT',
      headers: {
        ...config.headers,
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async delete<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${config.baseUrl}${url}`, {
      method: 'DELETE',
      headers: {
        ...config.headers,
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },
};
