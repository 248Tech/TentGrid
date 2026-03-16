import { registerAs } from "@nestjs/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_INTERNAL_SECRET: z.string().min(1),
  AWS_REGION: z.string().default("us-east-1"),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET_NAME: z.string().min(1),
  S3_ENDPOINT_URL: z.string().optional(),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
});

export type AppConfig = z.infer<typeof envSchema>;

export const appConfig = registerAs("app", () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌ Invalid environment variables:", result.error.format());
    process.exit(1);
  }
  return result.data;
});
