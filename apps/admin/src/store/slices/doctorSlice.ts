import { createAsyncThunk, createSlice, isRejected } from "@reduxjs/toolkit";
import type { Doctor } from "@healthcare-platform/types";
import {
  createDoctor,
  deleteDoctor,
  getAdminDoctors,
  updateDoctor,
} from "../../services/adminService";
interface State {
  items: Doctor[];
  loading: boolean;
  error: string | null;
}
const initialState: State = { items: [], loading: false, error: null };
export const fetchDoctors = createAsyncThunk("admin/doctors", getAdminDoctors);
export const addDoctor = createAsyncThunk("admin/doctors/create", createDoctor);
export const editDoctor = createAsyncThunk(
  "admin/doctors/update",
  ({ id, payload }: { id: string; payload: Partial<Doctor> }) =>
    updateDoctor(id, payload),
);
export const removeDoctor = createAsyncThunk(
  "admin/doctors/delete",
  deleteDoctor,
);
const slice = createSlice({
  name: "doctors",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(addDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(editDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.map((item) =>
          item.id === action.payload.id ? action.payload : item,
        );
      })
      .addCase(removeDoctor.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.meta.arg);
      })
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        },
      )
      .addMatcher(isRejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Request failed";
      }),
});
export default slice.reducer;
