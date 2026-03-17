export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: unknown;
}

const MAX_LOGS = 500;
const logs: LogEntry[] = [];

function addLog(level: LogLevel, context: string, message: string, data?: unknown): void {
  if (logs.length >= MAX_LOGS) logs.shift();
  logs.push({ timestamp: new Date().toISOString(), level, context, message, data });
}

export const logger = {
  info: (context: string, message: string, data?: unknown) => addLog("info", context, message, data),
  warn: (context: string, message: string, data?: unknown) => addLog("warn", context, message, data),
  error: (context: string, message: string, data?: unknown) => addLog("error", context, message, data),
  debug: (context: string, message: string, data?: unknown) => addLog("debug", context, message, data),
};

export function logdump(): LogEntry[] {
  return [...logs];
}

export function logdumpString(): string {
  const lines = logs.map(
    (e) =>
      `[${e.timestamp}] [${e.level.toUpperCase().padEnd(5)}] [${e.context}] ${e.message}` +
      (e.data !== undefined ? `\n  data: ${JSON.stringify(e.data, null, 2)}` : "")
  );
  const output = lines.join("\n") || "(no logs)";
  console.log(output);
  return output;
}

export function clearLogs(): void {
  logs.length = 0;
}

if (typeof window !== "undefined") {
  (window as any).__logdump = logdump;
  (window as any).__logdumpString = logdumpString;
}
