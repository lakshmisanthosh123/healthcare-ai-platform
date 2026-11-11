import { createAsyncThunk, createSlice, isRejected } from "@reduxjs/toolkit";
import type { Doctor } from "@healthcare-platform/types";
import { doctorService } from "../../services/doctorService";
import { unwrapData } from "../../services/api";

interface DoctorState {
  items: Doctor[];
  selected: Doctor | null;
  loading: boolean;
  error: string | null;
}
const initialState: DoctorState = {
  items: [],
  selected: null,
  loading: false,
  error: null,
};
export const fetchDoctors = createAsyncThunk("doctors/list", async () =>
  unwrapData(await doctorService.getAllDoctors()),
);
export const searchDoctors = createAsyncThunk(
  "doctors/search",
  async (query: string) => unwrapData(await doctorService.searchDoctors(query)),
);
export const fetchDoctor = createAsyncThunk(
  "doctors/detail",
  async (id: string) => unwrapData(await doctorService.getDoctorById(id)),
);
const slice = createSlice({
  name: "doctors",
  initialState,
  reducers: {
    clearDoctors(state) {
      state.items = [];
      state.selected = null;
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload)
          ? action.payload
          : (action.payload.data ?? []);
      })
      .addCase(searchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload)
          ? action.payload
          : (action.payload.data ?? []);
      })
      .addCase(fetchDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
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
export const { clearDoctors } = slice.actions;
export default slice.reducer;
