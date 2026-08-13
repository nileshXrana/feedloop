import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../auth/dto/auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bycrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Feedback } from './entities/feedback.entity';
import { FeedbackDto } from './dto/feedback.dto';
import { Tag } from './entities/tag.entity';
import { Comment } from './entities/comment.entity';
import { Vote } from './entities/vote.entity';
import { AppDataSource } from '../data-source';

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
        @InjectRepository(Comment) private readonly commentRepository: Repository<Comment>,
        @InjectRepository(Vote) private readonly voteRepository: Repository<Vote>,
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
        const user = await this.userRepository.findOneBy({ uuid: userId });
        if (!user || !user.isActive) {
            throw new UnauthorizedException('User account is disabled');
        }

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
            where: { userId, isActive: true },
            relations: ['tags'],
        });

        return feedbacks;
    }

    async getFeedbacks(_query: any, _loggedInUserId?: string, _isAdmin = false) {
        return this.feedbackRepository.find({
            where: { isActive: true },
            relations: ['tags', 'user'],
            order: { title: 'ASC' }
        });
    }

    async voteFeedback(feedbackId: string, userId: string, type: 'upvote' | 'downvote') {
        const user = await this.userRepository.findOneBy({ uuid: userId });
        if (!user || !user.isActive) {
            throw new UnauthorizedException('User account is disabled');
        }

        const existingVote = await this.voteRepository.findOne({
            where: { userId, feedbackId }
        });

        if (existingVote) {
            if (existingVote.type === type) {
                await this.voteRepository.remove(existingVote);
            } else {
                existingVote.type = type;
                await this.voteRepository.save(existingVote);
            }
        } else {
            const newVote = this.voteRepository.create({
                userId,
                feedbackId,
                type
            });
            await this.voteRepository.save(newVote);
        }

        const upvotes = await this.voteRepository.count({ where: { feedbackId, type: 'upvote' } });
        const downvotes = await this.voteRepository.count({ where: { feedbackId, type: 'downvote' } });
        const score = upvotes - downvotes;

        const currentVote = await this.voteRepository.findOne({
            where: { userId, feedbackId }
        });

        return {
            score,
            userVote: currentVote ? currentVote.type : null
        };
    }

    async addComment(feedbackId: string, userId: string, content: string, parentCommentId?: string) {
        const user = await this.userRepository.findOneBy({ uuid: userId });
        if (!user || !user.isActive) {
            throw new UnauthorizedException('User account is disabled');
        }

        const newComment = this.commentRepository.create({
            feedbackId,
            userId,
            content,
            parentCommentId: parentCommentId || null,
        });

        await this.commentRepository.save(newComment);
        return newComment;
    }

    async getFeedbackComments(feedbackId: string, loggedInUserId?: string, showDeletedComments = false, isAdmin = false) {

        return this.commentRepository.find({
            where: { feedbackId, isActive: true },
            relations: ['user'],
            order: { createdAt: 'ASC' }
        });
    }

    async deleteComment(commentId: string, userId: string, isAdmin = false) {
        const comment = await this.commentRepository.findOneBy({ uuid: commentId });
        if (!comment) {
            throw new Error('Comment not found');
        }

        if (!isAdmin && comment.userId !== userId) {
            throw new UnauthorizedException('Cannot delete another user\'s comment');
        }

        comment.isActive = false;
        await this.commentRepository.save(comment);
        return { success: true };
    }

    async deleteFeedback(feedbackId: string, userId: string) {
        const feedback = await this.feedbackRepository.findOneBy({ uuid: feedbackId });
        if (!feedback) throw new Error('Feedback not found');
        if (feedback.userId !== userId) throw new UnauthorizedException('Cannot delete another user\'s feedback');
        feedback.isActive = false;
        await this.feedbackRepository.save(feedback);
        return { success: true };
    }

    async updateFeedbackStatus(feedbackId: string, status: 'public' | 'private', userId: string) {
        const feedback = await this.feedbackRepository.findOneBy({ uuid: feedbackId });
        if (!feedback) throw new Error('Feedback not found');
        if (feedback.userId !== userId) throw new UnauthorizedException('Cannot update status of another user\'s feedback');
        feedback.status = status;
        await this.feedbackRepository.save(feedback);
        return feedback;
    }

    async getAdminUsers(page = 1, limit = 10) {
        const parsedPage = parseInt(page as any, 10) || 1;
        const parsedLimit = parseInt(limit as any, 10) || 10;
        const skip = (parsedPage - 1) * parsedLimit;
        const [users, total] = await this.userRepository.findAndCount({
            skip,
            take: parsedLimit,
            order: { username: 'ASC' }
        });
        return { users, total };
    }

    async toggleUserActive(userId: string) {
        const user = await this.userRepository.findOneBy({ uuid: userId });
        if (!user) throw new Error('User not found');
        user.isActive = !user.isActive;
        await this.userRepository.save(user);
        return user;
    }

    async toggleUserFeedbacksHidden(userId: string) {
        return await AppDataSource.transaction(async (manager) => {
            const userRepo = manager.getRepository(User);
            const feedbackRepo = manager.getRepository(Feedback);

            const user = await userRepo.findOneBy({ uuid: userId });
            if (!user) throw new Error('User not found');

            const newHidden = !user.feedbacksHidden;
            user.feedbacksHidden = newHidden;

            await userRepo.save(user);

            if (newHidden) {
                await feedbackRepo.createQueryBuilder()
                    .update(Feedback)
                    .set({ isActive: false })
                    .where('userId = :userId', { userId })
                    .execute();
            }

            return user;
        });
    }

    async toggleUserCommentsHidden(userId: string) {

        return await AppDataSource.transaction(async (manager) => {
            const userRepo = manager.getRepository(User);
            const commentRepo = manager.getRepository(Comment);

            const user = await userRepo.findOneBy({ uuid: userId });
            if (!user) throw new Error('User not found');

            const newHidden = !user.commentsHidden;
            user.commentsHidden = newHidden;

            await userRepo.save(user);

            if (newHidden) {
                await commentRepo.createQueryBuilder()
                    .update(Comment)
                    .set({ isActive: false })
                    .where('userId = :userId', { userId })
                    .execute();
            }

            return user;
        });
    }

    async getUniqueTags() {
        const tags = await this.tagRepository.createQueryBuilder('tag')
            .select('DISTINCT tag.content', 'content')
            .getRawMany();
        return tags.map(t => t.content);
    }

}
