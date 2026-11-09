import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTagTable1794227036157 implements MigrationInterface {
    name = 'CreateTagTable1794227036157'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`tags\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_d90243459a697eadb8ad56e909\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`task_tags\` (\`task_id\` int NOT NULL, \`tag_id\` int NOT NULL, INDEX \`IDX_70515bc464901781ac60b82a1e\` (\`task_id\`), INDEX \`IDX_f883135d033e1541f6a81972e7\` (\`tag_id\`), PRIMARY KEY (\`task_id\`, \`tag_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`task_tags\` ADD CONSTRAINT \`FK_70515bc464901781ac60b82a1ea\` FOREIGN KEY (\`task_id\`) REFERENCES \`tasks\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`task_tags\` ADD CONSTRAINT \`FK_f883135d033e1541f6a81972e7d\` FOREIGN KEY (\`tag_id\`) REFERENCES \`tags\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`task_tags\` DROP FOREIGN KEY \`FK_f883135d033e1541f6a81972e7d\``);
        await queryRunner.query(`ALTER TABLE \`task_tags\` DROP FOREIGN KEY \`FK_70515bc464901781ac60b82a1ea\``);
        await queryRunner.query(`DROP INDEX \`IDX_f883135d033e1541f6a81972e7\` ON \`task_tags\``);
        await queryRunner.query(`DROP INDEX \`IDX_70515bc464901781ac60b82a1e\` ON \`task_tags\``);
        await queryRunner.query(`DROP TABLE \`task_tags\``);
        await queryRunner.query(`DROP INDEX \`IDX_d90243459a697eadb8ad56e909\` ON \`tags\``);
        await queryRunner.query(`DROP TABLE \`tags\``);
    }

}
