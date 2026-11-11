import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { isRejected } from "@reduxjs/toolkit";
import type { Doctor } from "@healthcare-platform/types";
import { doctorService } from "../../services/doctorService";
import { unwrapData } from "../../services/api";

interface DoctorState {
  current: Doctor | null;
  doctors: Doctor[];
  loading: boolean;
  error: string | null;
}

const initialState: DoctorState = {
  current: null,
  doctors: [],
  loading: false,
  error: null,
};

export const fetchDoctorProfile = createAsyncThunk("doctor/profile", async () =>
  unwrapData(await doctorService.getProfile()),
);

export const updateDoctorProfile = createAsyncThunk(
  "doctor/updateProfile",
  async (data: Partial<Doctor>) =>
    unwrapData(await doctorService.updateProfile(data)),
);

export const fetchDoctors = createAsyncThunk(
  "doctor/list",
  async (params: { page?: number; search?: string } = {}) =>
    unwrapData(
      await doctorService.getAllDoctors(params.page, 10, params.search),
    ),
);

const slice = createSlice({
  name: "doctor",
  initialState,
  reducers: {
    clearDoctor(state) {
      state.current = null;
      state.doctors = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctorProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(updateDoctorProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDoctorProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = Array.isArray(action.payload)
          ? action.payload
          : (action.payload.data ?? []);
      })
      .addMatcher(isRejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message ?? "Request failed";
      });
  },
});

export const { clearDoctor } = slice.actions;
export default slice.reducer;
