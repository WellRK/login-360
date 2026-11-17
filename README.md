# API 360 — core (NestJS 12)

Base de autenticação e usuários reaproveitada do 360 antigo, atualizada para NestJS 12 (ESM), TypeORM 1.x e Vitest.

## Subir do zero

```bash
nvm install 24 && nvm use 24     # Nest 12 pede Node >= 22.22.3 (24 LTS recomendado)
npm install                      # se o npm 10 der "edgesOut": npx npm@11 install
cp .env.example .env             # e troque JWT_SECRET e ADMIN_PASSWORD
npm run db:up                    # Postgres 17 na porta 5432
npm run migration:run
npm run seed                     # cria o admin do .env
npm run start:dev                # http://localhost:3000/api  |  Swagger: http://localhost:3000/docs
```

## Comandos do dia a dia

| Comando | O que faz |
|---|---|
| `npm run start:dev` | API com reload |
| `npm test` / `npm run test:e2e` | unitários / e2e (e2e precisa do banco no ar) |
| `npm run migration:generate` | gera migration a partir das entities (renomeie o arquivo depois) |
| `npm run migration:run` / `migration:revert` | aplica / desfaz a última |
| `npm run lint` | oxlint |

`synchronize` está sempre desligado: o schema só muda por migration.

## Rotas

Prefixo `/api`. Toda rota exige `Authorization: Bearer <token>`, exceto as marcadas com `@Public()`.

| Método | Rota | Quem |
|---|---|---|
| GET | `/health` | público |
| POST | `/auth/register` | público — cria usuário `user` e já devolve o token |
| POST | `/auth/login` | público |
| GET | `/auth/me` | logado (dados do token) |
| GET / PATCH | `/users/me` | logado |
| PATCH | `/users/me/password` | logado |
| GET | `/users?take=&skip=` | admin |
| GET / DELETE | `/users/:id` | admin (DELETE = soft delete) |
| PATCH | `/users/:id/activate` · `/deactivate` | admin |

Toda resposta segue o envelope do 360: `{ success, data, errors }`.

## Estrutura

```
src/
├── config/          configuration.ts (objeto tipado) + env.validation.ts (falha no boot se faltar variável)
├── database/        data-source.ts (app + CLI), migrations/, seed.ts
├── common/
│   ├── decorators/  @Public, @Roles, @CurrentUser, @IsCpf
│   ├── guards/      JwtAuthGuard e RolesGuard (globais, em app.module.ts)
│   ├── filters/     erro -> { success:false, errors:[...] }
│   ├── interceptors/ retorno -> { success:true, data }
│   ├── entities/    BaseEntity (id uuid, created/updated/deleted_at)
│   ├── repositories/ BaseRepository<T>
│   └── dto/ utils/ enums/ interfaces/
└── modules/
    ├── auth/        login, register, JwtStrategy
    ├── users/       entity, repository, service, controller
    └── health/
```

## Criar um módulo novo

1. `npx nest g resource modules/<nome> --no-spec` (escolha REST)
2. Entity estendendo `BaseEntity`, adicione em `entities` no [data-source.ts](src/database/data-source.ts)
3. Repository estendendo `BaseRepository<T>`
4. `npm run migration:generate` e `npm run migration:run`
5. Rotas já nascem protegidas; use `@Roles(Role.ADMIN)` ou `@Public()` quando precisar

## Diferenças em relação ao 360 antigo

- Validação com `class-validator` + `ValidationPipe` global (no lugar do `ValidatorInterceptor`); campo desconhecido no body é recusado.
- Guard JWT global: esquecer o `@UseGuards` não deixa mais rota aberta.
- O JWT é conferido no banco a cada request: usuário desativado/removido perde o acesso na hora, e o papel vale do banco, não do token.
- Senha com `select: false`, nunca sai em `find()`; respostas passam por `UserResponseDto`.
- Email normalizado (minúsculas) e único; CPF com dígito verificador; senha ≥ 8 com letras e números.
- Login com tempo constante (não revela se o email existe).
- Corrigidos: `expiresIn` virando `NaN`, `unique` na coluna de senha, guard de perfil lendo campo que não existia no token, `ENABLE_DOCS` lendo `ENABLE_CORS`.

## Avisos

- **Plugin do Swagger desligado** porque gera imports quebrados quando o caminho tem acento (`Licitação`). Por isso os DTOs têm `@ApiProperty` escrito à mão. Se mover o projeto para um caminho sem acento, dá para religar em `nest-cli.json` (`"plugins": ["@nestjs/swagger"]`).
- O Nest 12 tem `@nestjs/authentication` oficial; aqui foi mantido `@nestjs/jwt` + passport por ser o que o 360 já usava. Dá para migrar depois sem mudar as rotas.
