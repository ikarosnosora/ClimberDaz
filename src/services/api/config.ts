// API base URL - will be set from environment variables in production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const config = {
  baseUrl: API_BASE_URL,
  endpoints: {
    auth: {
      login: '/auth/login',
      logout: '/auth/logout',
      me: '/auth/me',
    },
    users: {
      base: '/users',
      byId: (id: string) => `/users/${id}`,
      preferences: (userId: string) => `/users/${userId}/preferences`,
      reviews: (userId: string) => `/users/${userId}/reviews`,
    },
    activities: {
      base: '/activities',
      byId: (id: string) => `/activities/${id}`,
      join: (id: string) => `/activities/${id}/join`,
      leave: (id: string) => `/activities/${id}/leave`,
    },
    announcements: {
      base: '/announcements',
      byId: (id: string) => `/announcements/${id}`,
    },
    reviews: {
      base: '/reviews',
      byId: (id: string) => `/reviews/${id}`,
    },
  },
  headers: {
    'Content-Type': 'application/json',
  },
} as const;

export default config;
