import { Activity } from '../../activity/entities/activity.entity';
export interface BusinessHours {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
}
export declare enum ClimbingFacility {
    BOULDERING = "bouldering",
    TOP_ROPE = "top_rope",
    LEAD_CLIMBING = "lead_climbing",
    TRAINING_AREA = "training_area",
    EQUIPMENT_RENTAL = "equipment_rental",
    SHOWER = "shower",
    PARKING = "parking"
}
export declare class ClimbingGym {
    id: string;
    name: string;
    address: string;
    city: string;
    lat: number;
    lng: number;
    phone?: string;
    businessHours?: BusinessHours;
    facilities?: ClimbingFacility[];
    description?: string;
    website?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    activities: Activity[];
    activityCount?: number;
}
