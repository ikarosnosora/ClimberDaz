"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemoController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
let DemoController = class DemoController {
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
    getHealth() {
        return {
            status: 'healthy',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date().toISOString()
        };
    }
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
};
exports.DemoController = DemoController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Demo endpoint' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Server is running' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DemoController.prototype, "getDemo", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({ summary: 'Health check' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Server health status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DemoController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('api-status'),
    (0, swagger_1.ApiOperation)({ summary: 'API implementation status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Current API implementation status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DemoController.prototype, "getApiStatus", null);
exports.DemoController = DemoController = __decorate([
    (0, swagger_1.ApiTags)('Demo'),
    (0, common_1.Controller)('demo')
], DemoController);
//# sourceMappingURL=demo.controller.js.map