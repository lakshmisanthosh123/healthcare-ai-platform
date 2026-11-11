import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getAdminSettings,
  updateAdminSettings,
} from "../../services/adminService";
import type { AdminSettings } from "../../types/admin";
interface SettingsState {
  value: AdminSettings | null;
  loading: boolean;
  error: string | null;
}
const initialState: SettingsState = {
  value: null,
  loading: false,
  error: null,
};
export const fetchSettings = createAsyncThunk(
  "admin/settings",
  getAdminSettings,
);
export const saveSettings = createAsyncThunk(
  "admin/settings/save",
  updateAdminSettings,
);
export default createSlice({
  name: "settings",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.value = action.payload;
        state.loading = false;
      })
      .addCase(saveSettings.fulfilled, (state, action) => {
        state.value = action.payload;
        state.loading = false;
      }),
}).reducer;
