import { createAsyncThunk, createSlice, isRejected } from "@reduxjs/toolkit";
import { medicalHistoryService } from "../../services/medicalHistoryService";
import { unwrapData } from "../../services/api";

type MedicalRecord =
  Awaited<
    ReturnType<typeof medicalHistoryService.getMedicalHistory>
  > extends Array<infer Item>
    ? Item
    : never;

interface MedicalHistoryState {
  items: MedicalRecord[];
  loading: boolean;
  error: string | null;
}
const initialState: MedicalHistoryState = {
  items: [],
  loading: false,
  error: null,
};
export const fetchMedicalHistory = createAsyncThunk(
  "medicalHistory/list",
  async () => unwrapData(await medicalHistoryService.getMedicalHistory()),
);
const slice = createSlice({
  name: "medicalHistory",
  initialState,
  reducers: {
    clearMedicalHistory(state) {
      state.items = [];
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(fetchMedicalHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicalHistory.fulfilled, (state, action) => {
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
export const { clearMedicalHistory } = slice.actions;
export default slice.reducer;
