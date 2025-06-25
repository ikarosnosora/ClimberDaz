export declare enum ChainStatus {
    PENDING = "pending",
    ACTIVE = "active",
    COMPLETED = "completed",
    EXPIRED = "expired"
}
export declare class ReviewChain {
    id: string;
    activityId: string;
    userSequence: string[];
    status: ChainStatus;
    triggerTime: Date;
    expireTime: Date;
    completedCount: number;
    totalCount: number;
    createdAt: Date;
    updatedAt: Date;
}
