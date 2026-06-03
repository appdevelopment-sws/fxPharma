import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type PropsWithChildren,
} from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { useAuth } from "@/context/authContext"
import SettingsApi from "@/services/settingsApi"

export type SettingsStore = {
  city?: string
  country?: string
  currency?: string
  description?: string
  drug_license_20?: string
  drug_license_21?: string
  email?: string
  expiry_alert_months?: string
  fssai_no?: string
  gst_number?: string
  invoice_director_signature?: string
  invoice_email?: string
  invoice_footer_image?: string
  invoice_footer_message?: string
  invoice_header_image?: string
  invoice_payment_qr_code?: string
  invoice_phone?: string
  invoice_prefix?: string
  invoice_sequence?: string
  invoice_show_gst?: string
  invoice_show_license?: string
  invoice_show_payment_qr?: string
  invoice_template?: string
  invoice_template_name?: string
  invoice_terms_conditions?: string
  license_number?: string
  low_stock_threshold?: string
  phone?: string
  require_prescription?: string
  state?: string
  store_category?: string
  store_logo?: string
  store_name?: string
  street_address?: string
  timezone?: string
  zip_code?: string
  whatsapp_invoice_template?: string
  [key: string]: string | undefined
}

export type SettingsContextValue = {
  settings: SettingsStore
  isLoading: boolean
  isFetching: boolean
  refreshSettings: () => Promise<void>
  updateSetting: (key: string, value: any) => Promise<void>
}

const SettingsContext = createContext<SettingsContextValue | undefined>(
  undefined
)

export function SettingsProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient()
  const { activeOrganizationId, activeBranchId, user } = useAuth()

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["settings", activeOrganizationId, activeBranchId],
    queryFn: async () => {
      if (!activeOrganizationId) {
        return { success: true, data: {} as SettingsStore }
      }

      return await SettingsApi.getSettings()
    },
    enabled: Boolean(user && activeOrganizationId),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })

  const settings = useMemo<SettingsStore>(
    () => (data?.data as SettingsStore | undefined) ?? {},
    [data]
  )

  const refreshSettings = useCallback(async () => {
    await refetch()
  }, [refetch])

  const updateSetting = useCallback(
    async (key: string, value: any) => {
      await SettingsApi.updateSettings({ [key]: value })

      queryClient.setQueryData(
        ["settings", activeOrganizationId, activeBranchId],
        (previous: any) => ({
          ...previous,
          data: {
            ...(previous?.data ?? {}),
            [key]: value,
          },
        })
      )

      await queryClient.invalidateQueries({
        queryKey: ["settings", activeOrganizationId, activeBranchId],
      })
    },
    [activeBranchId, activeOrganizationId, queryClient]
  )

  const value = useMemo(
    () => ({
      settings,
      isLoading,
      isFetching,
      refreshSettings,
      updateSetting,
    }),
    [isFetching, isLoading, refreshSettings, settings, updateSetting]
  )

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)

  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider")
  }

  return context
}
