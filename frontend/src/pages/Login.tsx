import { Alert, Box, Button, Field, Heading, Input, Stack } from "@chakra-ui/react"
import axios from "axios"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/api/AuthContext"
import { getErrorMessage } from "@/lib/errors"

interface FormValues {
  username: string
  password: string
}

export default function Login() {
  const { user, login } = useAuth()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>()

  const from = (location.state as { from?: string } | null)?.from ?? "/"

  if (user) return <Navigate to={from} replace />

  const onSubmit = async (values: FormValues) => {
    setError(null)
    try {
      await login(values.username.trim(), values.password)
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 401) {
        setError("Incorrect username or password.")
      } else {
        setError(getErrorMessage(e))
      }
    }
  }

  return (
    <Box bg="bg.panel" borderWidth="1px" borderColor="border" rounded="xl" p="6">
      <Heading as="h1" size="lg" fontFamily="heading" mb="5">
        Sign in
      </Heading>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack gap="4">
          {error && (
            <Alert.Root status="error">
              <Alert.Indicator />
              <Alert.Title>{error}</Alert.Title>
            </Alert.Root>
          )}

          <Field.Root invalid={!!errors.username}>
            <Field.Label>Username</Field.Label>
            <Input
              autoComplete="username"
              {...register("username", { required: "Enter your username" })}
            />
            <Field.ErrorText>{errors.username?.message}</Field.ErrorText>
          </Field.Root>

          <Field.Root invalid={!!errors.password}>
            <Field.Label>Password</Field.Label>
            <Input
              type="password"
              autoComplete="current-password"
              {...register("password", { required: "Enter your password" })}
            />
            <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
          </Field.Root>

          <Button type="submit" colorPalette="brand" loading={isSubmitting}>
            Sign in
          </Button>
        </Stack>
      </form>
    </Box>
  )
}