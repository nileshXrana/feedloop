import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from './users/entities/user.entity';
import { SeederOptions } from 'typeorm-extension';
import { AdminSeeder } from './seeds/admin.seeder';
import * as dotenv from 'dotenv';
import { Tag } from './users/entities/tag.entity';
import { Feedback } from './users/entities/feedback.entity';
import { Comment } from './users/entities/comment.entity';
import { Vote } from './users/entities/vote.entity';
dotenv.config();


export const AppDataSourceOptions: DataSourceOptions & SeederOptions = {
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [User, Feedback, Tag, Comment, Vote],
    synchronize: false,
    migrationsRun: true,
    logging: false,
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    seeds: [__dirname + '/seeds/*{.ts,.js}'],
};

export const AppDataSource = new DataSource(AppDataSourceOptions);