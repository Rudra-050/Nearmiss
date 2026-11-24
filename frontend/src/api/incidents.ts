import { api } from "@/api/client"
import type {
  Incident,
  IncidentDetail,
  Paginated,
  Status,
  Severity,
} from "@/types/incident"

export interface IncidentFilters {
  page?: number
  search?: string
  status?: Status
  severity?: Severity
  ward?: number
  category?: number
  assigned_to?: number
  overdue?: boolean
  mine?: boolean
  assigned_to_me?: boolean
  occurred_after?: string
  occurred_before?: string
  ordering?: string
}

export interface CreateIncidentPayload {
  title: string
  description: string
  occurred_at: string
  ward: number
  category: number
  severity: Severity
  patient_ref: string
  is_anonymous: boolean
}

export interface AssignPayload {
  assigned_to: number
  due_date?: string | null
}

export interface CorrectiveActionPayload {
  description: string
  owner?: number | null
  due_date?: string | null
  is_done?: boolean
}

export interface DashboardStats {
  total: number
  open: number
  closed: number
  overdue: number
  unassigned: number
  avg_days_to_close: number | null
  by_severity: Array<{ value: Severity; label: string; count: number }>
  by_status: Array<{ value: Status; label: string; count: number }>
  by_ward: Array<{ ward: string; count: number }>
  by_category: Array<{ category: string; count: number }>
  monthly: Array<{ month: string; count: number }>
}

export async function listIncidents(
  filters: IncidentFilters = {},
): Promise<Paginated<Incident>> {
  const { data } = await api.get<Paginated<Incident>>("/incidents/", {
    params: filters,
  })
  return data
}

export async function getIncident(id: number): Promise<IncidentDetail> {
  const { data } = await api.get<IncidentDetail>(`/incidents/${id}/`)
  return data
}

export async function createIncident(
  payload: CreateIncidentPayload,
): Promise<IncidentDetail> {
  const { data } = await api.post<IncidentDetail>("/incidents/", payload)
  return data
}

export async function transitionIncident(
  id: number,
  status: Status,
): Promise<IncidentDetail> {
  const { data } = await api.post<IncidentDetail>(
    `/incidents/${id}/transition/`,
    { status },
  )
  return data
}

export async function assignIncident(
  id: number,
  payload: AssignPayload,
): Promise<IncidentDetail> {
  const { data } = await api.post<IncidentDetail>(
    `/incidents/${id}/assign/`,
    payload,
  )
  return data
}

export async function addComment(
  id: number,
  body: string,
): Promise<{ id: number; author_name: string; body: string; created_at: string }> {
  const { data } = await api.post<{
    id: number
    author_name: string
    body: string
    created_at: string
  }>(`/incidents/${id}/comments/`, { body })
  return data
}

export async function addAction(
  id: number,
  payload: CorrectiveActionPayload,
): Promise<import("@/types/incident").CorrectiveAction> {
  const { data } = await api.post<import("@/types/incident").CorrectiveAction>(
    `/incidents/${id}/actions/`,
    payload,
  )
  return data
}

export async function patchAction(
  id: number,
  payload: Partial<CorrectiveActionPayload>,
): Promise<import("@/types/incident").CorrectiveAction> {
  const { data } = await api.patch<import("@/types/incident").CorrectiveAction>(
    `/actions/${id}/`,
    payload,
  )
  return data
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>("/dashboard/stats/")
  return data
}
