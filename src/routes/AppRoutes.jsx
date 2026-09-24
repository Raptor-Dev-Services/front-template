import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { wideRoutes } from './wideRoutes'
import AppNavbar from '../components/layout/AppNavbar'
import { isAuthenticated } from '../auth/session'

const Home         = lazy(() => import('../pages/Home'))
const Login        = lazy(() => import('../pages/Login'))
const ExampleUsers = lazy(() => import('../pages/ExampleUsers'))

function Spinner() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
      <div className="size-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
    </div>
  )
}

function renderLazy(element) {
  return <Suspense fallback={<Spinner />}>{element}</Suspense>
}

function RequireAuth({ children }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />
  return children
}

function AppShell({ children }) {
  const { pathname } = useLocation()
  const isWide = wideRoutes.some((r) => pathname.startsWith(r))
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AppNavbar />
      <main className={isWide ? 'flex-1 p-3 sm:p-4 lg:p-5' : 'mx-auto w-full max-w-screen-xl flex-1 p-3 sm:p-4 lg:p-5'}>
        {children}
      </main>
    </div>
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={renderLazy(<Login />)} />
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route
        path="/app/*"
        element={
          <RequireAuth>
            <AppShell>
              <Routes>
                <Route index element={renderLazy(<Home />)} />
                <Route path="example/users" element={renderLazy(<ExampleUsers />)} />
                <Route path="*" element={<Navigate to="/app" replace />} />
              </Routes>
            </AppShell>
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  )
}
