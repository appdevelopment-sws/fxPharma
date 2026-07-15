import { useState, useEffect } from "react"
import { uploadApi } from "@/services/uploadApi"
import {
  creditApi,
  type CreditRequest,
  type CreditLog,
} from "@/services/creditApi"
import { toast } from "react-hot-toast"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function CreditPage() {
  const [activeTab, setActiveTab] = useState<"request" | "history">("request")
  const [requestedLimit, setRequestedLimit] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [requests, setRequests] = useState<CreditRequest[]>([])
  const [logs, setLogs] = useState<CreditLog[]>([])

  const fetchData = async () => {
    try {
      const [reqs, lgs] = await Promise.all([
        creditApi.getMyRequests(),
        creditApi.getLogs(),
      ])
      setRequests(reqs || [])
      setLogs(lgs || [])
    } catch (error) {
      console.error("Error fetching credit data", error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!requestedLimit || !file) {
      toast.error("Please provide both a limit and a payment screenshot.")
      return
    }

    try {
      setIsUploading(true)
      // Upload image
      const presigned = await uploadApi.uploadImage(file)

      // Submit credit request
      await creditApi.createRequest({
        requestedLimit: Number(requestedLimit),
        paymentScreenshotUrl: presigned.publicUrl || presigned.presignedUrl, // Depends on how uploadApi is set up
      })

      toast.success("Credit request submitted successfully!")
      setRequestedLimit("")
      setFile(null)
      fetchData()
      setActiveTab("history")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit request."
      )
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs tracking-[0.25em] text-muted-foreground uppercase">
          Finance Management
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">Credit Management</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Request credit, upload payment screenshots, and view your request history.
        </p>
      </div>

      <div className="flex gap-4 border-b border-border/60 pb-2">
        <button
          onClick={() => setActiveTab("request")}
          className={`font-semibold text-sm ${activeTab === "request" ? "border-b-2 border-primary text-primary pb-2 -mb-[9px]" : "text-muted-foreground hover:text-primary pb-2 -mb-[9px]"}`}
        >
          Request Credit
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`font-semibold text-sm ${activeTab === "history" ? "border-b-2 border-primary text-primary pb-2 -mb-[9px]" : "text-muted-foreground hover:text-primary pb-2 -mb-[9px]"}`}
        >
          History & Logs
        </button>
      </div>

      {activeTab === "request" ? (
        <div className="flex justify-center py-8">
          <Card className="w-full max-w-lg border-border/60 shadow-md">
          <CardHeader>
            <CardTitle>Submit Credit Request</CardTitle>
            <CardDescription>
              Provide your requested limit and a screenshot of the payment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Requested Limit
                </label>
                <input
                  type="number"
                  value={requestedLimit}
                  onChange={(e) => setRequestedLimit(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Payment Screenshot
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="mt-1 block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isUploading}
                className="w-full rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isUploading ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-8">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Recent Requests</CardTitle>
              <CardDescription>
                History of your credit limit requests and their statuses.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border/60">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Requested Limit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 bg-background">
                    {requests.map((req) => (
                      <tr key={req.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                          {req.requestedLimit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Badge 
                            variant={req.status === "APPROVED" ? "default" : req.status === "REJECTED" ? "destructive" : "secondary"}
                            className={req.status === "APPROVED" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                          >
                            {req.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {requests.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-sm text-muted-foreground">
                          No requests found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Credit Logs</CardTitle>
              <CardDescription>
                Detailed logs of all your credit transactions and adjustments.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border/60">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 bg-background">
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`font-bold ${log.type === "CREDIT" ? "text-green-600" : "text-red-600"}`}>
                            {log.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                          {log.amount}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {log.reason} {log.branchId ? `(Branch: ${log.branch?.name || log.branchId})` : ""}
                        </td>
                      </tr>
                    ))}
                    {logs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-sm text-muted-foreground">
                          No logs found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
