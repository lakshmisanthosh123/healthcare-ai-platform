import { configureStore } from "@reduxjs/toolkit";
import doctorReducer from "./slices/doctorSlice";
import patientReducer from "./slices/patientSlice";
import appointmentReducer from "./slices/appointmentSlice";
import prescriptionReducer from "./slices/prescriptionSlice";

export const store = configureStore({
  reducer: {
    doctor: doctorReducer,
    patients: patientReducer,
    appointments: appointmentReducer,
    prescriptions: prescriptionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
