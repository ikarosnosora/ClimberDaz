import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export class DatabaseProductionConfig {
  static getConfig(configService: ConfigService): TypeOrmModuleOptions {
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');
    
    if (nodeEnv === 'production') {
      return {
        type: 'mysql',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/../migrations/*{.ts,.js}'],
        synchronize: false, // Never use in production
        migrationsRun: true,
        logging: configService.get<boolean>('DB_LOGGING', false),
        
        // Production optimizations
        extra: {
          connectionLimit: configService.get<number>('DB_CONNECTION_LIMIT', 10),
          acquireTimeout: configService.get<number>('DB_ACQUIRE_TIMEOUT', 60000),
          timeout: configService.get<number>('DB_TIMEOUT', 60000),
          reconnect: true,
          charset: 'utf8mb4',
        },
        
        // Connection pooling
        poolSize: configService.get<number>('DB_POOL_SIZE', 10),
        maxQueryExecutionTime: configService.get<number>('DB_MAX_QUERY_TIME', 5000),
        
        // SSL configuration for production
        ssl: configService.get<boolean>('DB_SSL', true) ? {
          rejectUnauthorized: configService.get<boolean>('DB_SSL_REJECT_UNAUTHORIZED', true),
          ca: configService.get<string>('DB_SSL_CA'),
          key: configService.get<string>('DB_SSL_KEY'),
          cert: configService.get<string>('DB_SSL_CERT'),
        } : false,
      };
    }
    
    // Development configuration (SQLite)
    return {
      type: 'better-sqlite3',
      database: configService.get<string>('DB_DATABASE', 'climberdaz.db'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: configService.get<boolean>('DB_SYNCHRONIZE', true),
      logging: configService.get<boolean>('DB_LOGGING', true),
      dropSchema: false,
    };
  }
}

export interface RedisProductionConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  retryDelayOnFailover: number;
  maxRetriesPerRequest: number;
  lazyConnect: boolean;
  keepAlive: number;
}

export class RedisConfigService {
  static getConfig(configService: ConfigService): RedisProductionConfig {
    return {
      host: configService.get<string>('REDIS_HOST', 'localhost'),
      port: configService.get<number>('REDIS_PORT', 6379),
      password: configService.get<string>('REDIS_PASSWORD'),
      db: configService.get<number>('REDIS_DB', 0),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
    };
  }
} 