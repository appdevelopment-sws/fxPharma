import { useEffect, useState } from "react"
import { api } from "@/services/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ShieldCheck,
  Search,
  Filter,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import AuditLogDetailDialog, {
  type AuditLogItem,
} from "@/components/dialog/admin/AuditLogDetailDialog"

export default function SuperAdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // Filters
  const [search, setSearch] = useState("")
  const [action, setAction] = useState<string>("ALL")
  const [entity, setEntity] = useState<string>("ALL")

  // Selected Log for detail modal
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null)

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params: Record<string, any> = {
        page,
        limit: 20,
      }
      if (search.trim()) params.search = search.trim()
      if (action !== "ALL") params.action = action
      if (entity !== "ALL") params.entity = entity

      const res = await api.get<any>("/superadmin/audit-logs", { params })
      if (res?.success) {
        setLogs(res.data || [])
        setTotalPages(res.meta?.totalPages || 1)
        setTotalItems(res.meta?.total || 0)
      }
    } catch (err) {
      console.error("Failed to fetch audit logs", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [page, action, entity])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchLogs()
  }

  const getActionBadge = (act: string) => {
    switch (act) {
      case "CREATE":
        return (
          <Badge className="border-emerald-200 bg-emerald-500/15 text-emerald-600">
            CREATE
          </Badge>
        )
      case "UPDATE":
        return (
          <Badge className="border-blue-200 bg-blue-500/15 text-blue-600">
            UPDATE
          </Badge>
        )
      case "DELETE":
        return (
          <Badge className="border-rose-200 bg-rose-500/15 text-rose-600">
            DELETE
          </Badge>
        )
      case "LOGIN":
        return (
          <Badge className="border-purple-200 bg-purple-500/15 text-purple-600">
            LOGIN
          </Badge>
        )
      case "LOGOUT":
        return (
          <Badge className="border-amber-200 bg-amber-500/15 text-amber-600">
            LOGOUT
          </Badge>
        )
      default:
        return <Badge variant="outline">{act}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
              Platform Audit & Activity
            </p>
            <Badge variant="outline" className="font-mono text-[10px]">
              {totalItems} Logged Events
            </Badge>
          </div>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Audit & System Logs
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Real-time security and operational trace logs across all tenant
            organizations
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchLogs}
          disabled={loading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh Feed
        </Button>
      </div>

      {/* Filter Controls Bar */}
      <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col gap-3 md:flex-row"
        >
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by entity ID, user email, or organization name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="w-[140px]">
              <Select
                value={action}
                onValueChange={(val) => {
                  setAction(val)
                  setPage(1)
                }}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Actions</SelectItem>
                  <SelectItem value="CREATE">CREATE</SelectItem>
                  <SelectItem value="UPDATE">UPDATE</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="LOGIN">LOGIN</SelectItem>
                  <SelectItem value="LOGOUT">LOGOUT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-[160px]">
              <Select
                value={entity}
                onValueChange={(val) => {
                  setEntity(val)
                  setPage(1)
                }}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Entities</SelectItem>
                  <SelectItem value="INVOICE">Invoices</SelectItem>
                  <SelectItem value="INVENTORY">Inventory</SelectItem>
                  <SelectItem value="ORDER">Orders</SelectItem>
                  <SelectItem value="CREDIT">Credit</SelectItem>
                  <SelectItem value="USER">User / Auth</SelectItem>
                  <SelectItem value="ORGANIZATION">Organization</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" variant="default" size="sm">
              <Filter className="mr-1.5 h-4 w-4" /> Filter
            </Button>
          </div>
        </form>
      </div>

      {/* Logs Table */}
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[120px]">Action</TableHead>
              <TableHead className="w-[140px]">Entity</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>User / Triggered By</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  Loading audit log history...
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  No audit logs found matching your filter criteria.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => {
                const orgName =
                  log.organization?.name ||
                  log.organizationName ||
                  "Global System"
                const userName =
                  log.user?.name ||
                  log.user?.email ||
                  log.userName ||
                  "System User"
                const userEmail = log.user?.email || log.userEmail || ""

                return (
                  <TableRow
                    key={log.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell>
                      <span className="font-mono text-xs font-semibold">
                        {log.entity}
                      </span>
                      <p className="max-w-[120px] truncate font-mono text-[11px] text-muted-foreground">
                        #{log.entityId}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {orgName}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{userName}</p>
                      {userEmail && (
                        <p className="text-xs text-muted-foreground">
                          {userEmail}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                        className="h-8 px-2 text-xs"
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
          <p>
            Showing page{" "}
            <span className="font-medium text-foreground">{page}</span> of{" "}
            <span className="font-medium text-foreground">{totalPages}</span> (
            {totalItems} total events)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-7 px-2.5 text-xs"
            >
              <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="h-7 px-2.5 text-xs"
            >
              Next <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modal Dialog wrapping FormContainer */}
      <AuditLogDetailDialog
        open={!!selectedLog}
        onClose={(open) => !open && setSelectedLog(null)}
        log={selectedLog}
      />
    </div>
  )
}
