import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Toaster } from "@/components/ui/sonner"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { queryClient } from "./services/customQueryClient.ts"
import { QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "@/context/authContext"
import { SettingsProvider } from "@/context/settingsContext"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SettingsProvider>
            <ReactQueryDevtools initialIsOpen={false} />
            <App />
          </SettingsProvider>
        </AuthProvider>
      </QueryClientProvider>
      <Toaster />
    </ThemeProvider>
  </StrictMode>
)
