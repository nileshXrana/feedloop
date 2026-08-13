import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UsersFeedbacksColumns1786534325714 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'feedbacksHidden',
                type: 'boolean',
                default: false,
            })
        );

        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'commentsHidden',
                type: 'boolean',
                default: false,
            })
        );

        await queryRunner.addColumn(
            'feedbacks',
            new TableColumn({
                name: 'isActive',
                type: 'boolean',
                default: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('feedbacks', 'isActive');
        await queryRunner.dropColumn('users', 'commentsHidden');
        await queryRunner.dropColumn('users', 'feedbacksHidden');
    }

}
