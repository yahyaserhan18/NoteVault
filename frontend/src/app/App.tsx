import { BrowserRouter, Routes, Route } from "react-router-dom"

import { AppLayout } from "@/app/layout/AppLayout"
import { HomePage } from "@/app/pages/HomePage"
import { NotFoundPage } from "@/app/pages/NotFoundPage"
import SignInPage from "@/app/pages/SignInPage"
import SignUpPage from "@/app/pages/SignUpPage"
import NoteDetailPage from "@/app/pages/NoteDetailPage"
import AccountPage from "@/app/pages/AccountPage"
import ProtectedRoute from "@/components/common/ProtectedRoute"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />

        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/" element={<HomePage />} />
          <Route path="/notes/:id" element={<NoteDetailPage />} />
          <Route path="/account" element={<AccountPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
