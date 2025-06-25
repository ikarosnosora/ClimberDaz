import { apiRequest, TokenManager } from '../../utils/api';
import config from './config';
import type { User } from '../../types';

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  phone: string;
  password: string;
  nickname: string;
  verificationCode: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export class AuthService {
  /**
   * User login
   */
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiRequest.post<AuthResponse>(
      config.endpoints.auth.login,
      credentials
    );
    
    // Store token for future requests
    TokenManager.setToken(response.access_token);
    
    return response;
  }

  /**
   * User registration
   */
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiRequest.post<AuthResponse>(
      config.endpoints.auth.register,
      userData
    );
    
    // Store token for future requests
    TokenManager.setToken(response.access_token);
    
    return response;
  }

  /**
   * Get current user profile
   */
  static async getProfile(): Promise<User> {
    return await apiRequest.get<User>(config.endpoints.auth.profile);
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      await apiRequest.post(config.endpoints.auth.logout);
    } catch (error) {
      // Even if logout API fails, we should clear local token
      console.warn('Logout API failed:', error);
    } finally {
      TokenManager.removeToken();
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return TokenManager.isTokenValid();
  }

  /**
   * Get stored token
   */
  static getToken(): string | null {
    return TokenManager.getToken();
  }
} 