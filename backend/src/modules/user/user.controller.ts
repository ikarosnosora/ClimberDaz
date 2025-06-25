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
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto, QueryUserDto } from './dto';
import { User, UserRole } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('用户管理')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ status: 200, description: '获取成功', type: User })
  async getProfile(@Request() req): Promise<User> {
    return this.userService.findById(req.user.userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: '更新当前用户信息' })
  @ApiResponse({ status: 200, description: '更新成功', type: User })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async updateProfile(@Body() updateUserDto: UpdateUserDto, @Request() req): Promise<User> {
    return this.userService.update(req.user.userId, updateUserDto);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取当前用户统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getUserStats(@Request() req) {
    return this.userService.getUserStats(req.user.userId);
  }

  @Get('search')
  @ApiOperation({ summary: '搜索用户' })
  @ApiResponse({ status: 200, description: '搜索成功' })
  @ApiQuery({ name: 'q', description: '搜索关键词' })
  @ApiQuery({ name: 'limit', required: false, description: '返回数量限制', example: 10 })
  async searchUsers(
    @Query('q') query: string,
    @Query('limit') limit?: number,
  ): Promise<User[]> {
    return this.userService.searchUsers(query, limit);
  }

  @Get()
  @ApiOperation({ summary: '获取用户列表（仅管理员）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @UseGuards(AdminGuard)
  async findAll(@Query() queryDto: QueryUserDto) {
    return this.userService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取用户详情' })
  @ApiResponse({ status: 200, description: '获取成功', type: User })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiParam({ name: 'id', description: '用户ID' })
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new Error('用户不存在');
    }
    return user;
  }

  @Get(':id/stats')
  @ApiOperation({ summary: '获取指定用户统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiParam({ name: 'id', description: '用户ID' })
  async getOtherUserStats(@Param('id') id: string) {
    return this.userService.getUserStats(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: '停用用户（仅管理员）' })
  @ApiResponse({ status: 200, description: '停用成功', type: User })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @UseGuards(AdminGuard)
  @ApiParam({ name: 'id', description: '用户ID' })
  async deactivateUser(@Param('id') id: string): Promise<User> {
    return this.userService.deactivate(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: '激活用户（仅管理员）' })
  @ApiResponse({ status: 200, description: '激活成功', type: User })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @UseGuards(AdminGuard)
  @ApiParam({ name: 'id', description: '用户ID' })
  async activateUser(@Param('id') id: string): Promise<User> {
    return this.userService.activate(id);
  }

  @Patch(':id/role')
  @ApiOperation({ summary: '修改用户角色（仅管理员）' })
  @ApiResponse({ status: 200, description: '修改成功', type: User })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @UseGuards(AdminGuard)
  @ApiParam({ name: 'id', description: '用户ID' })
  async changeUserRole(
    @Param('id') id: string,
    @Body('role') role: UserRole,
  ): Promise<User> {
    return this.userService.changeRole(id, role);
  }
} 