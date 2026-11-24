import { Box, Heading, Text } from "@chakra-ui/react"

interface EmptyStateProps {
  title: string
  description?: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Box
      textAlign="center"
      py="10"
      px="4"
      borderWidth="1px"
      borderColor="border"
      rounded="xl"
      bg="bg.panel"
    >
      <Heading size="md">{title}</Heading>
      {description && <Text mt="2" color="fg.muted">{description}</Text>}
    </Box>
  )
}
