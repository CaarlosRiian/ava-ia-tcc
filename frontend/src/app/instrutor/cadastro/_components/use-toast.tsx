"use client"

import { useState, useEffect } from "react"

interface ToastOptions {
  title: string
  description?: string
  variant?: "default" | "destructive"
}

let memoryToast: ToastOptions | null = null
const listeners = new Set<(toast: ToastOptions | null) => void>()

export function toast(options: ToastOptions) {
  memoryToast = options
  listeners.forEach((listener) => listener(memoryToast))

  setTimeout(() => {
    if (memoryToast === options) {
      memoryToast = null
      listeners.forEach((listener) => listener(null))
    }
  }, 4000)
}

export function useToast() {
  const [activeToast, setActiveToast] = useState<ToastOptions | null>(memoryToast)

  useEffect(() => {
    listeners.add(setActiveToast)
    return () => {
      listeners.delete(setActiveToast)
    }
  }, [])

  return {
    toast,
    activeToast,
    dismiss: () => {
      memoryToast = null
      listeners.forEach((listener) => listener(null))
    }
  }
}