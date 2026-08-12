import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../auth/dto/auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bycrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Feedback } from './entities/feedback.entity';
import { FeedbackDto } from './dto/feedback.dto';
import { Tag } from './entities/tag.entity';

@Injectable()
export class UserService {


    private readonly saltRounds = 10;

    async hashPassword(password: string): Promise<string> {
        return await bycrypt.hash(password, this.saltRounds);
    }

    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Feedback) private readonly feedbackRepository: Repository<Feedback>,
        @InjectRepository(Tag) private readonly tagRepository: Repository<Tag>,
    ) { }


    async createUser(user: CreateUserDto) {
        const hashedPassword = await this.hashPassword(user.password);

        // check user
        const existingUser = await this.userRepository.findOne({
            where: [
                { email: user.email },
                { username: user.username }
            ]
        });

        if (existingUser) {
            throw new Error('User with same email or username already exists');
        }

        const newUser: User = new User();
        newUser.email = user.email;
        newUser.username = user.username;
        newUser.password = hashedPassword;
        return await this.userRepository.save(newUser);
    }

    async findOne(emailOrUsername: string) {
        // find user by email or username
        return await this.userRepository.findOne({
            where: [
                { email: emailOrUsername },
                { username: emailOrUsername }
            ]
        });
    }

    async getUsers() {
        const users: User[] = await this.userRepository.find();
        return users;
    }

    async saveUserFeedback(feedback: FeedbackDto, userId: string) {
        console.log('Feedback received:', feedback);
        const newFeedback: Feedback = new Feedback();
        newFeedback.title = feedback.title;
        newFeedback.description = feedback.description;
        newFeedback.status = feedback.status;
        newFeedback.userId = userId;

        await this.feedbackRepository.save(newFeedback);

        for (const content of feedback.tags) {
            const newTag = new Tag();
            newTag.feedbackId = newFeedback.uuid;
            newTag.content = content;
            await this.tagRepository.save(newTag);
        }

        return {
            success: true,
            message: 'Feedback saved successfully',
        };
    }

    async getUserFeedbacks(userId: string) {
        const feedbacks: Feedback[] = await this.feedbackRepository.find({
            where: { userId },
            relations: ['tags'],
        });

        return feedbacks;
    }



}
