import { useState, useEffect } from 'react'
import api from '../utils/api'

export function useIssuer(address) {
  const [status, setStatus] = useState(null) // null | 'none' | 'pending' | 'approved'
  const [loading, setLoading] = useState(false)

  const checkStatus = async () => {
    if (!address) return
    setLoading(true)
    try {
      // Check blockchain approval first
      const { data } = await api.get(`/issuer/status/${address}`)
      if (data.success && data.approved) {
        setStatus('approved')
        return
      }
      // Check if pending in DB for this specific wallet only
      const { data: issuerData } = await api.get(`/issuer/check/${address}`)
      setStatus(issuerData.exists ? 'pending' : 'none')
    } catch {
      setStatus('none')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [address])

  return { status, loading, refetch: checkStatus }
}
