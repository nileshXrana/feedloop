import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Feedback } from './feedback.entity';

@Entity('comments')
export class Comment {

    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column({ type: 'varchar' })
    content: string;

    @Column({ type: 'varchar' })
    feedbackId: string;

    @Column({ type: 'varchar', nullable: true })
    parentCommentId: string | null;

    @Column({ type: 'varchar' })
    userId: string;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @ManyToOne(() => Feedback, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'feedbackId' })
    feedback: Feedback;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Comment, (comment) => comment.replies, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'parentCommentId' })
    parentComment: Comment | null;

    @OneToMany(() => Comment, (comment) => comment.parentComment)
    replies: Comment[];

}
