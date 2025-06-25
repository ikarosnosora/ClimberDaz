"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
const security_config_1 = require("./config/security.config");
const compression = require("compression");
const helmet = require("helmet");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const securityConfig = (0, security_config_1.getSecurityConfig)(configService);
    app.use(helmet.default({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
            },
        },
        crossOriginEmbedderPolicy: false,
    }));
    app.use(compression());
    app.enableCors({
        origin: securityConfig.cors.origins,
        credentials: securityConfig.cors.credentials,
        methods: securityConfig.cors.methods,
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
        exposedHeaders: ['X-Total-Count'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    app.setGlobalPrefix('api');
    const config = new swagger_1.DocumentBuilder()
        .setTitle('ClimberDaz API')
        .setDescription('攀岩找搭子 API 文档')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('auth', '认证相关')
        .addTag('users', '用户管理')
        .addTag('activities', '活动管理')
        .addTag('climbing-gyms', '岩馆管理')
        .addTag('reviews', '评价系统')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 ClimberDaz API server started on port ${port}`);
    console.log(`📖 API Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map