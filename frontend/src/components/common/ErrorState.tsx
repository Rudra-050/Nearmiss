import { Alert, Button, Stack } from "@chakra-ui/react"

interface ErrorStateProps {
  message: string
  retry?: () => void
}

export function ErrorState({ message, retry }: ErrorStateProps) {
  return (
    <Alert.Root status="error">
      <Alert.Indicator />
      <Stack gap="1" flex="1">
        <Alert.Title>{message}</Alert.Title>
        {retry && (
          <Button size="sm" alignSelf="start" variant="outline" onClick={retry}>
            Try again
          </Button>
        )}
      </Stack>
    </Alert.Root>
  )
}
