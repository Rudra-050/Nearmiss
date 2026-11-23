import { Box, Flex, HStack, IconButton, Image } from "@chakra-ui/react"
import { LuBell } from "react-icons/lu"
import { Link } from "react-router-dom"
import logoLight from "@/assets/nearmiss-pulse-logo.svg"
import logoDark from "@/assets/nearmiss-pulse-logo-dark.svg"
import { ColorModeButton, useColorModeValue } from "@/components/ui/color-mode"
import { MobileMenu } from "./MobileMenu"
import { NavLinks } from "./NavLinks"
import { UserMenu } from "./UserMenu"

export function FloatingHeader() {
  const logo = useColorModeValue(logoLight, logoDark)

  return (
    <Flex
      as="header"
      position="fixed"
      top="3"
      left="50%"
      transform="translateX(-50%)"
      w="calc(100% - 24px)"
      maxW="1200px"
      zIndex="sticky"
      align="center"
      justify="space-between"
      gap="4"
      px={{ base: "3", md: "5" }}
      py="2"
      rounded="full"
      borderWidth="1px"
      borderColor="header.border"
      bg="header.bg"
      backdropFilter="blur(10px)"
      shadow="md"
    >
      <Link to="/">
        <Image src={logo} alt="NearMiss" h="32px" />
      </Link>

      <NavLinks />

      <HStack gap="1">
        <Box position="relative">
          <IconButton aria-label="Notifications" variant="ghost" rounded="full">
            <LuBell />
          </IconButton>
          <Box
            position="absolute"
            top="2"
            right="2"
            boxSize="2"
            rounded="full"
            bg="severity.serious.solid"
          />
        </Box>
        <ColorModeButton rounded="full" />
        <UserMenu />
        <MobileMenu />
      </HStack>
    </Flex>
  )
}