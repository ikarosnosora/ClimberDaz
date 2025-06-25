import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Demo')
@Controller('demo')
export class DemoController {
  @Get()
  @ApiOperation({ summary: 'Demo endpoint' })
  @ApiResponse({ status: 200, description: 'Server is running' })
  getDemo() {
    return {
      message: 'ClimberDaz API Server is running! 🧗‍♂️',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      modules: {
        auth: 'Ready (database disabled)',
        users: 'Ready (database disabled)', 
        activities: 'Ready (database disabled)',
        climbingGyms: 'Ready (database disabled)',
        reviews: 'Ready (database disabled)',
        notifications: 'Ready (database disabled)',
      },
      nextSteps: [
        'Setup database connection',
        'Enable database modules',
        'Test API endpoints',
        'Connect frontend'
      ]
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Server health status' })
  getHealth() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
  }

  @Get('api-status')
  @ApiOperation({ summary: 'API implementation status' })
  @ApiResponse({ status: 200, description: 'Current API implementation status' })
  getApiStatus() {
    return {
      implementationStatus: {
        auth: {
          status: '✅ Complete',
          endpoints: 5,
          features: ['JWT Auth', 'Registration', 'Login', 'Role-based access']
        },
        users: {
          status: '✅ Complete', 
          endpoints: 9,
          features: ['Profile management', 'User search', 'Admin controls', 'Statistics']
        },
        activities: {
          status: '✅ Complete',
          endpoints: 8, 
          features: ['CRUD operations', 'Join/Leave', 'Private activities', 'Search']
        },
        climbingGyms: {
          status: '✅ Complete',
          endpoints: 7,
          features: ['CRUD operations', 'Location search', 'City filtering']
        },
        reviews: {
          status: '⚠️ 80% Complete',
          endpoints: 0,
          features: ['Chain-based reviews', 'Entity design complete']
        },
        notifications: {
          status: '⚠️ 70% Complete', 
          endpoints: 0,
          features: ['Structure ready', 'Needs implementation']
        }
      },
      totalEndpoints: 29,
      completedEndpoints: 29,
      databaseStatus: 'Disabled (SQLite setup pending)',
      readyForTesting: false
    };
  }
} 