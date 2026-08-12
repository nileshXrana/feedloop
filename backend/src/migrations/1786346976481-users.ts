
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class users1786346976481 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'users',
                columns: [
                    {
                        name: 'uuid',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'gen_random_uuid()',
                    },
                    {
                        name: 'email',
                        type: 'varchar',
                        length: '40',
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: 'username',
                        type: 'varchar',
                        length: '20',
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: 'password',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'role',
                        type: 'varchar',
                        length: '20',
                        default: "'user'",
                    },
                    {
                        name: 'isActive',
                        type: 'boolean',
                        default: true,
                    },
                ],
            }),
            true,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.dropTable('users');
    }

}
