export type LogLevel = "debug" | "info" | "warn" | "error";

const isDev =
  typeof process === "undefined" ||
  (process.env.NODE_ENV ?? "development") === "development";

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDev) console.debug("[debug]", ...args);
  },
  info: (...args: unknown[]) => {
    console.info("[info]", ...args);
  },
  warn: (...args: unknown[]) => {
    console.warn("[warn]", ...args);
  },
  error: (...args: unknown[]) => {
    console.error("[error]", ...args);
  },
};
