import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/auth.guard';
import { FeedbackDto } from './dto/feedback.dto';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

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

}