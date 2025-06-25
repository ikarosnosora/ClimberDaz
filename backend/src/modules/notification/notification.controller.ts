import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
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
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { Notification } from './entities/notification.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('通知管理')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: '获取我的通知列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 20 })
  async getMyNotifications(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.notificationService.getUserNotifications(req.user.userId, page, limit);
  }

  @Get('unread-count')
  @ApiOperation({ summary: '获取未读通知数量' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getUnreadCount(@Request() req): Promise<{ count: number }> {
    const count = await this.notificationService.getUnreadCount(req.user.userId);
    return { count };
  }

  @Post(':id/read')
  @ApiOperation({ summary: '标记通知为已读' })
  @ApiResponse({ status: 200, description: '标记成功', type: Notification })
  @ApiResponse({ status: 404, description: '通知不存在' })
  @ApiParam({ name: 'id', description: '通知ID' })
  async markAsRead(@Param('id') id: string, @Request() req): Promise<Notification> {
    return this.notificationService.markAsRead(id, req.user.userId);
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: '标记所有通知为已读' })
  @ApiResponse({ status: 200, description: '标记成功' })
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@Request() req): Promise<{ message: string }> {
    await this.notificationService.markAllAsRead(req.user.userId);
    return { message: '所有通知已标记为已读' };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除通知' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 404, description: '通知不存在' })
  @ApiParam({ name: 'id', description: '通知ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNotification(@Param('id') id: string, @Request() req): Promise<void> {
    return this.notificationService.deleteNotification(id, req.user.userId);
  }
} 