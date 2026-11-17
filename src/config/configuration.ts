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
  // integrações do shared/repositories (opcionais: só falham quando usadas sem configurar)
  aws: {
    region: process.env.AWS_REGION ?? 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    emailSender: process.env.SENDGRID_EMAIL_SENDER,
  },
  zenvia: {
    token: process.env.ZENVIA_TOKEN,
    email: process.env.ZENVIA_EMAIL,
    smsFrom: process.env.ZENVIA_SMS_FROM ?? 'cto',
  },
  cepApi: process.env.CEP_API ?? 'https://viacep.com.br/ws/--cep--/json/',
});

export type AppConfig = ReturnType<typeof configuration>;
