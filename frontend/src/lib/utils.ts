import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(path: string | undefined | null) {
  if (!path) return ""
  // If it's already an absolute URL or data URI, return as is
  if (path.startsWith("http") || path.startsWith("data:")) {
    return path
  }
  // Remove leading slash if present, so we don't end up with //
  const cleanPath = path.startsWith("/") ? path.slice(1) : path

  // For development with Vite proxy, or production on same domain,
  // we can use a relative or absolute path from origin.
  // We'll use absolute path from root.
  return `/${cleanPath}`
}

export const formatDateForInput = (value: unknown) => {
  if (!value) return ""
  const date =
    value instanceof Date
      ? value
      : typeof value === "string"
        ? new Date(value)
        : null
  if (!date || Number.isNaN(date.getTime())) return ""
  return date.toISOString().slice(0, 10)
}
