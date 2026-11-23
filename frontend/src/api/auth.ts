import type { User } from "@/types/user"
import { api } from "./client"

export interface LoginResponse {
  access: string
  refresh: string
  user: User
}

export async function login(username: string, password: string) {
  const { data } = await api.post<LoginResponse>("/auth/login/", { username, password })
  return data
}

export async function fetchMe() {
  const { data } = await api.get<User>("/auth/me/")
  return data
}