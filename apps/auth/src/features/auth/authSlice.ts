import {
  createAsyncThunk,
  createSlice,
  isRejected,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";
import {
  api,
  clearStoredSession,
  getStoredSession,
  setStoredToken,
  setStoredSession,
} from "../../services/api";
import type {
  AuthUser,
  LoginFormValues,
  RegisterFormValues,
} from "../../types/auth";

export interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const storedSession = getStoredSession();
const storedAccessToken =
  storedSession?.accessToken ?? localStorage.getItem("access_token");
const initialState: AuthState = {
  accessToken: storedAccessToken,
  user: storedSession?.user ?? null,
  isAuthenticated: Boolean(storedAccessToken),
  loading: false,
  error: null,
};

interface AuthResponse {
  access_token: string;
  token_type?: string;
  user?: AuthUser;
}

const readAuthResponse = (response: AuthResponse) => ({
  accessToken: response.access_token,
  user: response.user,
});

export const login = createAsyncThunk(
  "auth/login",
  async (payload: LoginFormValues) => {
    const { data } = await api.post<AuthResponse>("/auth/login", {
      ...payload,
      email: payload.email.trim(),
    });
    const session = readAuthResponse(data);
    setStoredToken(session.accessToken);
    const user = session.user ?? (await api.get<AuthUser>("/auth/me")).data;
    return { accessToken: session.accessToken, user };
  },
);

export const register = createAsyncThunk(
  "auth/register",
  async (payload: RegisterFormValues, { rejectWithValue }) => {
    try {
      const { data } = await api.post<AuthResponse>("/auth/register", {
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
        email: payload.email.trim(),
        password: payload.password,
        role: "patient",
        phone: payload.phone.trim(),
        dateOfBirth: payload.dateOfBirth,
        gender: payload.gender,
        bloodType: payload.bloodType,
        address: payload.address.trim(),
      });
      if (!data.access_token) {
        return rejectWithValue(
          "The server created the account but did not return a sign-in token.",
        );
      }
      const session = readAuthResponse(data);
      setStoredToken(session.accessToken);
      const user = session.user ?? (await api.get<AuthUser>("/auth/me")).data;
      return { accessToken: session.accessToken, user };
    } catch (error) {
      if (axios.isAxiosError(error) && !error.response) {
        return rejectWithValue(
          "Cannot reach the account server at 127.0.0.1:8001. Start it with pnpm dev:backend.",
        );
      }
      const detail = axios.isAxiosError<{ detail?: unknown }>(error)
        ? error.response?.data?.detail
        : undefined;
      return rejectWithValue(
        typeof detail === "string"
          ? detail
          : error instanceof Error
            ? error.message
            : "Unable to connect to the account server. Start the backend with pnpm dev:backend.",
      );
    }
  },
);

export const getCurrentUser = createAsyncThunk("auth/me", async () => {
  const { data } = await api.get<AuthUser>("/auth/me");
  return data;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    profileUpdated(state, action: PayloadAction<Partial<AuthUser>>) {
      if (!state.user) return;
      state.user = { ...state.user, ...action.payload };
      if (state.accessToken) {
        setStoredSession({ accessToken: state.accessToken, user: state.user });
      }
    },
    logout(state) {
      state.accessToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      clearStoredSession();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        setStoredSession(action.payload);
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        setStoredSession(action.payload);
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        if (state.accessToken) {
          setStoredSession({
            accessToken: state.accessToken,
            user: action.payload,
          });
        }
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.accessToken = null;
        state.user = null;
        state.isAuthenticated = false;
        clearStoredSession();
      })
      .addMatcher(isRejected, (state, action) => {
        state.loading = false;
        state.error =
          (typeof action.payload === "string" && action.payload) ||
          action.error.message ||
          "Request failed";
      });
  },
});

export const { logout, profileUpdated } = authSlice.actions;
export default authSlice.reducer;
