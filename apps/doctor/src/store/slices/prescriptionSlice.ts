import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { isRejected } from "@reduxjs/toolkit";
import {
  prescriptionService,
  type PrescriptionData,
} from "../../services/prescriptionService";
import { unwrapData } from "../../services/api";

interface PrescriptionState {
  items: unknown[];
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
  async () => unwrapData(await prescriptionService.getDoctorPrescriptions()),
);
export const createPrescription = createAsyncThunk(
  "prescriptions/create",
  async (data: PrescriptionData) =>
    unwrapData(await prescriptionService.createPrescription(data)),
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
      .addCase(fetchPrescriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(createPrescription.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
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
        state.error = action.error?.message ?? "Request failed";
      }),
});
export const { clearPrescriptions } = slice.actions;
export default slice.reducer;
