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
  ApiQuery,
} from '@nestjs/swagger';
import { AdminUserService } from '../services/admin-user.service';
import { CreateUserDto } from '../services/dto/create-user.dto';
import { UpdateUserDto } from '../services/dto/update-user.dto';
import { UserQueryDto } from '../services/dto/user-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';

@ApiTags('Admin - User Management')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or user already exists',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.adminUserService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with filtering and pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Users retrieved successfully',
  })
  async findAll(@Query() query: UserQueryDto) {
    return await this.adminUserService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User statistics retrieved successfully',
  })
  async getUserStats() {
    return await this.adminUserService.getUserStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  async findOne(@Param('id') id: string) {
    return await this.adminUserService.findOne(id);
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get user analytics data' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User analytics retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  async getUserAnalytics(@Param('id') id: string) {
    return await this.adminUserService.getUserAnalytics(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or duplicate data',
  })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.adminUserService.update(id, updateUserDto);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle user active status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User status toggled successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  async toggleActiveStatus(@Param('id') id: string) {
    return await this.adminUserService.toggleActiveStatus(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  async remove(@Param('id') id: string) {
    await this.adminUserService.remove(id);
    return { message: 'User deleted successfully' };
  }
}