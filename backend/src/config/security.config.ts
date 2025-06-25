import { ConfigService } from '@nestjs/config';

export interface SecurityConfig {
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  cors: {
    origins: string[];
    credentials: boolean;
    methods: string[];
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
  bcrypt: {
    rounds: number;
  };
  session: {
    secret: string;
    maxAge: number;
  };
}

export const getSecurityConfig = (configService: ConfigService): SecurityConfig => {
  // Validate required environment variables
  const jwtSecret = configService.get<string>('JWT_SECRET');
  const refreshSecret = configService.get<string>('JWT_REFRESH_SECRET');
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  
  if (!refreshSecret) {
    throw new Error('JWT_REFRESH_SECRET environment variable is required');
  }

  // Validate JWT secret strength (minimum 32 characters)
  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  if (refreshSecret.length < 32) {
    throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long');
  }

  return {
    jwt: {
      secret: jwtSecret,
      expiresIn: configService.get<string>('JWT_EXPIRES_IN', '24h'),
      refreshSecret: refreshSecret,
      refreshExpiresIn: configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    },
    cors: {
      origins: configService.get<string>('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3000').split(','),
      credentials: configService.get<boolean>('CORS_CREDENTIALS', true),
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    },
    rateLimit: {
      windowMs: configService.get<number>('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000), // 15 minutes
      max: configService.get<number>('RATE_LIMIT_MAX', 100), // limit each IP to 100 requests per windowMs
    },
    bcrypt: {
      rounds: configService.get<number>('BCRYPT_ROUNDS', 12),
    },
    session: {
      secret: configService.get<string>('SESSION_SECRET', jwtSecret), // fallback to JWT secret if not provided
      maxAge: configService.get<number>('SESSION_MAX_AGE', 24 * 60 * 60 * 1000), // 24 hours
    },
  };
};

// Security validation utilities
export class SecurityValidator {
  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/[\r\n]/g, ' ') // Replace line breaks with spaces
      .trim()
      .substring(0, 1000); // Limit length to prevent DoS
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  static isValidPhoneNumber(phone: string): boolean {
    // Chinese phone number format
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }
} 