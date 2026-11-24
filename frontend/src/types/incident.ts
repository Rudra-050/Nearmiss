export type Severity = "NEAR_MISS" | "NO_HARM" | "MINOR" | "SERIOUS"

export type Status =
  | "REPORTED"
  | "UNDER_REVIEW"
  | "INVESTIGATING"
  | "ACTION_TAKEN"
  | "CLOSED"

export interface Ward {
  id: number
  name: string
  code: string
  is_active: boolean
}

export interface Category {
  id: number
  name: string
  is_active: boolean
}

export interface Incident {
  id: number
  reference: string
  title: string
  severity: Severity
  status: Status
  occurred_at: string
  created_at: string
  due_date: string | null
  is_overdue: boolean
  is_anonymous: boolean
  ward: number
  ward_name: string
  category: number
  category_name: string
  assigned_to: number | null
  assigned_to_name: string | null
  reporter_name: string
}

export interface Comment {
  id: number
  author_name: string
  body: string
  created_at: string
}

export interface CorrectiveAction {
  id: number
  description: string
  owner: number | null
  owner_name: string | null
  due_date: string | null
  is_done: boolean
  completed_at: string | null
  created_at: string
}

export interface ActivityEntry {
  id: number
  event: string
  event_label: string
  actor_name: string
  from_value: string
  to_value: string
  created_at: string
}

export interface IncidentDetail extends Incident {
  description: string
  closed_at: string | null
  patient_ref: string
  allowed_transitions: Status[]
  comments: Comment[]
  actions: CorrectiveAction[]
  activity: ActivityEntry[]
}

export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
