import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class Tags1786534317457 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'tags',
                columns: [
                    {
                        name: 'uuid',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'gen_random_uuid()',
                    },
                    {
                        name: 'feedbackId',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'content',
                        type: 'varchar',
                        isNullable: false,
                    }
                ],

            }),
            true,
        );
        await queryRunner.createForeignKey(
            "tags",
            new TableForeignKey({
                columnNames: ["feedbackId"],
                referencedColumnNames: ["uuid"],
                referencedTableName: "feedbacks",
                onDelete: "CASCADE",
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
