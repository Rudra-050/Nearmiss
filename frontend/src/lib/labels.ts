import type { Severity, Status } from "@/types/incident"

export const severityLabels: Record<Severity, string> = {
  NEAR_MISS: "Near-miss",
  NO_HARM: "No harm",
  MINOR: "Minor",
  SERIOUS: "Serious",
}

export const statusLabels: Record<Status, string> = {
  REPORTED: "Reported",
  UNDER_REVIEW: "Under review",
  INVESTIGATING: "Investigating",
  ACTION_TAKEN: "Action taken",
  CLOSED: "Closed",
}
