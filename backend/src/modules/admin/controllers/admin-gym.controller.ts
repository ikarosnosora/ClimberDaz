import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminGymService } from '../services/admin-gym.service';
import { CreateGymDto } from '../services/dto/create-gym.dto';
import { UpdateGymDto } from '../services/dto/update-gym.dto';
import { GymQueryDto } from '../services/dto/gym-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';

@ApiTags('Admin - Climbing Gym Management')
@Controller('admin/gyms')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminGymController {
  constructor(private readonly adminGymService: AdminGymService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new climbing gym' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Climbing gym created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or gym already exists',
  })
  async create(@Body() createGymDto: CreateGymDto) {
    return await this.adminGymService.create(createGymDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all climbing gyms with filtering and pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Climbing gyms retrieved successfully',
  })
  async findAll(@Query() query: GymQueryDto) {
    return await this.adminGymService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get climbing gym statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Gym statistics retrieved successfully',
  })
  async getGymStats() {
    return await this.adminGymService.getGymStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get climbing gym by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Climbing gym retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Climbing gym not found',
  })
  async findOne(@Param('id') id: string) {
    return await this.adminGymService.findOne(id);
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get climbing gym analytics data' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Gym analytics retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Climbing gym not found',
  })
  async getGymAnalytics(@Param('id') id: string) {
    return await this.adminGymService.getGymAnalytics(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update climbing gym' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Climbing gym updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Climbing gym not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or duplicate data',
  })
  async update(@Param('id') id: string, @Body() updateGymDto: UpdateGymDto) {
    return await this.adminGymService.update(id, updateGymDto);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle climbing gym active status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Gym status toggled successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Climbing gym not found',
  })
  async toggleActiveStatus(@Param('id') id: string) {
    return await this.adminGymService.toggleActiveStatus(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete climbing gym' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Climbing gym deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Climbing gym not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete gym with associated activities',
  })
  async remove(@Param('id') id: string) {
    await this.adminGymService.remove(id);
    return { message: 'Climbing gym deleted successfully' };
  }
}