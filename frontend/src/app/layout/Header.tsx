import { Link, useNavigate } from "react-router-dom"
import { useAuthContext } from "@/context/AuthContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOutIcon, SettingsIcon } from "lucide-react"

function UserAvatar({ firstName, lastName, avatarUrl }: { firstName: string; lastName: string; avatarUrl: string | null }) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`${firstName} ${lastName}`}
        className="size-8 rounded-full object-cover ring-2 ring-white/50"
      />
    )
  }

  return (
    <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-semibold text-white ring-2 ring-white/50 shadow-md">
      {initials}
    </span>
  )
}

export function Header() {
  const { user, logout } = useAuthContext()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/sign-in", { replace: true })
  }

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="glass-card flex items-center justify-between gap-4 rounded-2xl px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-sm font-semibold tracking-wide"
            >
              Smart-Memo
            </Link>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              Smart Notes With Ai
            </span>
          </div>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 cursor-pointer"
                  aria-label="User menu"
                >
                  <UserAvatar
                    firstName={user.firstName}
                    lastName={user.lastName}
                    avatarUrl={user.avatarUrl}
                  />
                  <span className="hidden max-w-[120px] truncate text-sm font-medium sm:inline">
                    {user.firstName} {user.lastName}
                  </span>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                {/* User info header */}
                <div className="px-3 py-2.5">
                  <p className="text-sm font-semibold leading-none">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem onSelect={() => navigate("/account")}>
                    <SettingsIcon />
                    Manage your account
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
                  <LogOutIcon />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}
