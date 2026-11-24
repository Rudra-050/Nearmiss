import { Box, HStack, Text } from "@chakra-ui/react"
import { statusLabels } from "@/lib/labels"
import type { Status } from "@/types/incident"

const statusTokens: Record<Status, string> = {
  REPORTED: "status.reported",
  UNDER_REVIEW: "status.underReview",
  INVESTIGATING: "status.investigating",
  ACTION_TAKEN: "status.actionTaken",
  CLOSED: "status.closed",
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <HStack as="span" gap="2" fontSize="xs" fontWeight="semibold" color="fg.muted">
      <Box as="span" w="2" h="2" rounded="full" bg={statusTokens[status]} />
      <Text as="span">{statusLabels[status]}</Text>
    </HStack>
  )
}
