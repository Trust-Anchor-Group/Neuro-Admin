'use client'

import { useEffect } from 'react'
import { getClientId } from '@/utils/getClientId'

export default function BrandProvider() {
  useEffect(() => {
    const clientId = getClientId()
    if (clientId) {
      document.documentElement.classList.add(clientId)
    }
  }, [])

  return null
}
