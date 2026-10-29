import 'dotenv/config';
import { z } from 'zod';

/**
 * Environment validation.
 *
 * The process refuses to start when configuration is missing or malformed, so a
 * deployment fails immediately and loudly instead of serving traffic with, say,
 * an empty JWT secret.
 */
/**
 * An optional setting that may be present but blank.
 *
 * Hosting panels and `.env` files routinely hold `KEY=` for "not configured",
 * and an empty string is not the same as an absent one to Zod. Treating the two
 * alike is what keeps a blank line in the file from failing start-up.
 */
const optional = (schema: z.ZodString = z.string()) =>
  z.preprocess((value) => (value === '' ? undefined : value), schema.optional());

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),

    DATABASE_URL: z.string().url(),

    /**
     * Signing key for session tokens. 32 bytes minimum; generate with:
     *   node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
     */
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    /** Session lifetime. Short enough to limit damage, long enough to be usable. */
    SESSION_TTL_HOURS: z.coerce.number().int().min(1).max(720).default(72),

    /**
     * Comma-separated list of browser origins allowed to call the API with
     * credentials. Never use "*" here: it is incompatible with cookies.
     */
    CORS_ORIGINS: z
      .string()
      .default('http://localhost:5173')
      .transform((value) =>
        value
          .split(',')
          .map((origin) => origin.trim())
          .filter(Boolean),
      ),

    /** Set when the API and the web client are served from different sites. */
    COOKIE_DOMAIN: optional(),

    /** Image hosting. When absent, upload endpoints report 503 rather than failing oddly. */
    CLOUDINARY_CLOUD_NAME: optional(),
    CLOUDINARY_API_KEY: optional(),
    CLOUDINARY_API_SECRET: optional(),

    /**
     * Mailbox that receives the super administrator's sign-in and recovery
     * codes. Deliberately configured here and not editable through the admin
     * panel: otherwise a hijacked session could redirect the second factor.
     */
    RECOVERY_EMAIL: z.string().email(),

    /** SMTP transport for one-time codes. Without it, codes cannot be delivered. */
    SMTP_HOST: optional(),
    SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
    SMTP_USER: optional(),
    SMTP_PASSWORD: optional(),
    SMTP_FROM: optional(),

    /** Seed credentials for the first administrator. Only read by `npm run db:seed`. */
    SEED_ADMIN_EMAIL: optional(z.string().email()),
    SEED_ADMIN_PASSWORD: optional(),
    SEED_ADMIN_NAME: optional(),
  })
  .superRefine((env, ctx) => {
    // Cookies are marked Secure in production, which browsers only accept over
    // HTTPS. A plain-http origin there is a misconfiguration that would present
    // itself as "login silently does nothing".
    if (env.NODE_ENV === 'production') {
      for (const origin of env.CORS_ORIGINS) {
        if (origin.startsWith('http://')) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['CORS_ORIGINS'],
            message: `Origin "${origin}" must use https in production`,
          });
        }
      }

      // Administrator sign-in depends on delivering a code by e-mail. Without a
      // transport, production would start and then lock every administrator out.
      if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['SMTP_HOST'],
          message: 'SMTP_HOST, SMTP_USER and SMTP_PASSWORD are required in production',
        });
      }
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');

  throw new Error(`Invalid environment configuration:\n${details}`);
}

export const env = parsed.data;

export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

/** Whether image uploads can be served at all. */
export const hasImageHosting = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
);

/** Whether one-time codes can actually be delivered. */
export const hasMailTransport = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD);
