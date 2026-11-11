import { createAsyncThunk, createSlice, isRejected } from "@reduxjs/toolkit";
import type { AdminUser } from "../../types/admin";
import { getAdminUsers, deleteAdminUser } from "../../services/adminService";
interface State {
  items: AdminUser[];
  loading: boolean;
  error: string | null;
}
const initialState: State = { items: [], loading: false, error: null };
export const fetchPatients = createAsyncThunk("admin/patients", getAdminUsers);
export const removePatient = createAsyncThunk(
  "admin/patients/delete",
  deleteAdminUser,
);
const slice = createSlice({
  name: "patients",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(removePatient.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.meta.arg);
      })
      .addMatcher(isRejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Request failed";
      }),
});
export default slice.reducer;
