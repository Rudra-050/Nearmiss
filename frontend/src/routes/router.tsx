import { Center, Spinner } from "@chakra-ui/react"
import type { ReactNode } from "react"
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom"
import { useAuth, useCurrentUser, type Role } from "@/api/AuthContext"
import AppLayout from "@/layouts/AppLayout"
import AuthLayout from "@/layouts/AuthLayout"
import Login from "@/pages/Login"
import Placeholder from "@/pages/Placeholder"
import ReportIncident from "@/pages/ReportIncident"

function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <Center minH="100vh">
        <Spinner size="lg" color="brand.solid" />
      </Center>
    )
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

function HomeRedirect() {
  const user = useCurrentUser()
  return <Navigate to={user.role === "REPORTER" ? "/report" : "/incidents"} replace />
}

function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const user = useCurrentUser()
  return roles.includes(user.role) ? <>{children}</> : <Navigate to="/" replace />
}

const staff: Role[] = ["MANAGER", "INVESTIGATOR", "ADMIN"]

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [{ path: "/login", element: <Login /> }],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true, element: <HomeRedirect /> },
          { path: "report", element: <ReportIncident /> },
          { path: "my-reports", element: <Placeholder title="My reports" /> },
          {
            path: "incidents",
            element: (
              <RequireRole roles={staff}>
                <Placeholder title="Incident queue" />
              </RequireRole>
            ),
          },
          {
            path: "incidents/:id",
            element: (
              <RequireRole roles={staff}>
                <Placeholder title="Incident detail" />
              </RequireRole>
            ),
          },
          {
            path: "dashboard",
            element: (
              <RequireRole roles={staff}>
                <Placeholder title="Dashboard" />
              </RequireRole>
            ),
          },
          {
            path: "admin/wards",
            element: (
              <RequireRole roles={["ADMIN"]}>
                <Placeholder title="Manage wards" />
              </RequireRole>
            ),
          },
          {
            path: "admin/users",
            element: (
              <RequireRole roles={["ADMIN"]}>
                <Placeholder title="Manage users" />
              </RequireRole>
            ),
          },
          {
            path: "admin/categories",
            element: (
              <RequireRole roles={["ADMIN"]}>
                <Placeholder title="Manage categories" />
              </RequireRole>
            ),
          },
          { path: "*", element: <Placeholder title="Page not found" /> },
        ],
      },
    ],
  },
])