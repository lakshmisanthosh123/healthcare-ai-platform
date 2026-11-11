import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAdminRoles } from "../../services/adminService";
import type { AdminRole } from "../../types/admin";
interface RoleState {
  items: AdminRole[];
  loading: boolean;
  error: string | null;
}
const initialState: RoleState = { items: [], loading: false, error: null };
export const fetchRoles = createAsyncThunk("admin/roles", getAdminRoles);
export default createSlice({
  name: "roles",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder.addCase(fetchRoles.fulfilled, (state, action) => {
      state.items = action.payload;
      state.loading = false;
    }),
}).reducer;
