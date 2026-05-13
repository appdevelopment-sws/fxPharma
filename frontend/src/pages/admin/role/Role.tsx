import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/context/authContext"
import { useDisclosure } from "@/hooks/useDisclosure"
import RoleDialog from "@/components/dialog/admin/roleDialog"
import { Button } from "@/components/ui/button"
import { Plus, Users } from "lucide-react"

export default function AdminRolePage() {
  const { user } = useAuth()
  const roleDisclosure = useDisclosure()

  if (!user) return null

  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Role Management</CardTitle>
            <CardDescription>
              Quickly add new roles to your workspace.
            </CardDescription>
          </div>
          <Button onClick={() => roleDisclosure.onOpen()}>
            <Plus className="mr-2 size-4" />
            Add Role
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 rounded-xl border border-dashed border-border/60 p-8 text-center">
            <div className="mx-auto flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Users className="size-6" />
              </div>
              <p className="text-sm font-medium">Manage your roles</p>
              <p className="text-xs text-muted-foreground">
                You can add and manage workspace roles here.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <RoleDialog
        open={roleDisclosure.isOpen}
        onClose={roleDisclosure.onClose}
      />
    </div>
  )
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
      <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
