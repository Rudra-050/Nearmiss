import {
  Badge, Box, Button, Container, Flex, Heading, HStack, SimpleGrid, Text,
} from "@chakra-ui/react"
import { ColorModeButton } from "@/components/ui/color-mode"

const severities = [
  { key: "nearMiss", label: "Near-miss" },
  { key: "noHarm", label: "No harm" },
  { key: "minor", label: "Minor" },
  { key: "serious", label: "Serious" },
] as const

const statuses = [
  { key: "reported", label: "Reported" },
  { key: "underReview", label: "Under review" },
  { key: "investigating", label: "Investigating" },
  { key: "actionTaken", label: "Action taken" },
  { key: "closed", label: "Closed" },
] as const

export default function App() {
  return (
    <Box minH="100vh" bg="bg" color="fg" fontFamily="body">
      {/* Floating header preview */}
      <Flex
        position="fixed" top="4" left="50%" transform="translateX(-50%)"
        w="calc(100% - 32px)" maxW="1200px" zIndex="10"
        px="5" py="3" align="center" justify="space-between"
        rounded="full" borderWidth="1px" borderColor="header.border"
        bg="header.bg" backdropFilter="blur(10px)" shadow="md"
      >
        <Heading size="md" fontFamily="heading" color="brand.fg">NearMiss</Heading>
        <ColorModeButton />
      </Flex>

      <Container maxW="1200px" pt="28" pb="16">
        <Heading fontFamily="heading" mb="6">Theme check</Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap="6">
          <Box bg="bg.panel" borderWidth="1px" borderColor="border" rounded="xl" p="6">
            <Heading size="md" fontFamily="heading" mb="2">Card surface</Heading>
            <Text color="fg.muted" mb="4">Muted text on a panel.</Text>
            <HStack>
              <Button colorPalette="brand">Primary</Button>
              <Button colorPalette="brand" variant="subtle">Subtle</Button>
              <Button colorPalette="brand" variant="outline">Outline</Button>
            </HStack>
            <Text mt="4" color="accent.link">A link-colored text</Text>
          </Box>

          <Box bg="bg.panel" borderWidth="1px" borderColor="border" rounded="xl" p="6">
            <Heading size="md" fontFamily="heading" mb="3">Severity</Heading>
            <HStack wrap="wrap" mb="5">
              {severities.map((s) => (
                <Badge key={s.key} px="3" py="1" rounded="full"
                  bg={`severity.${s.key}.bg`} color={`severity.${s.key}.fg`}>
                  {s.label}
                </Badge>
              ))}
            </HStack>
            <Heading size="md" fontFamily="heading" mb="3">Status</Heading>
            <HStack wrap="wrap">
              {statuses.map((s) => (
                <Badge key={s.key} px="3" py="1" rounded="full"
                  bg={`status.${s.key}/15`} color={`status.${s.key}`}>
                  {s.label}
                </Badge>
              ))}
            </HStack>
          </Box>
        </SimpleGrid>

        <HStack mt="8" gap="3">
          {[1, 2, 3, 4, 5].map((n) => (
            <Box key={n} w="12" h="12" rounded="lg" bg={`chart.${n}`} />
          ))}
        </HStack>
      </Container>
    </Box>
  )
}