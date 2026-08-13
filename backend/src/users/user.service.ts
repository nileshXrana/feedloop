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

    async getFeedbacks(query: any, loggedInUserId?: string, isAdmin = false) {
        const { search, tags, authors, sortByScore, page = 1, limit = 10, showDeleted } = query;

        const qb = this.feedbackRepository.createQueryBuilder('feedback')
            .leftJoinAndSelect('feedback.user', 'user')
            .leftJoinAndSelect('feedback.tags', 'tags');

        qb.addSelect(
            `(SELECT COALESCE(COUNT(*), 0) FROM votes v WHERE v."feedbackId" = feedback.uuid AND v.type = 'upvote') - ` +
            `(SELECT COALESCE(COUNT(*), 0) FROM votes v WHERE v."feedbackId" = feedback.uuid AND v.type = 'downvote')`,
            'feedback_score'
        );

        if (isAdmin) {
            if (showDeleted === 'false' || showDeleted === false || !showDeleted) {
                qb.andWhere('feedback.isActive = true');
            }
        } else {
            qb.andWhere('feedback.isActive = true');
            qb.andWhere('user.feedbacksHidden = false');
            if (loggedInUserId) {
                qb.andWhere('(feedback.status = :publicStatus OR feedback.userId = :userId)', {
                    publicStatus: 'public',
                    userId: loggedInUserId
                });
            } else {
                qb.andWhere('feedback.status = :publicStatus', { publicStatus: 'public' });
            }
        }

        if (search) {
            qb.andWhere('(feedback.title ILIKE :search OR feedback.description ILIKE :search)', { search: `%${search}%` });
        }

        if (tags) {
            const tagsArr = Array.isArray(tags) ? tags : [tags];
            if (tagsArr.length > 0) {
                qb.andWhere((sub) => {
                    const subQuery = sub.subQuery()
                        .select('t.feedbackId')
                        .from(Tag, 't')
                        .where('t.content IN (:...tagsArr)', { tagsArr })
                        .getQuery();
                    return 'feedback.uuid IN ' + subQuery;
                });
            }
        }

        if (authors) {
            const authorsArr = Array.isArray(authors) ? authors : [authors];
            if (authorsArr.length > 0) {
                qb.andWhere('user.username IN (:...authorsArr)', { authorsArr });
            }
        }

        if (sortByScore === 'asc') {
            qb.orderBy('feedback_score', 'ASC');
        } else if (sortByScore === 'desc') {
            qb.orderBy('feedback_score', 'DESC');
        } else {
            qb.orderBy('feedback.title', 'ASC');
        }

        const parsedPage = parseInt(page as string, 10) || 1;
        const parsedLimit = parseInt(limit as string, 10) || 10;
        const skip = (parsedPage - 1) * parsedLimit;
        qb.skip(skip).take(parsedLimit);

        const { entities, raw } = await qb.getRawAndEntities();

        const feedbacks = await Promise.all(entities.map(async (feedback, index) => {
            const r = raw[index];
            const score = parseInt(r.feedback_score || '0', 10);

            let userVote: string | null = null;
            if (loggedInUserId) {
                const vote = await this.voteRepository.findOne({
                    where: { userId: loggedInUserId, feedbackId: feedback.uuid }
                });
                if (vote) {
                    userVote = vote.type;
                }
            }

            return {
                ...feedback,
                score,
                userVote
            };
        }));

        return feedbacks;
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
        const qb = this.commentRepository.createQueryBuilder('comment')
            .leftJoinAndSelect('comment.user', 'user')
            .where('comment.feedbackId = :feedbackId', { feedbackId })
            .orderBy('comment.createdAt', 'ASC');

        if (!isAdmin) {
            qb.andWhere('user.commentsHidden = false');
        }

        const comments = await qb.getMany();

        return comments.map((comment) => {
            const isDeleted = !comment.isActive;
            const shouldShowOriginal = isAdmin && (showDeletedComments === true || (showDeletedComments as any) === 'true');

            if (isDeleted && !shouldShowOriginal) {
                return {
                    ...comment,
                    content: '[deleted]',
                    user: {
                        uuid: '',
                        username: '[deleted]',
                        email: ''
                    }
                };
            }
            return comment;
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
        const user = await this.userRepository.findOneBy({ uuid: userId });
        if (!user) throw new Error('User not found');
        user.feedbacksHidden = !user.feedbacksHidden;
        await this.userRepository.save(user);
        return user;
    }

    async toggleUserCommentsHidden(userId: string) {
        const user = await this.userRepository.findOneBy({ uuid: userId });
        if (!user) throw new Error('User not found');
        user.commentsHidden = !user.commentsHidden;
        await this.userRepository.save(user);
        return user;
    }

    async getUniqueTags() {
        const tags = await this.tagRepository.createQueryBuilder('tag')
            .select('DISTINCT tag.content', 'content')
            .getRawMany();
        return tags.map(t => t.content);
    }

}
