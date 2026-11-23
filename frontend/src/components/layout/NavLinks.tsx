import { Box, Button, HStack, Menu, Portal } from "@chakra-ui/react"
import { LuChevronDown } from "react-icons/lu"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { useCurrentUser } from "@/api/AuthContext"
import { adminNav, mainNav } from "@/lib/nav"

export function NavLinks() {
  const user = useCurrentUser()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const items = mainNav.filter((i) => i.roles.includes(user.role))
  const adminItems = adminNav.filter((i) => i.roles.includes(user.role))
  const adminActive = pathname.startsWith("/admin")

  return (
    <HStack gap="1" display={{ base: "none", md: "flex" }}>
      {items.map((item) => (
        <NavLink key={item.to} to={item.to}>
          {({ isActive }) => (
            <Box
              px="3"
              py="1.5"
              rounded="full"
              fontSize="sm"
              fontWeight="medium"
              bg={isActive ? "brand.subtle" : "transparent"}
              color={isActive ? "brand.fg" : "fg.muted"}
              _hover={{ bg: "bg.subtle", color: "fg" }}
            >
              {item.label}
            </Box>
          )}
        </NavLink>
      ))}

      {adminItems.length > 0 && (
        <Menu.Root onSelect={(details) => navigate(details.value)}>
          <Menu.Trigger asChild>
            <Button
              size="sm"
              variant="ghost"
              rounded="full"
              fontWeight="medium"
              bg={adminActive ? "brand.subtle" : "transparent"}
              color={adminActive ? "brand.fg" : "fg.muted"}
            >
              Admin <LuChevronDown />
            </Button>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                {adminItems.map((item) => (
                  <Menu.Item key={item.to} value={item.to}>
                    {item.label}
                  </Menu.Item>
                ))}
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      )}
    </HStack>
  )
}