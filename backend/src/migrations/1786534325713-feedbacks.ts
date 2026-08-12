import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class Feedbacks1786534325713 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'feedbacks',
                columns: [
                    {
                        name: 'uuid',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'gen_random_uuid()',
                    },
                    {
                        name: 'title',
                        type: 'varchar',
                        length: '40',
                        isNullable: false,
                    },
                    {
                        name: 'description',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'status',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'userId',
                        type: 'uuid',
                        isNullable: false,
                    },
                ],
            }),
            true,
        );
        await queryRunner.createForeignKey(
            "feedbacks",
            new TableForeignKey({
                columnNames: ["userId"],
                referencedColumnNames: ["uuid"],
                referencedTableName: "users",
                onDelete: "CASCADE",
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('feedbacks');
    }

}
