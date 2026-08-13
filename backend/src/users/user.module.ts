import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './dto/entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Tag } from './dto/entities/tag.entity';
import { Feedback } from './dto/entities/feedback.entity';
import { Comment } from './dto/entities/comment.entity';
import { Vote } from './dto/entities/vote.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Feedback, Tag, Comment, Vote])],
    providers: [UserService],
    controllers: [UserController],
    exports: [UserService],
})
export class UserModule { }
