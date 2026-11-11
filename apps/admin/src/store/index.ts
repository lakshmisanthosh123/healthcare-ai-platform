import { configureStore } from "@reduxjs/toolkit";
import patientReducer from "./slices/patientSlice";
import doctorReducer from "./slices/doctorSlice";
import roleReducer from "./slices/roleSlice";
import permissionReducer from "./slices/permissionSlice";
import settingsReducer from "./slices/settingsSlice";
import auditLogReducer from "./slices/auditLogSlice";

export const store = configureStore({
  reducer: {
    patients: patientReducer,
    doctors: doctorReducer,
    roles: roleReducer,
    permissions: permissionReducer,
    settings: settingsReducer,
    auditLogs: auditLogReducer,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
