import {
  Alert,
  Box,
  Button,
  Field,
  HStack,
  Input,
  NativeSelect,
  Stack,
  Switch,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react"
import axios from "axios"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { z } from "zod"
import { useEffect, useState } from "react"
import { createIncident } from "@/api/incidents"
import { getCategories, getWards } from "@/api/reference"
import { PageHeader } from "@/components/common/PageHeader"
import { LoadingState } from "@/components/common/LoadingState"
import { ErrorState } from "@/components/common/ErrorState"
import { toaster } from "@/components/ui/toaster"
import { getErrorMessage } from "@/lib/errors"
import type { Category, Severity, Ward } from "@/types/incident"

const severityOptions: Array<{
  value: Severity
  label: string
  hint: string
}> = [
  { value: "NEAR_MISS", label: "Near-miss", hint: "Event avoided harm" },
  { value: "NO_HARM", label: "No harm", hint: "No injury occurred" },
  { value: "MINOR", label: "Minor", hint: "Temporary or mild harm" },
  { value: "SERIOUS", label: "Serious", hint: "Significant or lasting harm" },
]

function toDateTimeLocal(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

const reportSchema = z.object({
  title: z.string().trim().min(1, "Enter a title").max(200, "Title must be 200 characters or fewer"),
  description: z.string().trim().min(10, "Describe what happened in at least 10 characters"),
  occurred_at: z.string().min(1, "Select when the incident occurred").refine(
    (value) => !Number.isNaN(new Date(value).getTime()) && new Date(value).getTime() <= Date.now(),
    "The incident time cannot be in the future",
  ),
  ward: z.number({ error: "Select a ward" }).int().positive("Select a ward"),
  category: z.number({ error: "Select a category" }).int().positive("Select a category"),
  severity: z.enum(["NEAR_MISS", "NO_HARM", "MINOR", "SERIOUS"], {
    error: "Select a severity",
  }),
  patient_ref: z
    .string()
    .trim()
    .refine((value) => value === "" || /^[A-Za-z0-9_-]{1,50}$/.test(value), {
      message: "Use letters, numbers, - and _ only (maximum 50 characters)",
    }),
  is_anonymous: z.boolean(),
})

type ReportFormValues = z.infer<typeof reportSchema>

export default function ReportIncident() {
  const navigate = useNavigate()
  const [wards, setWards] = useState<Ward[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [referenceLoading, setReferenceLoading] = useState(true)
  const [referenceError, setReferenceError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const now = toDateTimeLocal(new Date())

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      title: "",
      description: "",
      occurred_at: now,
      ward: undefined,
      category: undefined,
      severity: undefined,
      patient_ref: "",
      is_anonymous: false,
    },
  })

  const selectedSeverity = watch("severity")
  const isAnonymous = watch("is_anonymous")

  const loadReferences = async () => {
    setReferenceLoading(true)
    setReferenceError(null)
    try {
      const [wardData, categoryData] = await Promise.all([
        getWards(),
        getCategories(),
      ])
      setWards(wardData)
      setCategories(categoryData)
    } catch (error) {
      setReferenceError(getErrorMessage(error))
    } finally {
      setReferenceLoading(false)
    }
  }

  useEffect(() => {
    void loadReferences()
  }, [])

  const onSubmit = async (values: ReportFormValues) => {
    setSubmitError(null)
    try {
      await createIncident({
        ...values,
        occurred_at: new Date(values.occurred_at).toISOString(),
        patient_ref: values.patient_ref.trim(),
      })
      toaster.create({
        title: "Incident reported",
        description: "Thank you for helping improve patient safety.",
        type: "success",
      })
      navigate("/my-reports")
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        const data = error.response.data
        if (data && typeof data === "object") {
          const fieldErrors = data as Record<string, unknown>
          let hasFieldError = false
          for (const fieldName of [
            "title",
            "description",
            "occurred_at",
            "ward",
            "category",
            "severity",
            "patient_ref",
            "is_anonymous",
          ] as const) {
            const value = fieldErrors[fieldName]
            const message = Array.isArray(value)
              ? value.find((item): item is string => typeof item === "string")
              : typeof value === "string"
                ? value
                : undefined
            if (message) {
              hasFieldError = true
              setError(fieldName, { type: "server", message })
            }
          }
          if (!hasFieldError) setSubmitError(getErrorMessage(error))
        } else {
          setSubmitError(getErrorMessage(error))
        }
      } else {
        setSubmitError(getErrorMessage(error))
      }
    }
  }

  return (
    <Box maxW="720px" mx="auto">
      <PageHeader
        title="Report an incident"
        description="Reporting helps us learn and keep patients safe. This is not about blame."
      />

      <Box bg="bg.panel" borderWidth="1px" borderColor="border" rounded="2xl" p={{ base: "5", md: "8" }}>
        {referenceLoading ? (
          <LoadingState label="Loading report options" />
        ) : referenceError ? (
          <ErrorState message={referenceError} retry={() => void loadReferences()} />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack gap="5">
              {submitError && (
                <Alert.Root status="error">
                  <Alert.Indicator />
                  <Alert.Title>{submitError}</Alert.Title>
                </Alert.Root>
              )}

              <Field.Root invalid={!!errors.title}>
                <Field.Label>Title</Field.Label>
                <Input {...register("title")} maxLength={200} />
                <Field.ErrorText>{errors.title?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root invalid={!!errors.description}>
                <Field.Label>What happened?</Field.Label>
                <Textarea {...register("description")} minH="140px" />
                <Field.HelperText>Describe the event in at least 10 characters.</Field.HelperText>
                <Field.ErrorText>{errors.description?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root invalid={!!errors.occurred_at}>
                <Field.Label>When did it occur?</Field.Label>
                <Input
                  type="datetime-local"
                  max={now}
                  {...register("occurred_at")}
                />
                <Field.ErrorText>{errors.occurred_at?.message}</Field.ErrorText>
              </Field.Root>

              <HStack align="start" gap="4" flexDir={{ base: "column", md: "row" }}>
                <Field.Root flex="1" w="full" invalid={!!errors.ward}>
                  <Field.Label>Ward</Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      {...register("ward", { valueAsNumber: true })}
                      aria-label="Ward"
                    >
                      <option value="">Select ward</option>
                      {wards.map((ward) => (
                        <option key={ward.id} value={ward.id}>{ward.name}</option>
                      ))}
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                  <Field.ErrorText>{errors.ward?.message}</Field.ErrorText>
                </Field.Root>

                <Field.Root flex="1" w="full" invalid={!!errors.category}>
                  <Field.Label>Category</Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      {...register("category", { valueAsNumber: true })}
                      aria-label="Category"
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                  <Field.ErrorText>{errors.category?.message}</Field.ErrorText>
                </Field.Root>
              </HStack>

              <Field.Root invalid={!!errors.severity}>
                <Field.Label>Severity</Field.Label>
                <VStack align="stretch" gap="2">
                  {severityOptions.map((option) => {
                    const selected = selectedSeverity === option.value
                    return (
                      <Button
                        key={option.value}
                        type="button"
                        variant={selected ? "solid" : "outline"}
                        colorPalette={selected ? "brand" : "gray"}
                        justifyContent="start"
                        h="auto"
                        py="3"
                        px="4"
                        onClick={() => setValue("severity", option.value, { shouldValidate: true })}
                        aria-pressed={selected}
                      >
                        <VStack align="start" gap="0">
                          <Text fontWeight="semibold">{option.label}</Text>
                          <Text fontSize="xs" color={selected ? "brand.contrast" : "fg.muted"}>
                            {option.hint}
                          </Text>
                        </VStack>
                      </Button>
                    )
                  })}
                </VStack>
                <Field.ErrorText>{errors.severity?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root invalid={!!errors.patient_ref}>
                <Field.Label>Patient reference (optional)</Field.Label>
                <Input
                  {...register("patient_ref")}
                  placeholder="Example: PT-2045"
                />
                <Field.HelperText>
                  De-identified ID only. Never enter a patient&apos;s name.
                </Field.HelperText>
                <Field.ErrorText>{errors.patient_ref?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root>
                <Switch.Root
                  checked={isAnonymous}
                  onCheckedChange={(details) =>
                    setValue("is_anonymous", details.checked, { shouldValidate: true })
                  }
                >
                  <Switch.HiddenInput {...register("is_anonymous")} />
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                  <Switch.Label>Report anonymously</Switch.Label>
                </Switch.Root>
                <Field.HelperText>
                  Hide your identity from staff viewing this report where possible.
                </Field.HelperText>
              </Field.Root>

              <Button
                type="submit"
                colorPalette="brand"
                size="lg"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Submit incident
              </Button>
            </Stack>
          </form>
        )}
      </Box>
    </Box>
  )
}
