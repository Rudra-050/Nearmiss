import { Box, HStack, Text } from "@chakra-ui/react"
import { severityLabels } from "@/lib/labels"
import type { Severity } from "@/types/incident"

const severityTokens: Record<Severity, { bg: string; fg: string; dot: string }> = {
  NEAR_MISS: { bg: "severity.nearMiss.bg", fg: "severity.nearMiss.fg", dot: "severity.nearMiss.solid" },
  NO_HARM: { bg: "severity.noHarm.bg", fg: "severity.noHarm.fg", dot: "severity.noHarm.solid" },
  MINOR: { bg: "severity.minor.bg", fg: "severity.minor.fg", dot: "severity.minor.solid" },
  SERIOUS: { bg: "severity.serious.bg", fg: "severity.serious.fg", dot: "severity.serious.solid" },
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const token = severityTokens[severity]
  return (
    <HStack
      as="span"
      gap="2"
      px="2"
      py="1"
      rounded="full"
      bg={token.bg}
      color={token.fg}
      fontSize="xs"
      fontWeight="semibold"
    >
      <Box as="span" w="2" h="2" rounded="full" bg={token.dot} />
      <Text as="span">{severityLabels[severity]}</Text>
    </HStack>
  )
}
