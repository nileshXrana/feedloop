import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import { CreateUserDto, SignInDto } from './dto/auth.dto';
import { User } from '../users/dto/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UserService,
        private readonly jwtService: JwtService
    ) { }



    async login(user: SignInDto) {
        // find the user by email or username
        const foundUser = await this.usersService.findOne(user.emailOrUsername);

        if (foundUser) {
            const isMatch = await bcrypt.compare(user.password, foundUser.password);
            if (!isMatch) {
                throw new UnauthorizedException('Invalid credentials');
            }

            if (!foundUser.isActive) {
                throw new UnauthorizedException('User account is disabled');
            }

            const payload = { uuid: foundUser.uuid, email: foundUser.email };
            return {
                access_token: await this.jwtService.signAsync(payload),
                user: foundUser
            };
        }
        else {
            throw new UnauthorizedException('User not found');
        }

    }

    async register(user: CreateUserDto) {
        const newUser = await this.usersService.createUser(user);
        return newUser;
    }


}
