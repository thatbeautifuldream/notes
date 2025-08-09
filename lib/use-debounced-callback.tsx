"use client"

import { useRef } from "react"

export function useDebouncedCallback<T extends (...args: any[]) => void>(fn: T, delay: number) {
  const timer = useRef<number | undefined>(undefined)

  function debounced(...args: Parameters<T>) {
    if (timer.current) {
      clearTimeout(timer.current)
    }
    timer.current = window.setTimeout(() => {
      fn(...args)
    }, delay)
  }

  return debounced as T
}
