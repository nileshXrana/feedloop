import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Feedback } from './feedback.entity';

@Entity('tags')
export class Tag {

    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column({ type: 'varchar' })
    feedbackId: string;

    @Column({ type: 'varchar' })
    content: string;

    // relations 
    @ManyToOne(() => Feedback, (feedback) => feedback.tags, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'feedbackId' })
    feedback: Feedback;

}