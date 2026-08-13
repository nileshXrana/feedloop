import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableUnique } from 'typeorm';

export class Votes1786534325716 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'votes',
                columns: [
                    {
                        name: 'uuid',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'gen_random_uuid()',
                    },
                    {
                        name: 'userId',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'feedbackId',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'type',
                        type: 'varchar',
                        isNullable: false,
                    },
                ],
            }),
            true
        );

        await queryRunner.createForeignKey(
            'votes',
            new TableForeignKey({
                columnNames: ['userId'],
                referencedColumnNames: ['uuid'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            })
        );

        await queryRunner.createForeignKey(
            'votes',
            new TableForeignKey({
                columnNames: ['feedbackId'],
                referencedColumnNames: ['uuid'],
                referencedTableName: 'feedbacks',
                onDelete: 'CASCADE',
            })
        );

        await queryRunner.createUniqueConstraint(
            'votes',
            new TableUnique({
                name: 'UQ_VOTES_USER_FEEDBACK',
                columnNames: ['userId', 'feedbackId'],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('votes');
    }

}
