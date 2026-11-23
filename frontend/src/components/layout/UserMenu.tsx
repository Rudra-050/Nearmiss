import { Avatar, Button, Menu, Portal, Text } from "@chakra-ui/react"
import { useAuth, useCurrentUser } from "@/api/AuthContext"
import { roleLabels } from "@/lib/nav"

export function UserMenu() {
  const user = useCurrentUser()
  const { logout } = useAuth()

  return (
    <Menu.Root
      onSelect={(details) => {
        if (details.value === "signout") logout()
      }}
    >
      <Menu.Trigger asChild>
        <Button variant="ghost" rounded="full" px="1" h="9" gap="2">
          <Avatar.Root size="xs" colorPalette="brand">
            <Avatar.Fallback name={user.full_name} />
          </Avatar.Root>
          <Text
            display={{ base: "none", lg: "inline" }}
            fontSize="sm"
            fontWeight="medium"
          >
            {user.full_name}
          </Text>
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content minW="52">
            <Menu.ItemGroup>
              <Menu.ItemGroupLabel>
                {user.full_name} · {roleLabels[user.role]}
              </Menu.ItemGroupLabel>
            </Menu.ItemGroup>
            <Menu.Separator />
            <Menu.Item value="signout">Sign out</Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}