import { useState, useEffect } from "react";
import { creditApi, type CreditRequest } from "@/services/creditApi";
import { toast } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/context/settingsContext";

export default function AdminCreditPage() {
  const { settings } = useSettings();
  const conversionRate = Number(settings?.credit_conversion_rate || 5);

  const [requests, setRequests] = useState<CreditRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States for modal
  const [selectedRequest, setSelectedRequest] = useState<CreditRequest | null>(null);
  const [rejectRequestItem, setRejectRequestItem] = useState<CreditRequest | null>(null);
  const [adminToken, setAdminToken] = useState("");
  const [remarks, setRemarks] = useState("");
  const [approvedAmount, setApprovedAmount] = useState<number | "">("");
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const res = await creditApi.getAllRequests();
      setRequests(res || []);
    } catch (error) {
      console.error("Error fetching requests", error);
      toast.error("Failed to fetch credit requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRequests();
  }, []);


  const handleApprove = async () => {
    if (!selectedRequest || !adminToken) {
      toast.error("Please provide an approval token.");
      return;
    }
    try {
      setIsProcessing(true);
      await creditApi.approveRequest(selectedRequest.id, adminToken, approvedAmount ? Number(approvedAmount) : undefined, remarks);
      toast.success("Request approved successfully");
      setSelectedRequest(null);
      setAdminToken("");
      setRemarks("");
      setApprovedAmount("");
      fetchRequests();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to approve request");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectRequestItem) return;
    try {
      setIsProcessing(true);
      await creditApi.rejectRequest(rejectRequestItem.id, remarks);
      toast.success("Request rejected");
      setRejectRequestItem(null);
      setRemarks("");
      fetchRequests();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reject request");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
          Finance Management
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Manage Credit Requests</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Approve or reject credit limit requests across the platform.
        </p>
      </div>
      
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Credit Requests Overview</CardTitle>
          <CardDescription>
            A list of all pending, approved, and rejected credit requests.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border/60">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Requested Limit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Approved Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Remarks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border/60">
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{new Date(req.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{req.organization?.name || req.organizationId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">₹{req.requestedLimit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {req.approvedAmount ? `₹${req.approvedAmount}` : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground truncate max-w-[150px]" title={req.remarks || ""}>
                      {req.remarks || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Badge 
                        variant={req.status === "APPROVED" ? "default" : req.status === "REJECTED" ? "destructive" : "secondary"}
                        className={req.status === "APPROVED" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                      >
                        {req.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      <div className="flex gap-2 items-center">
                        <a 
                          href={req.paymentScreenshotUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-primary hover:underline font-medium"
                        >
                          View SS
                        </a>
                        {req.status === 'PENDING' && (
                          <>
                            <span className="text-muted-foreground/30">|</span>
                            <button 
                              onClick={() => {
                                setSelectedRequest(req);
                                setApprovedAmount(req.requestedLimit);
                                setRemarks("");
                                setAdminToken("");
                              }}
                              className="text-green-600 hover:text-green-800 font-medium"
                            >
                              Approve
                            </button>
                            <span className="text-muted-foreground/30">|</span>
                            <button 
                              onClick={() => {
                                setRejectRequestItem(req);
                                setRemarks("");
                              }}
                              className="text-destructive hover:text-destructive/80 font-medium"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">No requests pending.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-lg border-0">
            <CardHeader>
              <CardTitle>Approve Request</CardTitle>
              <CardDescription>
                Confirm the credit limit approval for <span className="font-semibold text-foreground">{selectedRequest.organization?.name}</span>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 space-y-1">
                <p className="text-sm text-muted-foreground">Requested Limit: <span className="font-semibold text-foreground">{selectedRequest.requestedLimit}</span></p>
              </div>
              
              <div className="mb-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground">Approved Amount Override (₹)</label>
                  <input 
                    type="number" 
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(e.target.value ? Number(e.target.value) : "")}
                    className="w-full mt-1 border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="Leave empty to approve requested limit"
                  />
                  <p className="mt-1 text-xs font-semibold text-green-600 dark:text-green-400">
                    Credits to be added: {((approvedAmount || selectedRequest.requestedLimit) / conversionRate).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground">Admin Token</label>
                  <input 
                    type="text" 
                    value={adminToken}
                    onChange={(e) => setAdminToken(e.target.value)}
                    className="w-full mt-1 border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="Token provided by payment gateway/system"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground">Remarks (Optional)</label>
                  <textarea 
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={2}
                    className="w-full mt-1 border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                    placeholder="Any notes for the user..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setSelectedRequest(null)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  {isProcessing ? "Processing..." : "Confirm Approval"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {rejectRequestItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-destructive">Reject Request</CardTitle>
              <CardDescription>
                Provide a reason for rejecting the credit request from <span className="font-semibold text-foreground">{rejectRequestItem.organization?.name}</span>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 space-y-2">
                <label className="block text-sm font-medium text-foreground">Remarks (Required for rejection)</label>
                <textarea 
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                  placeholder="Reason for rejection..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setRejectRequestItem(null)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleReject}
                  disabled={isProcessing || remarks.trim() === ""}
                  variant="destructive"
                >
                  {isProcessing ? "Rejecting..." : "Confirm Rejection"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
