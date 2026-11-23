export type Role = "REPORTER" | "MANAGER" | "INVESTIGATOR" | "ADMIN"

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  role: Role
}