
import type { Role } from "@/types/user"

export interface NavItem {
  to: string
  label: string
  roles: Role[]
}

const allRoles: Role[] = [
  "REPORTER",
  "MANAGER",
  "INVESTIGATOR",
  "ADMIN",
]

const staffRoles: Role[] = [
  "MANAGER",
  "INVESTIGATOR",
  "ADMIN",
]

export const mainNav: NavItem[] = [
  {
    to: "/report",
    label: "Report incident",
    roles: allRoles,
  },
  {
    to: "/my-reports",
    label: "My reports",
    roles: allRoles,
  },
  {
    to: "/incidents",
    label: "Incident queue",
    roles: staffRoles,
  },
  {
    to: "/dashboard",
    label: "Dashboard",
    roles: staffRoles,
  },
]

export const adminNav: NavItem[] = [
  {
    to: "/admin/wards",
    label: "Manage wards",
    roles: ["ADMIN"],
  },
  {
    to: "/admin/users",
    label: "Manage users",
    roles: ["ADMIN"],
  },
  {
    to: "/admin/categories",
    label: "Manage categories",
    roles: ["ADMIN"],
  },
]

export const roleLabels: Record<Role, string> = {
  REPORTER: "Reporter",
  MANAGER: "Manager",
  INVESTIGATOR: "Investigator",
  ADMIN: "Administrator",
}
