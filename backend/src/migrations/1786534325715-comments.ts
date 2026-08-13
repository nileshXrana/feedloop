import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class Comments1786534325715 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'comments',
                columns: [
                    {
                        name: 'uuid',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'gen_random_uuid()',
                    },
                    {
                        name: 'content',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'feedbackId',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'parentCommentId',
                        type: 'uuid',
                        isNullable: true,
                    },
                    {
                        name: 'userId',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'isActive',
                        type: 'boolean',
                        default: true,
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'now()',
                    },
                ],
            }),
            true
        );

        await queryRunner.createForeignKey(
            'comments',
            new TableForeignKey({
                columnNames: ['feedbackId'],
                referencedColumnNames: ['uuid'],
                referencedTableName: 'feedbacks',
                onDelete: 'CASCADE',
            })
        );

        await queryRunner.createForeignKey(
            'comments',
            new TableForeignKey({
                columnNames: ['parentCommentId'],
                referencedColumnNames: ['uuid'],
                referencedTableName: 'comments',
                onDelete: 'CASCADE',
            })
        );

        await queryRunner.createForeignKey(
            'comments',
            new TableForeignKey({
                columnNames: ['userId'],
                referencedColumnNames: ['uuid'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('comments');
    }

}
