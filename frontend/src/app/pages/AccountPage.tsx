import { useState, useEffect, useRef } from "react"
import { Link, Navigate } from "react-router-dom"
import { useAuthContext } from "@/context/AuthContext"
import { GlassCard } from "@/components/common/GlassCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeftIcon,
  CameraIcon,
  LoaderCircleIcon,
  SaveIcon,
  ShieldIcon,
  UserIcon,
} from "lucide-react"
import { toast } from "sonner"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000"

function AvatarPreview({
  firstName,
  lastName,
  avatarUrl,
  size = "lg",
}: {
  firstName: string
  lastName: string
  avatarUrl: string
  size?: "sm" | "lg"
}) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  const sizeClass = size === "lg" ? "size-24" : "size-10"
  const textClass = size === "lg" ? "text-2xl" : "text-sm"

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`${firstName} ${lastName}`}
        className={`${sizeClass} rounded-full object-cover ring-4 ring-white/60 shadow-lg`}
      />
    )
  }

  return (
    <span
      className={`flex ${sizeClass} items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 ${textClass} font-bold text-white ring-4 ring-white/60 shadow-lg`}
    >
      {initials}
    </span>
  )
}

export default function AccountPage() {
  const { user, accessToken, updateUser } = useAuthContext()

  const [firstName, setFirstName] = useState(user?.firstName ?? "")
  const [lastName, setLastName] = useState(user?.lastName ?? "")
  const [bio, setBio] = useState(user?.bio ?? "")
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "")
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName)
      setLastName(user.lastName)
      setBio(user.bio ?? "")
      setAvatarUrl(user.avatarUrl ?? "")
    }
  }, [user])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB")
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch(`${API_BASE_URL}/api/upload/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      })

      const body = await res.json()

      if (!res.ok || !body.ok) {
        throw new Error(body?.error?.message ?? "Upload failed")
      }

      setAvatarUrl(body.data.url)
      toast.success("Photo uploaded — click Save changes to apply")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required.")
      return
    }
    setError(null)
    setIsSaving(true)
    try {
      await updateUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        bio: bio.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
      })
      toast.success("Profile updated successfully")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save changes"
      setError(message)
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) return <Navigate to="/" replace />

  return (
    <div className="space-y-8">
      {/* Back navigation */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Back to notes
        </Link>
      </div>

      {/* Profile header card */}
      <GlassCard className="flex flex-col items-center gap-4 px-6 py-8 text-center sm:flex-row sm:text-left">
        <AvatarPreview
          firstName={user.firstName}
          lastName={user.lastName}
          avatarUrl={user.avatarUrl ?? ""}
        />
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700">
            <ShieldIcon className="size-3" />
            {user.role}
          </span>
        </div>
      </GlassCard>

      {/* Edit form */}
      <GlassCard className="px-6 py-6">
        <div className="mb-5 flex items-center gap-2">
          <UserIcon className="size-5 text-muted-foreground" />
          <h2 className="text-base font-semibold">Edit profile</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar uploader */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Profile photo
              <span className="ml-2 text-xs font-normal text-muted-foreground">(optional)</span>
            </label>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Live preview */}
              <div className="relative shrink-0 self-center sm:self-auto">
                <AvatarPreview
                  firstName={firstName || user.firstName}
                  lastName={lastName || user.lastName}
                  avatarUrl={avatarUrl}
                />
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                    <LoaderCircleIcon className="size-6 animate-spin text-white" />
                  </div>
                )}
              </div>

              {/* Upload controls */}
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer gap-2"
                >
                  {isUploading ? (
                    <LoaderCircleIcon className="animate-spin" />
                  ) : (
                    <CameraIcon className="size-4" />
                  )}
                  {isUploading ? "Uploading…" : "Upload photo"}
                </Button>
                <p className="text-xs text-muted-foreground">JPG, PNG, GIF or WebP · max 5 MB</p>
              </div>
            </div>

            {/* Manual URL fallback */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or enter a URL</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <Input
              type="text"
              placeholder="https://example.com/avatar.png"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
          </div>

          {/* Name row */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1 space-y-1.5">
              <label htmlFor="firstName" className="text-sm font-medium">
                First name
              </label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <label htmlFor="lastName" className="text-sm font-medium">
                Last name
              </label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
              <span className="ml-2 text-xs font-normal text-muted-foreground">(cannot be changed)</span>
            </label>
            <Input
              id="email"
              type="email"
              value={user.email}
              readOnly
              disabled
              className="cursor-not-allowed opacity-60"
            />
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label htmlFor="bio" className="text-sm font-medium">
              Bio
              <span className="ml-2 text-xs font-normal text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              id="bio"
              placeholder="Tell us a little about yourself…"
              rows={4}
              maxLength={500}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="resize-none"
            />
            <p className="text-right text-xs text-muted-foreground">
              {bio.length} / 500
            </p>
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving || isUploading} className="gap-2 cursor-pointer">
              {isSaving ? (
                <LoaderCircleIcon className="animate-spin" />
              ) : (
                <SaveIcon className="size-4" />
              )}
              {isSaving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  )
}
