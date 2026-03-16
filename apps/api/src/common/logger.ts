import { LoggerService } from "@nestjs/common";
import pino from "pino";

const pinoLogger = pino({
  level: process.env["NODE_ENV"] === "production" ? "info" : "debug",
  transport:
    process.env["NODE_ENV"] !== "production"
      ? { target: "pino-pretty", options: { colorize: true, singleLine: true } }
      : undefined,
});

export function createLogger(context: string): LoggerService {
  const child = pinoLogger.child({ context });
  return {
    log: (msg: string, ...args: unknown[]) => child.info({ args }, msg),
    error: (msg: string, ...args: unknown[]) => child.error({ args }, msg),
    warn: (msg: string, ...args: unknown[]) => child.warn({ args }, msg),
    debug: (msg: string, ...args: unknown[]) => child.debug({ args }, msg),
    verbose: (msg: string, ...args: unknown[]) => child.trace({ args }, msg),
  };
}

export { pinoLogger };
