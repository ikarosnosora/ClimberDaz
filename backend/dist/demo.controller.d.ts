export declare class DemoController {
    getDemo(): {
        message: string;
        timestamp: string;
        version: string;
        modules: {
            auth: string;
            users: string;
            activities: string;
            climbingGyms: string;
            reviews: string;
            notifications: string;
        };
        nextSteps: string[];
    };
    getHealth(): {
        status: string;
        uptime: number;
        memory: NodeJS.MemoryUsage;
        timestamp: string;
    };
    getApiStatus(): {
        implementationStatus: {
            auth: {
                status: string;
                endpoints: number;
                features: string[];
            };
            users: {
                status: string;
                endpoints: number;
                features: string[];
            };
            activities: {
                status: string;
                endpoints: number;
                features: string[];
            };
            climbingGyms: {
                status: string;
                endpoints: number;
                features: string[];
            };
            reviews: {
                status: string;
                endpoints: number;
                features: string[];
            };
            notifications: {
                status: string;
                endpoints: number;
                features: string[];
            };
        };
        totalEndpoints: number;
        completedEndpoints: number;
        databaseStatus: string;
        readyForTesting: boolean;
    };
}
