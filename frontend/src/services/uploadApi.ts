import { api } from "./api"

type PresignedUploadResponse = {
  presignedUrl: string
  publicUrl: string
  expiresIn: number
  key: string
}

const UploadApi = {
  getImagePresignedUrl: async (file: File): Promise<PresignedUploadResponse> => {
    const res = await api.get<{ data: PresignedUploadResponse }>(
      "/upload/presigned-url",
      {
        params: {
          fileName: file.name,
          fileType: file.type || "application/octet-stream",
        },
      }
    )

    return res.data
  },

  uploadImage: async (file: File): Promise<PresignedUploadResponse> => {
    const presigned = await UploadApi.getImagePresignedUrl(file)

    const uploadResponse = await fetch(presigned.presignedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    })

    if (!uploadResponse.ok) {
      throw new Error(
        `Failed to upload image to R2 (${uploadResponse.status} ${uploadResponse.statusText})`
      )
    }

    return presigned
  },
}

export const uploadApi = UploadApi
export default UploadApi
