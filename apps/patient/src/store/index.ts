import { configureStore } from "@reduxjs/toolkit";
import patientReducer from "./slices/patientSlice";
import doctorReducer from "./slices/doctorSlice";
import medicalHistoryReducer from "./slices/medicalHistorySlice";
import prescriptionReducer from "./slices/prescriptionSlice";
import appointmentReducer from "./slices/appointmentSlice";

export const store = configureStore({
  reducer: {
    patient: patientReducer,
    doctors: doctorReducer,
    medicalHistory: medicalHistoryReducer,
    prescriptions: prescriptionReducer,
    appointments: appointmentReducer,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
