import { FormContainer } from "@/components/formContainer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export interface AuditLogItem {
  id: string
  action: string
  entity: string
  entityId: string
  oldData?: any
  newData?: any
  ipAddress?: string | null
  userAgent?: string | null
  createdAt: string
  user?: {
    id?: string
    name?: string
    email?: string
  } | null
  userName?: string
  userEmail?: string | null
  organization?: {
    id?: string
    name?: string
    slug?: string
  } | null
  organizationName?: string
  branch?: {
    id?: string
    name?: string
  } | null
}

interface AuditLogDetailDialogProps {
  open: boolean
  onClose: (open: boolean) => void
  log: AuditLogItem | null
}

export default function AuditLogDetailDialog({
  open,
  onClose,
  log,
}: AuditLogDetailDialogProps) {
  if (!log) return null

  const getActionBadge = (action: string) => {
    switch (action) {
      case "CREATE":
        return <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-200">CREATE</Badge>
      case "UPDATE":
        return <Badge className="bg-blue-500/15 text-blue-600 hover:bg-blue-500/25 border-blue-200">UPDATE</Badge>
      case "DELETE":
        return <Badge className="bg-rose-500/15 text-rose-600 hover:bg-rose-500/25 border-rose-200">DELETE</Badge>
      case "LOGIN":
        return <Badge className="bg-purple-500/15 text-purple-600 hover:bg-purple-500/25 border-purple-200">LOGIN</Badge>
      case "LOGOUT":
        return <Badge className="bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 border-amber-200">LOGOUT</Badge>
      default:
        return <Badge variant="outline">{action}</Badge>
    }
  }

  const orgName = log.organization?.name || log.organizationName || "Global Platform"
  const userName = log.user?.name || log.user?.email || log.userName || "System"
  const userEmail = log.user?.email || log.userEmail || ""

  return (
    <FormContainer
      variant="modal"
      open={open}
      onOpenChange={(isOpen) => onClose(isOpen)}
      title={`Audit Log Details`}
      description={`Record ID: ${log.id}`}
      size="lg"
      footer={
        <div className="flex justify-end w-full">
          <Button variant="outline" onClick={() => onClose(false)}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-5 text-sm">
        {/* Meta summary grid */}
        <div className="grid grid-cols-2 gap-4 rounded-xl border border-border/60 bg-muted/20 p-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase font-medium">Action & Entity</p>
            <div className="mt-1 flex items-center gap-2">
              {getActionBadge(log.action)}
              <span className="font-semibold text-foreground">{log.entity}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-medium">Entity ID</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground break-all">{log.entityId}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-medium">Organization</p>
            <p className="mt-1 font-medium">{orgName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-medium">User</p>
            <p className="mt-1 font-medium">{userName} {userEmail ? `(${userEmail})` : ""}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-medium">Timestamp</p>
            <p className="mt-1 text-muted-foreground">
              {new Date(log.createdAt).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-medium">IP & Client</p>
            <p className="mt-1 text-xs text-muted-foreground font-mono">
              {log.ipAddress || "Internal"}
            </p>
          </div>
        </div>

        {/* Data payload comparison */}
        {log.oldData && (
          <div className="space-y-1.5">
            <p className="font-medium text-xs text-muted-foreground uppercase">Previous State (oldData)</p>
            <pre className="p-3 rounded-lg border bg-muted/40 font-mono text-xs overflow-x-auto max-h-44 text-muted-foreground">
              {JSON.stringify(log.oldData, null, 2)}
            </pre>
          </div>
        )}

        {log.newData && (
          <div className="space-y-1.5">
            <p className="font-medium text-xs text-emerald-600 dark:text-emerald-400 uppercase">New State (newData)</p>
            <pre className="p-3 rounded-lg border border-emerald-200/50 bg-emerald-50/30 dark:bg-emerald-950/20 font-mono text-xs overflow-x-auto max-h-52 text-foreground">
              {JSON.stringify(log.newData, null, 2)}
            </pre>
          </div>
        )}

        {!log.oldData && !log.newData && (
          <div className="text-center py-6 text-muted-foreground text-xs italic">
            No json payload recorded for this action.
          </div>
        )}
      </div>
    </FormContainer>
  )
}
