import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: "'Poppins', system-ui, sans-serif" },
        body: { value: "'Inter Variable', 'Inter', system-ui, sans-serif" },
      },
      colors: {
        // Teal scale for the brand
        brand: {
          50: { value: "#F0FDFA" },
          100: { value: "#CCFBF1" },
          200: { value: "#99F6E4" },
          300: { value: "#5EEAD4" },
          400: { value: "#2DD4BF" },
          500: { value: "#14B8A6" },
          600: { value: "#0D9488" },
          700: { value: "#0F766E" },
          800: { value: "#115E59" },
          900: { value: "#134E4A" },
          950: { value: "#042F2E" },
        },
      },
    },

    semanticTokens: {
      colors: {
        /* ---------- Brand (needed for colorPalette="brand") ---------- */
        brand: {
          solid: { value: { _light: "{colors.brand.700}", _dark: "{colors.brand.400}" } },
          contrast: { value: { _light: "#FFFFFF", _dark: "{colors.brand.950}" } },
          fg: { value: { _light: "{colors.brand.700}", _dark: "{colors.brand.300}" } },
          muted: { value: { _light: "{colors.brand.100}", _dark: "rgba(45,212,191,0.18)" } },
          subtle: { value: { _light: "{colors.brand.50}", _dark: "rgba(45,212,191,0.12)" } },
          emphasized: { value: { _light: "{colors.brand.200}", _dark: "rgba(45,212,191,0.28)" } },
          focusRing: { value: { _light: "{colors.brand.500}", _dark: "{colors.brand.400}" } },
        },

        /* ---------- Surfaces ---------- */
        bg: {
          DEFAULT: { value: { _light: "#F8FAFC", _dark: "#0B1220" } }, // page
          panel: { value: { _light: "#FFFFFF", _dark: "#131C31" } }, // cards
          subtle: { value: { _light: "#F1F5F9", _dark: "#1A2540" } }, // table header, hover
          muted: { value: { _light: "#E2E8F0", _dark: "#243049" } },
        },

        /* ---------- Text ---------- */
        fg: {
          DEFAULT: { value: { _light: "#0F172A", _dark: "#E2E8F0" } },
          muted: { value: { _light: "#475569", _dark: "#94A3B8" } },
          subtle: { value: { _light: "#64748B", _dark: "#7B8AA5" } },
        },

        /* ---------- Borders ---------- */
        border: {
          DEFAULT: { value: { _light: "#E2E8F0", _dark: "#243049" } },
        },

        /* ---------- Accent and links ---------- */
        accent: {
          DEFAULT: { value: { _light: "#0EA5E9", _dark: "#38BDF8" } },
          link: { value: { _light: "#0369A1", _dark: "#7DD3FC" } },
        },

        /* ---------- Floating header ---------- */
        header: {
          bg: { value: { _light: "rgba(255,255,255,0.8)", _dark: "rgba(19,28,49,0.75)" } },
          border: { value: { _light: "#E2E8F0", _dark: "#243049" } },
        },

        /* ---------- Severity badges ---------- */
        severity: {
          nearMiss: {
            bg: { value: { _light: "#DBEAFE", _dark: "rgba(59,130,246,0.18)" } },
            fg: { value: { _light: "#1E40AF", _dark: "#93C5FD" } },
            solid: { value: { _light: "#3B82F6", _dark: "#60A5FA" } },
          },
          noHarm: {
            bg: { value: { _light: "#DCFCE7", _dark: "rgba(34,197,94,0.18)" } },
            fg: { value: { _light: "#166534", _dark: "#86EFAC" } },
            solid: { value: { _light: "#22C55E", _dark: "#4ADE80" } },
          },
          minor: {
            bg: { value: { _light: "#FEF3C7", _dark: "rgba(245,158,11,0.18)" } },
            fg: { value: { _light: "#92400E", _dark: "#FCD34D" } },
            solid: { value: { _light: "#F59E0B", _dark: "#FBBF24" } },
          },
          serious: {
            bg: { value: { _light: "#FEE2E2", _dark: "rgba(239,68,68,0.18)" } },
            fg: { value: { _light: "#991B1B", _dark: "#FCA5A5" } },
            solid: { value: { _light: "#EF4444", _dark: "#F87171" } },
          },
        },

        /* ---------- Workflow status ---------- */
        status: {
          reported: { value: { _light: "#64748B", _dark: "#94A3B8" } },
          underReview: { value: { _light: "#6366F1", _dark: "#818CF8" } },
          investigating: { value: { _light: "#8B5CF6", _dark: "#A78BFA" } },
          actionTaken: { value: { _light: "{colors.brand.700}", _dark: "{colors.brand.400}" } },
          closed: { value: { _light: "#334155", _dark: "#CBD5E1" } },
        },

        /* ---------- Chart series ---------- */
        chart: {
          1: { value: { _light: "#0F766E", _dark: "#2DD4BF" } },
          2: { value: { _light: "#0EA5E9", _dark: "#38BDF8" } },
          3: { value: { _light: "#8B5CF6", _dark: "#A78BFA" } },
          4: { value: { _light: "#F59E0B", _dark: "#FBBF24" } },
          5: { value: { _light: "#F43F5E", _dark: "#FB7185" } },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)