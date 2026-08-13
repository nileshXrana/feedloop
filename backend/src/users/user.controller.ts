import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/auth.guard';
import { FeedbackDto } from './dto/feedback.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) { }

    private async verifyAdmin(req: any) {
        const user = await this.userService.findOne(req.user.email);
        if (!user || user.role !== 'admin') {
            throw new UnauthorizedException('Admin privileges required');
        }
    }

    @Get()
    @UseGuards(AuthGuard)
    getUsers() {
        return this.userService.getUsers();
    }

    @Post('user/feedback')
    @UseGuards(AuthGuard)
    saveUserFeedback(@Req() req: any, @Body() feedback: FeedbackDto) {
        return this.userService.saveUserFeedback(feedback, req.user.uuid);
    }

    @Get('user/feedbacks')
    @UseGuards(AuthGuard)
    getUserFeedbacks(@Req() req: any) {
        return this.userService.getUserFeedbacks(req.user.uuid);
    }

    @Get('tags')
    getUniqueTags() {
        return this.userService.getUniqueTags();
    }

    @Get('feedbacks/all')
    async getAllFeedbacks(@Req() req: any, @Query() query: any) {
        let loggedInUserId = undefined;
        const token = req.cookies?.access_token || req.headers.authorization?.split(' ')[1];
        if (token) {
            try {
                const payload = await this.jwtService.verifyAsync(token);
                loggedInUserId = payload.uuid;
            } catch { }
        }
        return this.userService.getFeedbacks(query, loggedInUserId, false);
    }

    @Post('feedback/:feedbackId/vote')
    @UseGuards(AuthGuard)
    voteFeedback(
        @Req() req: any,
        @Param('feedbackId') feedbackId: string,
        @Body('type') type: 'upvote' | 'downvote'
    ) {
        return this.userService.voteFeedback(feedbackId, req.user.uuid, type);
    }

    @Post('feedback/:feedbackId/comment')
    @UseGuards(AuthGuard)
    addComment(
        @Req() req: any,
        @Param('feedbackId') feedbackId: string,
        @Body('content') content: string,
        @Body('parentCommentId') parentCommentId?: string
    ) {
        return this.userService.addComment(feedbackId, req.user.uuid, content, parentCommentId);
    }

    @Get('feedback/:feedbackId/comments')
    async getComments(
        @Req() req: any,
        @Param('feedbackId') feedbackId: string,
        @Query('showDeletedComments') showDeletedComments?: string
    ) {
        let loggedInUserId = undefined;
        let isAdmin = false;
        const token = req.cookies?.access_token || req.headers.authorization?.split(' ')[1];
        if (token) {
            try {
                const payload = await this.jwtService.verifyAsync(token);
                loggedInUserId = payload.uuid;
                const user = await this.userService.findOne(payload.email);
                if (user && user.role === 'admin') {
                    isAdmin = true;
                }
            } catch { }
        }
        const showDeleted = showDeletedComments === 'true';
        return this.userService.getFeedbackComments(feedbackId, loggedInUserId, showDeleted, isAdmin);
    }

    @Delete('comment/:commentId')
    @UseGuards(AuthGuard)
    async deleteComment(
        @Req() req: any,
        @Param('commentId') commentId: string
    ) {
        let isAdmin = false;
        const user = await this.userService.findOne(req.user.email);
        if (user && user.role === 'admin') {
            isAdmin = true;
        }
        return this.userService.deleteComment(commentId, req.user.uuid, isAdmin);
    }

    @Delete('feedback/:feedbackId')
    @UseGuards(AuthGuard)
    deleteFeedback(
        @Req() req: any,
        @Param('feedbackId') feedbackId: string
    ) {
        return this.userService.deleteFeedback(feedbackId, req.user.uuid);
    }

    @Patch('feedback/:feedbackId/status')
    @UseGuards(AuthGuard)
    updateFeedbackStatus(
        @Req() req: any,
        @Param('feedbackId') feedbackId: string,
        @Body('status') status: 'public' | 'private'
    ) {
        return this.userService.updateFeedbackStatus(feedbackId, status, req.user.uuid);
    }

    @Get('admin/feedbacks')
    @UseGuards(AuthGuard)
    async getAdminFeedbacks(@Req() req: any, @Query() query: any) {
        await this.verifyAdmin(req);
        return this.userService.getFeedbacks(query, undefined, true);
    }

    @Get('admin/users')
    @UseGuards(AuthGuard)
    async getAdminUsers(
        @Req() req: any,
        @Query('page') page: string,
        @Query('limit') limit: string
    ) {
        await this.verifyAdmin(req);
        return this.userService.getAdminUsers(parseInt(page, 10) || 1, parseInt(limit, 10) || 10);
    }

    @Post('admin/toggle-login/:userId')
    @UseGuards(AuthGuard)
    async toggleUserActive(@Req() req: any, @Param('userId') userId: string) {
        await this.verifyAdmin(req);
        return this.userService.toggleUserActive(userId);
    }

    @Post('admin/toggle-feedbacks/:userId')
    @UseGuards(AuthGuard)
    async toggleUserFeedbacksHidden(@Req() req: any, @Param('userId') userId: string) {
        await this.verifyAdmin(req);
        return this.userService.toggleUserFeedbacksHidden(userId);
    }

    @Post('admin/toggle-comments/:userId')
    @UseGuards(AuthGuard)
    async toggleUserCommentsHidden(@Req() req: any, @Param('userId') userId: string) {
        await this.verifyAdmin(req);
        return this.userService.toggleUserCommentsHidden(userId);
    }
}