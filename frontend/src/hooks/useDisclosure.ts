import { useState, useCallback } from "react"

interface UseDisclosureReturn<D = void> {
  isOpen: boolean
  data?: D
  onOpen: (data?: D) => void
  onClose: () => void
  toggle: () => void
  setData: (data?: D) => void
}

/**
 * Custom hook for managing disclosure (modal/dialog) state
 * Handles open/close state and optional data payload
 *
 * @template D - Type of data to store while open
 * @param initialOpen - Whether the disclosure should start open (default: false)
 * @returns Disclosure state and control methods
 *
 * @example
 * const disclosure = useDisclosure<Product>();
 *
 * // Open with data
 * disclosure.onOpen(product);
 *
 * // Close
 * disclosure.onClose();
 *
 * // Check state
 * if (disclosure.isOpen && disclosure.data) {
 *   // render modal with data
 * }
 */
export const useDisclosure = <D = void>(
  initialOpen = false
): UseDisclosureReturn<D> => {
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [data, setData] = useState<D | undefined>()

  const onOpen = useCallback((newData?: D) => {
    setData(newData)
    setIsOpen(true)
  }, [])

  const onClose = useCallback(() => {
    setIsOpen(false)
    // Clear data on close for clean state
    setData(undefined)
  }, [])

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const updateData = useCallback((newData?: D) => {
    setData(newData)
  }, [])

  return {
    isOpen,
    data,
    onOpen,
    onClose,
    toggle,
    setData: updateData,
  }
}
