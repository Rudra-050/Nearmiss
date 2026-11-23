import { Button, HStack } from "@chakra-ui/react"

export default function App() {
  return (
    <HStack p="8">
      <Button colorPalette="teal">NearMiss works</Button>
      <Button variant="outline">Outline</Button>
    </HStack>
  )
}