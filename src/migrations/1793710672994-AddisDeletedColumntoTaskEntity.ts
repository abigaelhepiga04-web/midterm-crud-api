import { MigrationInterface, QueryRunner } from "typeorm";

export class AddisDeletedColumntoTaskEntity1793710672994 implements MigrationInterface {
    name = 'AddisDeletedColumntoTaskEntity1793710672994'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tasks\` ADD \`isDeleted\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tasks\` DROP COLUMN \`isDeleted\``);
    }

}
