import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/auth'
import toast from 'react-hot-toast'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Gözləyir',
  confirmed: 'Təsdiqləndi',
  preparing: 'Hazırlanır',
  ready: 'Hazırdır',
  in_delivery: 'Yoldadır',
  delivered: 'Çatdırıldı',
  picked_up: 'Götürüldü',
  cancelled: 'Ləğv edildi',
}

export function useOrderUpdates() {
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!isAuthenticated) return

    const token = localStorage.getItem('access_token')
    if (!token) return

    const wsUrl = `ws://localhost:8001/ws/orders/?token=${token}`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => console.log('[WS] Connected to order updates')

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'order_update') {
          // Invalidate all relevant queries
          queryClient.invalidateQueries({ queryKey: ['orders'] })
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
          queryClient.invalidateQueries({ queryKey: ['order-stats'] })
          queryClient.invalidateQueries({ queryKey: ['seller-dashboard'] })
          queryClient.invalidateQueries({ queryKey: ['courier-all-orders'] })
          queryClient.invalidateQueries({ queryKey: ['warehouse-orders'] })

          // Show toast
          const statusLabel = STATUS_LABELS[data.status] || data.status
          toast(`#${data.tracking_code} → ${statusLabel}`, {
            icon: '📦',
            duration: 3000,
          })
        }
      } catch (e) {
        console.error('[WS] Parse error', e)
      }
    }

    ws.onerror = (e) => console.warn('[WS] Error', e)

    ws.onclose = () => {
      console.log('[WS] Disconnected')
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CLOSED) {
          // Component will remount reconnection via useEffect cleanup/re-run
        }
      }, 5000)
    }

    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [isAuthenticated, queryClient])
}
