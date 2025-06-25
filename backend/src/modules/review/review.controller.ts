import {
  Controller,
  Get,
  Post,
  Body,
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
import { ReviewService } from './review.service';
import { CreateReviewDto, ReviewChainDto } from './dto';
import { Review } from './entities/review.entity';
import { ReviewChain } from './entities/review-chain.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('评价管理')
@Controller('reviews')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('submit')
  @ApiOperation({ summary: '提交评价' })
  @ApiResponse({ status: 201, description: '评价提交成功', type: Review })
  @ApiResponse({ status: 400, description: '请求参数错误或评价已存在' })
  @ApiResponse({ status: 404, description: '评价链不存在' })
  async submitReview(@Body() createReviewDto: CreateReviewDto, @Request() req): Promise<Review> {
    return this.reviewService.submitReview(createReviewDto, req.user.userId);
  }

  @Post('generate-chain')
  @ApiOperation({ summary: '生成评价链（活动结束后自动调用）' })
  @ApiResponse({ status: 201, description: '评价链生成成功', type: ReviewChain })
  @ApiResponse({ status: 400, description: '参与人数不足' })
  @UseGuards(AdminGuard)
  async generateReviewChain(@Body() reviewChainDto: ReviewChainDto): Promise<ReviewChain> {
    return this.reviewService.generateReviewChain(
      reviewChainDto.activityId,
      reviewChainDto.participantIds,
    );
  }

  @Get('pending')
  @ApiOperation({ summary: '获取待评价列表' })
  @ApiResponse({ status: 200, description: '获取成功', type: [Review] })
  async getPendingReviews(@Request() req): Promise<Review[]> {
    return this.reviewService.getPendingReviews(req.user.userId);
  }

  @Get('my-reviews')
  @ApiOperation({ summary: '获取我的评价历史' })
  @ApiResponse({ status: 200, description: '获取成功', type: [Review] })
  @ApiQuery({ 
    name: 'type', 
    required: false, 
    description: '评价类型：received(收到的) 或 given(给出的)',
    enum: ['received', 'given'] 
  })
  async getMyReviews(
    @Request() req,
    @Query('type') type: 'received' | 'given' = 'received',
  ): Promise<Review[]> {
    return this.reviewService.getUserReviews(req.user.userId, type);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取我的评价统计' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMyReviewStats(@Request() req) {
    return this.reviewService.getUserReviewStats(req.user.userId);
  }

  @Get('user/:id/reviews')
  @ApiOperation({ summary: '获取指定用户的评价历史' })
  @ApiResponse({ status: 200, description: '获取成功', type: [Review] })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiQuery({ 
    name: 'type', 
    required: false, 
    description: '评价类型：received(收到的) 或 given(给出的)',
    enum: ['received', 'given'] 
  })
  async getUserReviews(
    @Param('id') userId: string,
    @Query('type') type: 'received' | 'given' = 'received',
  ): Promise<Review[]> {
    return this.reviewService.getUserReviews(userId, type);
  }

  @Get('user/:id/stats')
  @ApiOperation({ summary: '获取指定用户的评价统计' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiParam({ name: 'id', description: '用户ID' })
  async getUserReviewStats(@Param('id') userId: string) {
    return this.reviewService.getUserReviewStats(userId);
  }

  @Get('activity/:id')
  @ApiOperation({ summary: '获取活动的评价情况' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiParam({ name: 'id', description: '活动ID' })
  async getActivityReviews(@Param('id') activityId: string) {
    return this.reviewService.getActivityReviews(activityId);
  }

  @Post('send-reminders')
  @ApiOperation({ summary: '发送评价提醒（定时任务）' })
  @ApiResponse({ status: 200, description: '提醒发送成功' })
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  async sendReviewReminders(): Promise<{ message: string }> {
    await this.reviewService.sendReviewReminders();
    return { message: '评价提醒发送完成' };
  }
} 