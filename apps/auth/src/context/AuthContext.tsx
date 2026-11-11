import { createContext, useContext, useEffect, type ReactNode } from "react";
import { Provider } from "react-redux";
import type { RootState } from "../store/store";
import {
  getCurrentUser,
  login,
  logout,
  register,
} from "../features/auth/authSlice";
import { store } from "../store/store";
import { useAppDispatch, useAppSelector } from "../store/hooks";

const AuthContext = createContext<RootState["auth"] | null>(null);

function AuthContextValue({ children }: { children: ReactNode }) {
  const auth = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (auth.accessToken) void dispatch(getCurrentUser());
  }, [auth.accessToken, dispatch]);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AuthContextValue>{children}</AuthContextValue>
    </Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};

export { getCurrentUser, login, logout, register };
