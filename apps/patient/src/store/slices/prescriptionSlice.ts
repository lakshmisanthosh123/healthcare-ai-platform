import { createAsyncThunk, createSlice, isRejected } from "@reduxjs/toolkit";
import type { Prescription } from "@healthcare-platform/types";
import { prescriptionService } from "../../services/prescriptionService";
import { unwrapData } from "../../services/api";

interface PrescriptionState {
  items: Prescription[];
  loading: boolean;
  error: string | null;
}
const initialState: PrescriptionState = {
  items: [],
  loading: false,
  error: null,
};
export const fetchPrescriptions = createAsyncThunk(
  "prescriptions/list",
  async () => unwrapData(await prescriptionService.getPrescriptions()),
);
const slice = createSlice({
  name: "prescriptions",
  initialState,
  reducers: {
    clearPrescriptions(state) {
      state.items = [];
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(fetchPrescriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrescriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload)
          ? action.payload
          : (action.payload.data ?? []);
      })
      .addMatcher(isRejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Request failed";
      }),
});
export const { clearPrescriptions } = slice.actions;
export default slice.reducer;
