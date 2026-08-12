import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class FeedbackDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsIn(['public', 'private'])
    status: 'public' | 'private';

    @IsString({ each: true })
    tags: string[];
}