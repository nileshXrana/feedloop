import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class SignInDto {
    @IsNotEmpty()
    @MinLength(3)
    emailOrUsername: string;

    @IsNotEmpty()
    @MinLength(6)
    password: string;
}

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @MinLength(3)
    username: string;

    @IsNotEmpty()
    @MinLength(6)
    password: string;

}
