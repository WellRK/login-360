// Comandos fora do HTTP (equivalente ao cli.ts + nestjs-command do 360).
// Uso: node dist/cli.js <comando>   |   npm run seed
import { Logger, type INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { InitialSeed } from './modules/_database-seed/seeders/initial-seed.seed.js';

const commands: Record<string, (app: INestApplicationContext) => Promise<void>> = {
  'seed:database': (app) => app.get(InitialSeed).seed(),
};

const name = process.argv[2];
const command = commands[name];
if (!command) {
  console.error(`Comando desconhecido: ${name ?? '(nenhum)'}\nDisponíveis: ${Object.keys(commands).join(', ')}`);
  process.exit(1);
}

const app = await NestFactory.createApplicationContext(AppModule, { logger: ['log', 'error', 'warn'] });
try {
  await command(app);
} catch (error) {
  new Logger('cli').error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await app.close();
}
