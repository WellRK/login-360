import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Move as tabelas do produto para o schema "app" (separado de schemas de outros serviços no mesmo banco).
 * A tabela "migrations" continua em public, para o histórico das migrations já aplicadas não se perder.
 */
export class SchemaApp1794990000000 implements MigrationInterface {
  name = 'SchemaApp1794990000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "app"`);
    await queryRunner.query(`ALTER TABLE "public"."users" SET SCHEMA "app"`);
    await queryRunner.query(`ALTER TYPE "public"."users_role_enum" SET SCHEMA "app"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "app"."users_role_enum" SET SCHEMA "public"`);
    await queryRunner.query(`ALTER TABLE "app"."users" SET SCHEMA "public"`);
  }
}
