// Cria o admin inicial a partir de ADMIN_EMAIL / ADMIN_PASSWORD. Uso: npm run seed
import bcrypt from 'bcryptjs';
import dataSource from './data-source.js';
import { UserEntity } from '../modules/users/user.entity.js';
import { Role } from '../common/enums/role.enum.js';

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
if (!email || !password) throw new Error('Defina ADMIN_EMAIL e ADMIN_PASSWORD no .env');

await dataSource.initialize();
const repo = dataSource.getRepository(UserEntity);
if (await repo.exists({ where: { email } })) {
  console.log(`Admin ${email} já existe.`);
} else {
  await repo.save(repo.create({ name: 'Administrador', email, password: await bcrypt.hash(password, 12), role: Role.ADMIN }));
  console.log(`Admin ${email} criado.`);
}
await dataSource.destroy();
