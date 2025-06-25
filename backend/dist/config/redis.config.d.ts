import { ConfigService } from '@nestjs/config';
import { BullModuleOptions, SharedBullConfigurationFactory } from '@nestjs/bull';
export declare class RedisConfig implements SharedBullConfigurationFactory {
    private configService;
    constructor(configService: ConfigService);
    createSharedConfiguration(): BullModuleOptions;
}
