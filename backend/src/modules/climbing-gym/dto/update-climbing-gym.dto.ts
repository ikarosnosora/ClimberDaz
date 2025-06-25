import { PartialType } from '@nestjs/swagger';
import { CreateClimbingGymDto } from './create-climbing-gym.dto';

export class UpdateClimbingGymDto extends PartialType(CreateClimbingGymDto) {} 