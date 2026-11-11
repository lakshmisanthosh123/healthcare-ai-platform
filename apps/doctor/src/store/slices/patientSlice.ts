import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { isRejected } from "@reduxjs/toolkit";
import type { Patient } from "@healthcare-platform/types";
import { patientService } from "../../services/patientService";
import { unwrapData } from "../../services/api";

interface PatientState {
  items: Patient[];
  selected: Patient | null;
  loading: boolean;
  error: string | null;
}
const initialState: PatientState = {
  items: [],
  selected: null,
  loading: false,
  error: null,
};

export const fetchPatients = createAsyncThunk(
  "patients/list",
  async (params: { page?: number; search?: string } = {}) =>
    unwrapData(
      await patientService.getDoctorPatients(params.page, 10, params.search),
    ),
);
export const fetchPatient = createAsyncThunk(
  "patients/detail",
  async (id: string) => unwrapData(await patientService.getPatientById(id)),
);

const slice = createSlice({
  name: "patients",
  initialState,
  reducers: {
    clearPatients(state) {
      state.items = [];
      state.selected = null;
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload)
          ? action.payload
          : (action.payload.data ?? []);
      })
      .addCase(fetchPatient.fulfilled, (state, action) => {
        state.selected = action.payload;
        state.loading = false;
      })
      .addMatcher(isRejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message ?? "Request failed";
      }),
});
export const { clearPatients } = slice.actions;
export default slice.reducer;
