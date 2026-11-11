export const APP_NAME = "Healthcare AI Platform";
export const API_BASE_URL =
  typeof process === "undefined" ? "" : (process.env.API_BASE_URL ?? "");

export const STORAGE_KEYS = {
  AUTH_TOKEN: "hap:auth_token",
  USER_PROFILE: "hap:user_profile",
};
