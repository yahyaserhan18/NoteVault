import { Outlet } from "react-router-dom"

import { Footer } from "@/app/layout/Footer"
import { Header } from "@/app/layout/Header"
import { Toaster } from "sonner"

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <Footer />
      <Toaster position="top-center" richColors />
    </div>
  )
}
