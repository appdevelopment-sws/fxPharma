import { api } from "./api"

const BASE_URL = "/settings"

const SettingsApi = {
  getSettings: async (): Promise<{ success: boolean; data: Record<string, string> }> => {
    return await api.get<any>(BASE_URL)
  },

  updateSettings: async (settings: Record<string, any>): Promise<{ success: boolean; message: string }> => {
    return await api.put<any>(BASE_URL, settings)
  },
}

export default SettingsApi
