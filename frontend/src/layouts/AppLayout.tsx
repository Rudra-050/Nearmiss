
import { Box } from "@chakra-ui/react"
import { Outlet } from "react-router-dom"
import { FloatingHeader } from "@/components/layout/FloatingHeader"

export default function AppLayout() {
  return (
    <Box minH="100vh" bg="bg" color="fg" fontFamily="body">
      <FloatingHeader />

      <Box
        as="main"
        maxW="1200px"
        mx="auto"
        px={{ base: "4", md: "6" }}
        pt={{ base: "24", md: "28" }}
        pb="12"
      >
        <Outlet />
      </Box>
    </Box>
  )
}
