import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { Tag } from './tag.entity';

@Entity('feedbacks')
export class Feedback {

    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column({ type: 'varchar', length: 40 })
    title: string;

    @Column({ type: 'varchar' })
    description: string;

    @Column({ type: 'varchar' })
    status: 'public' | 'private';

    @Column({ type: 'varchar' })
    userId: string;

    // relations 
    @ManyToOne(() => User, (user) => user.feedbacks, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @OneToMany(() => Tag, (tag) => tag.feedback, { cascade: true })
    tags: Tag[];

}