export const configuration = () => ({
  env: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  corsOrigins: (process.env.CORS_ORIGINS ?? '*').split(',').map((o) => o.trim()),
  enableDocs: process.env.ENABLE_DOCS === 'true',
  allowRegister: process.env.ALLOW_REGISTER === 'true',
  trustProxy: Number(process.env.TRUST_PROXY ?? 0),
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 5432),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    // número puro = segundos; senão string no formato ms ('1h', '7d')
    expiresIn: /^\d+$/.test(process.env.JWT_EXPIRATION ?? '')
      ? Number(process.env.JWT_EXPIRATION)
      : (process.env.JWT_EXPIRATION ?? '1d'),
  },
});

export type AppConfig = ReturnType<typeof configuration>;
