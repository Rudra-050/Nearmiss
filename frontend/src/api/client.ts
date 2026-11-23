import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios"
import { clearTokens, getAccess, getRefresh, setAccess } from "@/lib/tokens"

export const API_URL: string =
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api"

export const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const token = getAccess()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// One refresh at a time, shared by every request that hits a 401 together.
let refreshing: Promise<string> | null = null

async function refreshAccess(): Promise<string> {
  const refresh = getRefresh()
  if (!refresh) throw new Error("No refresh token")
  const { data } = await axios.post<{ access: string }>(
    `${API_URL}/auth/refresh/`,
    { refresh },
  )
  setAccess(data.access)
  return data.access
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined
    const url = original?.url ?? ""
    const isAuthCall = url.includes("/auth/login/") || url.includes("/auth/refresh/")

    if (error.response?.status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true
      try {
        refreshing ??= refreshAccess().finally(() => {
          refreshing = null
        })
        const token = await refreshing
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      } catch {
        clearTokens()
        window.dispatchEvent(new Event("auth:logout"))
      }
    }
    return Promise.reject(error)
  },
)