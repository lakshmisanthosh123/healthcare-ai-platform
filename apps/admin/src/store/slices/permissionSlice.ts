import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAdminPermissions } from "../../services/adminService";
import type { Permission } from "../../types/admin";
interface PermissionState {
  items: Permission[];
  loading: boolean;
  error: string | null;
}
const initialState: PermissionState = {
  items: [],
  loading: false,
  error: null,
};
export const fetchPermissions = createAsyncThunk(
  "admin/permissions",
  getAdminPermissions,
);
export default createSlice({
  name: "permissions",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder.addCase(fetchPermissions.fulfilled, (state, action) => {
      state.items = action.payload;
      state.loading = false;
    }),
}).reducer;
