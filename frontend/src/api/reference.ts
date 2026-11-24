import { api } from "@/api/client"
import type { User } from "@/types/user"
import type { Category, Ward } from "@/types/incident"

export async function getWards(): Promise<Ward[]> {
  const { data } = await api.get<Ward[]>("/wards/")
  return data
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>("/categories/")
  return data
}

export async function getAssignableUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>("/users/assignable/")
  return data
}
