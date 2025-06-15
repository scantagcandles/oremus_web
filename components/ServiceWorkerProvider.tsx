"use client"
import { useEffect } from 'react'
import { useServiceWorkerRegistration } from '@/hooks/useServiceWorkerRegistration'

export default function ServiceWorkerProvider() {
  useServiceWorkerRegistration()
  return null
}