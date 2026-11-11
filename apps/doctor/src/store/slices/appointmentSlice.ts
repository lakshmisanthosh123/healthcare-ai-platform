import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { isRejected } from "@reduxjs/toolkit";
import type { Appointment } from "@healthcare-platform/types";
import { appointmentService } from "../../services/appointmentService";
import { unwrapData } from "../../services/api";

interface AppointmentState {
  items: Appointment[];
  selectedDate: string;
  loading: boolean;
  error: string | null;
}
const today = new Date().toISOString().slice(0, 10);
const initialState: AppointmentState = {
  items: [],
  selectedDate: today,
  loading: false,
  error: null,
};

export const fetchAppointmentsByDate = createAsyncThunk(
  "appointments/byDate",
  async (date: string) =>
    unwrapData(await appointmentService.getDoctorAppointmentsByDate(date)),
);
const slice = createSlice({
  name: "appointments",
  initialState,
  reducers: {
    setSelectedDate(state, action: { payload: string }) {
      state.selectedDate = action.payload;
    },
    clearAppointments(state) {
      state.items = [];
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(fetchAppointmentsByDate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentsByDate.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload)
          ? action.payload
          : (action.payload.data ?? []);
      })
      .addMatcher(isRejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message ?? "Request failed";
      }),
});
export const { setSelectedDate, clearAppointments } = slice.actions;
export default slice.reducer;
