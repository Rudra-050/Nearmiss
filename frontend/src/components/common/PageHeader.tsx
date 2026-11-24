import { Box, Heading, HStack, Text } from "@chakra-ui/react"
import type { ReactNode } from "react"

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <HStack align="start" justify="space-between" gap="4" mb="6">
      <Box>
        <Heading as="h1" size="xl" fontFamily="heading">
          {title}
 </Heading>
        {description && (
          <Text mt="1" color="fg.muted">
            {description}
          </Text>
        )}
      </Box>
      {action}
    </HStack>
  )
}
