'use client'

import { useEffect, useState } from 'react'
import { subscribeToTopic } from '@/services/websocket'
import type { MatchEvent } from '@/types'

/**
 * Se suscribe al canal WebSocket `/topic/matches/{matchId}/events`.
 * El backend publica MatchEvent (goles, tarjetas, sustituciones, VAR) cada ~15s.
 * Deduplica eventos por type+minute+teamId igual que el backend con Caffeine.
 */
export function useMatchEvents(matchId: number | null): MatchEvent[] {
  const [events, setEvents] = useState<MatchEvent[]>([])

  useEffect(() => {
    if (!matchId) return
    setEvents([])

    const unsubscribe = subscribeToTopic<MatchEvent>(
      `/topic/matches/${matchId}/events`,
      (event) => {
        setEvents((prev) => {
          const isDuplicate = prev.some(
            (e) =>
              e.type === event.type &&
              e.minute === event.minute &&
              e.teamId === event.teamId
          )
          return isDuplicate ? prev : [...prev, event]
        })
      }
    )

    return unsubscribe
  }, [matchId])

  return events
}
