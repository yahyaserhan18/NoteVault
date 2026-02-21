import { useState, useEffect, useCallback, useMemo } from "react"
import { Navigate, Link } from "react-router-dom"
import { useAuthContext } from "@/context/AuthContext"
import { GlassCard } from "@/components/common/GlassCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeftIcon,
  LoaderCircleIcon,
  PencilIcon,
  SearchIcon,
  ShieldIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react"
import { toast } from "sonner"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"

interface DashboardUser {
  id: string
  email: string
  role: string
  firstName: string
  lastName: string
  avatarUrl: string | null
  bio: string | null
  createdAt: string
  updatedAt: string
}

function UserAvatar({
  firstName,
  lastName,
  avatarUrl,
}: {
  firstName: string
  lastName: string
  avatarUrl: string | null
}) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`${firstName} ${lastName}`}
        className="size-9 rounded-full object-cover ring-2 ring-white/50"
      />
    )
  }

  return (
    <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-semibold text-white ring-2 ring-white/50 shadow-md">
      {initials}
    </span>
  )
}

export default function DashboardPage() {
  const { user, authFetch } = useAuthContext()
  const [users, setUsers] = useState<DashboardUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const [editingUser, setEditingUser] = useState<DashboardUser | null>(null)
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    role: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  const [deletingUser, setDeletingUser] = useState<DashboardUser | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/users`)
      if (!res) return
      const body = await res.json()
      if (res.ok && body.ok) {
        setUsers(body.data as DashboardUser[])
      }
    } catch {
      toast.error("Failed to load users")
    } finally {
      setIsLoading(false)
    }
  }, [authFetch])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users
    const term = searchTerm.toLowerCase()
    return users.filter(
      (u) =>
        u.firstName.toLowerCase().includes(term) ||
        u.lastName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    )
  }, [users, searchTerm])

  const openEdit = (u: DashboardUser) => {
    setEditingUser(u)
    setEditForm({ firstName: u.firstName, lastName: u.lastName, role: u.role })
  }

  const handleSave = async () => {
    if (!editingUser) return
    if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
      toast.error("First name and last name are required")
      return
    }
    setIsSaving(true)
    try {
      const res = await authFetch(
        `${API_BASE_URL}/api/users/${editingUser.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            firstName: editForm.firstName.trim(),
            lastName: editForm.lastName.trim(),
            role: editForm.role,
          }),
        }
      )
      if (!res) throw new Error("Not authenticated")
      const body = await res.json()
      if (!res.ok || !body.ok) {
        throw new Error(body?.error?.message ?? "Failed to update user")
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id ? { ...u, ...(body.data as DashboardUser) } : u
        )
      )
      setEditingUser(null)
      toast.success("User updated successfully")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update user")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (userId: string) => {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: "DELETE",
      })
      if (!res) throw new Error("Not authenticated")
      const body = await res.json()
      if (!res.ok || !body.ok) {
        throw new Error(body?.error?.message ?? "Failed to delete user")
      }
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      toast.success("User deleted successfully")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user")
    }
  }

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/" replace />
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Back to notes
        </Link>
      </div>

      {/* Header card */}
      <GlassCard className="px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-md">
            <UsersIcon className="size-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">User Management</h1>
            <p className="text-sm text-muted-foreground">
              {users.length} {users.length === 1 ? "user" : "users"} registered
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Users list */}
      <GlassCard className="px-6 py-6">
        <div className="relative mb-6">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search users by name or email..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoaderCircleIcon className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {searchTerm ? "No users match your search." : "No users found."}
          </p>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-4 rounded-xl border border-border/50 bg-white/40 px-4 py-3 transition-colors hover:bg-white/60"
              >
                <UserAvatar
                  firstName={u.firstName}
                  lastName={u.lastName}
                  avatarUrl={u.avatarUrl}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">
                      {u.firstName} {u.lastName}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        u.role === "ADMIN"
                          ? "bg-violet-100 text-violet-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <ShieldIcon className="size-2.5" />
                      {u.role}
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {u.email}
                  </p>
                </div>

                <div className="hidden text-right text-xs text-muted-foreground sm:block">
                  <p>Joined</p>
                  <p className="font-medium">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 cursor-pointer"
                    onClick={() => openEdit(u)}
                  >
                    <PencilIcon className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 cursor-pointer text-destructive hover:text-destructive"
                    onClick={() => setDeletingUser(u)}
                    disabled={u.id === user.id}
                  >
                    <Trash2Icon className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update information for {editingUser?.firstName}{" "}
              {editingUser?.lastName}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label htmlFor="edit-firstName" className="text-sm font-medium">
                First name
              </label>
              <Input
                id="edit-firstName"
                value={editForm.firstName}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, firstName: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="edit-lastName" className="text-sm font-medium">
                Last name
              </label>
              <Input
                id="edit-lastName"
                value={editForm.lastName}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, lastName: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="edit-role" className="text-sm font-medium">
                Role
              </label>
              <select
                id="edit-role"
                value={editForm.role}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, role: e.target.value }))
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingUser(null)}
              disabled={isSaving}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="cursor-pointer"
            >
              {isSaving && <LoaderCircleIcon className="animate-spin" />}
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingUser}
        onOpenChange={(open) => !open && setDeletingUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {deletingUser?.firstName} {deletingUser?.lastName}
              </span>
              ? This action cannot be undone. All of their notes will also be
              permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="cursor-pointer"
              onClick={() => deletingUser && handleDelete(deletingUser.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
