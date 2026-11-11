import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAuditLogs } from "../../services/adminService";
import type { AuditLog } from "../../types/admin";
interface AuditLogState {
  items: AuditLog[];
  loading: boolean;
  error: string | null;
}
const initialState: AuditLogState = { items: [], loading: false, error: null };
export const fetchAuditLogs = createAsyncThunk("admin/auditLogs", getAuditLogs);
export default createSlice({
  name: "auditLogs",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder.addCase(fetchAuditLogs.fulfilled, (state, action) => {
      state.items = action.payload;
      state.loading = false;
    }),
}).reducer;
