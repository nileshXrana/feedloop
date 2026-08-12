import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Feedback } from './feedback.entity';

export enum UserRole {
    ADMIN = "admin",
    USER = "user",
}

@Entity('users')
export class User {

    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column({ type: 'varchar', length: 40, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 20, unique: true })
    username: string;

    @Column({ type: 'varchar' })
    password: string;

    @Column({ type: 'varchar', length: 20, default: UserRole.USER })
    role: UserRole;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    // relations
    @OneToMany(() => Feedback, (feedback) => feedback.user)
    feedbacks: Feedback[];


}
