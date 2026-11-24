import { Center, Spinner, Text, VStack } from "@chakra-ui/react"

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <Center minH="200px">
      <VStack gap="3">
        <Spinner size="lg" color="brand.solid" />
        <Text color="fg.muted">{label}</Text>
      </VStack>
    </Center>
  )
}
