import { Children, type ReactNode } from "react"

interface EachProps<T> {
  render: (item: T, index: number) => ReactNode
  of?: T[]
  isLoading?: boolean
  nodatafound?: ReactNode
  fallback?: ReactNode
  className?: string // Adding standard className pass-through just in case
}

export default function Each<T>({
  render,
  of,
  isLoading,
  nodatafound,
  fallback,
}: EachProps<T>) {
  if (isLoading) {
    if (fallback) {
      if (Array.isArray(fallback)) return Children.toArray(fallback)
      return fallback
    }
  }

  if (!of || of.length === 0) {
    return nodatafound || null
  }

  return Children.toArray(of.map((item, index) => render(item, index)))
}
