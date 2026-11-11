import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ErrorInfo,
  type LazyExoticComponent,
  type ReactNode,
} from "react";
import {
  ACCESS_TOKEN_KEY,
  AUTH_SESSION_CHANGED_EVENT,
  clearStoredAuthSession,
  getStoredAuthSession,
  normalizeUserRole,
  type UserRole,
} from "@healthcare-platform/utils";
import "./App.css";

const AuthApp = lazy(() => import("auth/App"));
const DashboardApp = lazy(() => import("dashboard/App"));
const PatientApp = lazy(() => import("patient/App"));
const DoctorApp = lazy(() => import("doctor/App"));
const AdminApp = lazy(() => import("admin/App"));
const StaffApp = lazy(() => import("staff/App"));

type RemoteName = "auth" | "dashboard" | UserRole;

const dashboardRoutes = [
  "/dashboard",
  "/dashboard/doctors",
  "/dashboard/patients",
  "/dashboard/revenue",
  "/dashboard/appointments",
  "/analytics",
  "/reports",
  "/charts",
  "/notifications",
] as const;

const moduleHome: Record<UserRole, string> = {
  doctor: "/profile",
  patient: "/patient",
  staff: "/profile",
  admin: "/users",
};

const moduleRoutes: Record<UserRole, readonly string[]> = {
  doctor: [
    "/",
    "/dashboard",
    "/doctors",
    "/patients",
    "/appointments",
    "/schedule",
    "/prescriptions",
    "/profile",
  ],
  patient: [
    "/",
    "/dashboard",
    "/patient",
    "/profile",
    "/medical-history",
    "/prescriptions",
    "/appointments",
  ],
  staff: ["/", "/profile"],
  admin: [
    "/",
    ...dashboardRoutes,
    "/users",
    "/doctors",
    "/roles",
    "/permissions",
    "/settings",
    "/audit-logs",
    "/profile",
  ],
};

const moduleBase: Record<UserRole, string> = {
  doctor: "/doctor",
  patient: "/patient",
  staff: "/staff",
  admin: "/admin",
};

const remotes: Record<RemoteName, LazyExoticComponent<ComponentType>> = {
  auth: AuthApp,
  dashboard: DashboardApp,
  doctor: DoctorApp,
  patient: PatientApp,
  staff: StaffApp,
  admin: AdminApp,
};

function getSessionRole(): UserRole | null {
  return normalizeUserRole(getStoredAuthSession()?.user?.role);
}

function isAuthenticated(): boolean {
  return Boolean(
    localStorage.getItem(ACCESS_TOKEN_KEY) ||
    getStoredAuthSession()?.accessToken,
  );
}

function isAuthRoute(pathname: string): boolean {
  return [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/otp",
  ].includes(pathname);
}

function normalizeModulePath(role: UserRole, pathname: string): string {
  const base = moduleBase[role];
  if (pathname === base) {
    return moduleHome[role];
  }
  if (pathname.startsWith(`${base}/`)) {
    const suffix = pathname.slice(base.length) || "/";
    if (moduleRoutes[role].includes(suffix)) {
      return suffix === "/" ? moduleHome[role] : suffix;
    }
    return moduleHome[role];
  }

  if (
    pathname.startsWith("/doctor/") ||
    pathname.startsWith("/patient/") ||
    pathname.startsWith("/staff/") ||
    pathname.startsWith("/admin/") ||
    pathname === "/doctor" ||
    pathname === "/patient" ||
    pathname === "/staff" ||
    pathname === "/admin"
  ) {
    return moduleHome[role];
  }

  return moduleRoutes[role].includes(pathname)
    ? pathname === "/"
      ? moduleHome[role]
      : pathname
    : moduleHome[role];
}

class RemoteErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="shell-message" role="alert">
          <h1>Module unavailable</h1>
          <p>The selected application could not be loaded.</p>
          <button type="button" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="shell-message" role="status">
      <span className="shell-spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export default function App() {
  const [pathname, setPathname] = useState(window.location.pathname);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [sessionRevision, setSessionRevision] = useState(0);

  const syncLocation = useCallback(() => {
    setPathname(window.location.pathname);
  }, []);

  useEffect(() => {
    const updateSession = () => setSessionRevision((revision) => revision + 1);
    window.addEventListener("popstate", syncLocation);
    window.addEventListener("storage", updateSession);
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, updateSession);
    setIsCheckingSession(false);
    return () => {
      window.removeEventListener("popstate", syncLocation);
      window.removeEventListener("storage", updateSession);
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, updateSession);
    };
  }, [syncLocation]);

  const authenticated = useMemo(() => isAuthenticated(), [sessionRevision]);
  const role = useMemo(() => getSessionRole(), [sessionRevision]);
  const remoteName: RemoteName =
    !authenticated || isAuthRoute(pathname)
      ? "auth"
      : role === "admin" &&
          (dashboardRoutes as readonly string[]).includes(pathname)
        ? "dashboard"
        : role !== null
          ? role
          : "auth";
  const normalizedPath =
    authenticated && role !== null
      ? isAuthRoute(pathname)
        ? moduleHome[role]
        : normalizeModulePath(role, pathname)
      : !authenticated && !isAuthRoute(pathname)
        ? "/login"
        : pathname;

  useEffect(() => {
    if (normalizedPath !== pathname) {
      window.history.replaceState(null, "", normalizedPath);
      setPathname(normalizedPath);
    }
  }, [normalizedPath, pathname]);

  if (isCheckingSession || normalizedPath !== pathname) {
    return <LoadingState label="Checking your session…" />;
  }

  if (authenticated && role === null) {
    return (
      <div className="shell-message" role="alert">
        <h1>Unable to route your account</h1>
        <p>Your authenticated role is not recognized by this application.</p>
        <button
          type="button"
          onClick={() => {
            clearStoredAuthSession();
            window.history.replaceState(null, "", "/login");
            setPathname("/login");
          }}
        >
          Return to login
        </button>
      </div>
    );
  }

  const RemoteApp = remotes[remoteName];
  return (
    <RemoteErrorBoundary>
      <Suspense fallback={<LoadingState label="Loading application…" />}>
        <RemoteApp />
      </Suspense>
    </RemoteErrorBoundary>
  );
}
