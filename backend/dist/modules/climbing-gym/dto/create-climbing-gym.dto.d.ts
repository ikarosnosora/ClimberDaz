import { ClimbingFacility, BusinessHours } from '../entities/climbing-gym.entity';
export declare class CreateClimbingGymDto {
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
}
