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

## Estrutura (padrão de arquitetura do 360)

```
src/
├── config/              configuration.ts (objeto tipado) + env.validation.ts (falha no boot se faltar variável)
├── shared/              tudo que é reutilizado entre módulos
│   ├── decorators/      @Public, @Roles, @CurrentUser, @IsCpf, @RawResponse
│   ├── dtos/            ResponseDto, PaginateQueryDto, PaginateResultDto
│   ├── enums/
│   ├── factories/       jwtFactory
│   ├── filters/         erro -> { success:false, errors:[...] }
│   ├── guards/          JwtAuthGuard e RolesGuard (globais, em app.module.ts)
│   ├── interceptors/    retorno -> { success:true, data }
│   ├── interfaces/      IBaseRepository<T>, JwtPayload/AuthUser
│   ├── model/           BaseModel (id uuid, created/updated/deleted_at)
│   ├── repositories/    BaseRepository<T> (implementa IBaseRepository) + integrações:
│   │                    S3Repository, CepRepository, SendgridRepository, ZenviaRepository
│   ├── utils/           MaskUtil, BooleanUtil, validators.util
│   └── shared.module.ts @Global: deixa as integrações injetáveis em qualquer módulo
└── modules/
    ├── _database/       database.module.ts, migrations/, config/
    │                    database.config.ts (app), database-migrations.config.ts (CLI), entities.config.ts
    ├── _database-seed/  database-seed.module.ts, seeders/ (comandos rodados pelo src/cli.ts)
    ├── auth/            controllers/ services/ dtos/ strategies/
    ├── user/            controllers/ services/ repositories/ models/ dtos/
    └── health/          controllers/
```

Convenções de cada módulo:

| Pasta | Arquivo / classe | Regra |
|---|---|---|
| `models/` | `user.model.ts` / `UserModel extends BaseModel` | só mapeamento TypeORM |
| `repositories/` | `user.repository.ts` / `UserRepository extends BaseRepository<UserModel>` | único lugar que fala com o banco; só consultas específicas, o CRUD vem do base |
| `services/` | `user.service.ts` / `UserService` | regra de negócio; usa repositories, nunca `Repository<T>` direto |
| `controllers/` | `user.controller.ts` / `UserController` | só recebe, valida (DTO) e delega; sem try/catch (filtro global trata) |
| `dtos/` | `<entidade>-<ação>-request.dto.ts` / `-response.dto.ts` | ex.: `user-register-request.dto.ts`, `user-get-response.dto.ts` |

Dependências injetadas com prefixo `_` (`private readonly _userRepository`), como no 360.

## Criar um módulo novo

1. Crie `src/modules/<nome>/` com `controllers/ services/ repositories/ models/ dtos/` e `<nome>.module.ts`
2. Model estendendo `BaseModel`; adicione em `entitiesConfig` no [entities.config.ts](src/modules/_database/config/entities.config.ts)
3. Repository estendendo `BaseRepository<T>` com `@InjectRepository(Model) protected readonly _model`; o módulo importa `DatabaseModule`
4. Importe o módulo no [app.module.ts](src/app.module.ts)
5. `npm run migration:generate` e `npm run migration:run`
6. Rotas já nascem protegidas; use `@Roles(Role.ADMIN)` ou `@Public()` quando precisar

## Seeds e comandos

`npm run seed` roda `node dist/cli.js seed:database` ([initial-seed.seed.ts](src/modules/_database-seed/seeders/initial-seed.seed.ts)), com DI do Nest (usa repositories e services). Comando novo: crie o seeder, registre no `DatabaseSeedModule` e adicione no mapa `commands` do [cli.ts](src/cli.ts).

## Diferenças em relação ao 360 antigo

- S3 no AWS SDK v3 (o v2 foi descontinuado); SendGrid, Zenvia e CEP via `fetch` nativo, sem `@ntegral/nestjs-sendgrid`, `@zenvia/sdk` e `@nestjs/axios`. As variáveis dessas integrações são opcionais e só dão erro quando a integração é usada sem estar configurada.
- `nestjs-command` foi trocado por um `cli.ts` sem dependências.

- Chave primária `id` (o 360 usava `_id`); `BaseModel` não estende o `BaseEntity` do TypeORM (sem active record).
- Validação com `class-validator` + `ValidationPipe` global (no lugar do `ValidatorInterceptor`); campo desconhecido no body é recusado.
- Guard JWT global: esquecer o `@UseGuards` não deixa mais rota aberta.
- O JWT é conferido no banco a cada request: usuário desativado/removido perde o acesso na hora, e o papel vale do banco, não do token.
- Senha com `select: false`, nunca sai em `find()`; respostas passam por `UserGetResponseDto`.
- Email normalizado (minúsculas) e único; CPF com dígito verificador; senha ≥ 8 com letras e números.
- Login com tempo constante (não revela se o email existe).
- Corrigidos: `expiresIn` virando `NaN`, `unique` na coluna de senha, guard de perfil lendo campo que não existia no token, `ENABLE_DOCS` lendo `ENABLE_CORS`.

## Avisos

- **Plugin do Swagger desligado** porque gera imports quebrados quando o caminho tem acento (`Licitação`). Por isso os DTOs têm `@ApiProperty` escrito à mão. Se mover o projeto para um caminho sem acento, dá para religar em `nest-cli.json` (`"plugins": ["@nestjs/swagger"]`).
- O Nest 12 tem `@nestjs/authentication` oficial; aqui foi mantido `@nestjs/jwt` + passport por ser o que o 360 já usava. Dá para migrar depois sem mudar as rotas.
