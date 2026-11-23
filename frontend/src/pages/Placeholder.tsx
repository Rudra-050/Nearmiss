
import { Box, Heading, Text, VStack } from "@chakra-ui/react"

interface PlaceholderProps {
  title: string
}

export default function Placeholder({ title }: PlaceholderProps) {
  return (
    <Box
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border"
      rounded="2xl"
      p={{ base: "5", md: "8" }}
    >
      <VStack align="start" gap="3">
        <Heading size="xl" fontFamily="heading">
          {title}
        </Heading>

        <Text color="fg.muted">
          This module is currently under development.
          Its functionality will be available here soon.
        </Text>
      </VStack>
    </Box>
  )
}
