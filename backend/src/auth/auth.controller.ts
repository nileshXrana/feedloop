import { Body, Controller, Post, Get, HttpCode, HttpStatus, Res, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, SignInDto } from './dto/auth.dto';
import { AuthGuard } from './auth.guard';
import { UserService } from '../users/user.service';
import * as express from 'express';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UserService
  ) { }


  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() user: SignInDto,
    @Res({ passthrough: true }) response: express.Response,
  ) {
    const result = await this.authService.login(user);

    response.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return result.user;
  }


  @Post('register')
  async register(@Body() user: CreateUserDto) {
    await this.authService.register(user);
    return { message: 'Registration successful' };
  }


  @Post('logout')
  logout(@Res({ passthrough: true }) response: express.Response) {
    response.clearCookie('access_token');
    return { message: 'Logged out successfully' };
  }

  @Get('user')
  @UseGuards(AuthGuard)
  async getUser(@Request() req: any) {
    const user = await this.usersService.findOne(req.user.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }
    return user;
  }

}
