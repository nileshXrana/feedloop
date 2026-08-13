import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from './user.entity';
import { Feedback } from './feedback.entity';

@Entity('votes')
@Unique(['userId', 'feedbackId'])
export class Vote {

    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column({ type: 'varchar' })
    userId: string;

    @Column({ type: 'varchar' })
    feedbackId: string;

    @Column({ type: 'varchar' })
    type: 'upvote' | 'downvote';

    // relations
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne(() => Feedback, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'feedbackId' })
    feedback: Feedback;

}
