import axios from "axios"

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Try again.",
): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "Can't reach the server. Check that the backend is running."
    }
    const data: unknown = error.response.data
    if (data && typeof data === "object") {
      const record = data as Record<string, unknown>
      if (typeof record.detail === "string") return record.detail
      const first = Object.values(record)[0]
      if (Array.isArray(first) && typeof first[0] === "string") return first[0]
      if (typeof first === "string") return first
    }
  }
  return fallback
}