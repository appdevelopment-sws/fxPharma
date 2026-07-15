import { api } from "./api";

export type CreditRequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type CreditLogType = "CREDIT" | "DEBIT";

export interface CreditRequest {
  id: string;
  organizationId: string;
  requestedLimit: number;
  paymentScreenshotUrl: string;
  status: CreditRequestStatus;
  adminToken?: string;
  createdAt: string;
  updatedAt: string;
  organization?: any;
}

export interface CreditLog {
  id: string;
  organizationId: string;
  branchId?: string;
  amount: number;
  type: CreditLogType;
  reason: string;
  createdAt: string;
  branch?: any;
}

export const creditApi = {
  // User endpoints
  createRequest: async (data: { requestedLimit: number; paymentScreenshotUrl: string }) => {
    const res = await api.post("/credit/request", data);
    return res.data;
  },

  getLogs: async () => {
    const res = await api.get<{ data: CreditLog[] }>("/credit/logs");
    return res.data;
  },

  getMyRequests: async () => {
    const res = await api.get<{ data: CreditRequest[] }>("/credit/my-requests");
    return res.data;
  },

  // Admin endpoints
  getAllRequests: async () => {
    const res = await api.get<{ data: CreditRequest[] }>("/credit/admin/requests");
    return res.data;
  },

  approveRequest: async (id: string, adminToken: string) => {
    const res = await api.post(`/credit/admin/requests/${id}/approve`, { adminToken });
    return res.data;
  },

  rejectRequest: async (id: string) => {
    const res = await api.post(`/credit/admin/requests/${id}/reject`);
    return res.data;
  },
};
