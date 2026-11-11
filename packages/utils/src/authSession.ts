export const AUTH_SESSION_KEY = "healthcare-auth-session";
export const ACCESS_TOKEN_KEY = "access_token";
export const AUTH_SESSION_CHANGED_EVENT = "healthcare-auth-session-changed";

export type UserRole = "doctor" | "patient" | "staff" | "admin";

const roleHomePaths: Record<UserRole, string> = {
  doctor: "/profile",
  patient: "/patient",
  staff: "/profile",
  admin: "/users",
};

export function normalizeUserRole(role: unknown): UserRole | null {
  if (typeof role !== "string") return null;

  const normalizedRole = role
    .trim()
    .toLowerCase()
    .replace(/^role[_\s-]/, "");
  return Object.prototype.hasOwnProperty.call(roleHomePaths, normalizedRole)
    ? (normalizedRole as UserRole)
    : null;
}

export function getRoleHomePath(role: unknown): string | null {
  const normalizedRole = normalizeUserRole(role);
  return normalizedRole ? roleHomePaths[normalizedRole] : null;
}

export interface AuthSession {
  accessToken?: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    avatar?: string;
    document?: {
      name: string;
      type: string;
      dataUrl: string;
      size: number;
    };
  };
}

export function getStoredAuthSession(): AuthSession | null {
  try {
    const stored = localStorage.getItem(AUTH_SESSION_KEY);
    if (!stored) return null;
    const session: unknown = JSON.parse(stored);
    if (!session || typeof session !== "object") return null;
    return session as AuthSession;
  } catch {
    return null;
  }
}

export function getStoredAccessToken(): string | null {
  return (
    localStorage.getItem(ACCESS_TOKEN_KEY) ??
    getStoredAuthSession()?.accessToken ??
    null
  );
}

export function notifyAuthSessionChanged(): void {
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
}

export function clearStoredAuthSession(): void {
  localStorage.removeItem(AUTH_SESSION_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  notifyAuthSessionChanged();
}
