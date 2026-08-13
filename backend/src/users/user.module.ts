import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Tag } from './entities/tag.entity';
import { Feedback } from './entities/feedback.entity';
import { Comment } from './entities/comment.entity';
import { Vote } from './entities/vote.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Feedback, Tag, Comment, Vote])],
    providers: [UserService],
    controllers: [UserController],
    exports: [UserService],
})
export class UserModule { }
