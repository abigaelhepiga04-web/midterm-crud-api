import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCategoryTable1793709391288 implements MigrationInterface {
    name = 'CreateCategoryTable1793709391288'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`categories\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`tasks\` ADD \`categoryId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`tasks\` ADD CONSTRAINT \`FK_8ae9301033f772a42330e917a7d\` FOREIGN KEY (\`categoryId\`) REFERENCES \`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tasks\` DROP FOREIGN KEY \`FK_8ae9301033f772a42330e917a7d\``);
        await queryRunner.query(`ALTER TABLE \`tasks\` DROP COLUMN \`categoryId\``);
        await queryRunner.query(`DROP TABLE \`categories\``);
    }

}
