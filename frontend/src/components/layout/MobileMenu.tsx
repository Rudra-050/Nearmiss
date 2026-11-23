import {
  Box,
  CloseButton,
  Drawer,
  IconButton,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react"
import { useState } from "react"
import { LuMenu } from "react-icons/lu"
import { NavLink } from "react-router-dom"
import { useCurrentUser } from "@/api/AuthContext"
import { adminNav, mainNav, type NavItem } from "@/lib/nav"

export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const user = useCurrentUser()

  const items = mainNav.filter((i) => i.roles.includes(user.role))
  const adminItems = adminNav.filter((i) => i.roles.includes(user.role))

  const renderLink = (item: NavItem) => (
    <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)}>
      {({ isActive }) => (
        <Box
          px="3"
          py="2.5"
          rounded="lg"
          fontWeight="medium"
          bg={isActive ? "brand.subtle" : "transparent"}
          color={isActive ? "brand.fg" : "fg"}
        >
          {item.label}
        </Box>
      )}
    </NavLink>
  )

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(details) => setOpen(details.open)}
      placement="end"
      size="xs"
    >
      <Drawer.Trigger asChild>
        <IconButton
          aria-label="Open menu"
          variant="ghost"
          rounded="full"
          display={{ base: "inline-flex", md: "none" }}
        >
          <LuMenu />
        </IconButton>
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content bg="bg.panel">
            <Drawer.Header>
              <Drawer.Title fontFamily="heading">Menu</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              <Stack gap="1">
                {items.map(renderLink)}
                {adminItems.length > 0 && (
                  <>
                    <Text
                      mt="4"
                      mb="1"
                      px="3"
                      fontSize="xs"
                      color="fg.subtle"
                      textTransform="uppercase"
                    >
                      Admin
                    </Text>
                    {adminItems.map(renderLink)}
                  </>
                )}
              </Stack>
            </Drawer.Body>
            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  )
}
