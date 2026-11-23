import { Box, Flex, Image, Text } from "@chakra-ui/react"
import { Outlet } from "react-router-dom"
import logoLight from "@/assets/nearmiss-pulse-logo.svg"
import logoDark from "@/assets/nearmiss-pulse-logo-dark.svg"
import { ColorModeButton, useColorModeValue } from "@/components/ui/color-mode"

export default function AuthLayout() {
  const logo = useColorModeValue(logoLight, logoDark)

  return (
    <Flex minH="100vh" bg="bg" color="fg" fontFamily="body" align="center" justify="center" p="4">
      <Box position="absolute" top="4" right="4">
        <ColorModeButton />
      </Box>
      <Box w="full" maxW="400px">
        <Flex direction="column" align="center" mb="8" gap="2">
          <Image src={logo} alt="NearMiss" h="44px" />
          <Text color="fg.muted">Speak Up, Stay Safe</Text>
        </Flex>
        <Outlet />
      </Box>
    </Flex>
  )
}