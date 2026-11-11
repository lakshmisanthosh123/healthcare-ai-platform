import { createAsyncThunk, createSlice, isRejected } from "@reduxjs/toolkit";
import type { Patient } from "@healthcare-platform/types";
import { patientService } from "../../services/patientService";
import { unwrapData } from "../../services/api";

interface PatientState {
  profile: Patient | null;
  loading: boolean;
  error: string | null;
}
const initialState: PatientState = {
  profile: null,
  loading: false,
  error: null,
};
export const fetchPatientProfile = createAsyncThunk(
  "patient/profile",
  async () => unwrapData(await patientService.getProfile()),
);
export const updatePatientProfile = createAsyncThunk(
  "patient/update",
  async (data: Partial<Patient>) =>
    unwrapData(await patientService.updateProfile(data)),
);
const slice = createSlice({
  name: "patient",
  initialState,
  reducers: {
    clearPatient(state) {
      state.profile = null;
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(fetchPatientProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updatePatientProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addMatcher(isRejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Request failed";
      }),
});
export const { clearPatient } = slice.actions;
export default slice.reducer;
