import { createAsyncThunk, createSlice, isRejected } from "@reduxjs/toolkit";
import type { Appointment } from "@healthcare-platform/types";
import { appointmentService } from "../../services/appointmentService";
import { unwrapData } from "../../services/api";

interface AppointmentState {
  items: Appointment[];
  selectedDoctorId: string | null;
  selectedDate: string;
  selectedTime: string | null;
  loading: boolean;
  error: string | null;
}
const initialState: AppointmentState = {
  items: [],
  selectedDoctorId: null,
  selectedDate: new Date().toISOString().slice(0, 10),
  selectedTime: null,
  loading: false,
  error: null,
};
export const fetchAppointments = createAsyncThunk(
  "appointments/list",
  async () => unwrapData(await appointmentService.getAppointments()),
);
export const bookAppointment = createAsyncThunk(
  "appointments/book",
  async (payload: Parameters<typeof appointmentService.bookAppointment>[0]) =>
    unwrapData(await appointmentService.bookAppointment(payload)),
);
const slice = createSlice({
  name: "appointments",
  initialState,
  reducers: {
    selectDoctor(state, action: { payload: string | null }) {
      state.selectedDoctorId = action.payload;
    },
    selectDate(state, action: { payload: string }) {
      state.selectedDate = action.payload;
    },
    selectTime(state, action: { payload: string | null }) {
      state.selectedTime = action.payload;
    },
    clearAppointments(state) {
      state.items = [];
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload)
          ? action.payload
          : (action.payload.data ?? []);
      })
      .addCase(bookAppointment.fulfilled, (state, action) => {
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
        state.error = action.error.message ?? "Request failed";
      }),
});
export const { selectDoctor, selectDate, selectTime, clearAppointments } =
  slice.actions;
export default slice.reducer;
