'use client'

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { subscribeToTopic } from '@/services/websocket'
import type { MatchLiveDelta } from '@/types'
import { QUERY_KEYS } from './useTournamentData'

/**
 * Se suscribe al canal WebSocket `/topic/matches/{matchId}/live`.
 * El backend publica un MatchLiveDelta cada ~5s cuando el partido está en vivo.
 * Además actualiza el caché de TanStack Query para que el detalle del partido
 * refleje el marcador en tiempo real sin re-fetch HTTP.
 */
export function useMatchLive(matchId: number | null): MatchLiveDelta | null {
  const queryClient = useQueryClient()
  const [liveDelta, setLiveDelta] = useState<MatchLiveDelta | null>(null)

  useEffect(() => {
    if (!matchId) return

    const unsubscribe = subscribeToTopic<MatchLiveDelta>(
      `/topic/matches/${matchId}/live`,
      (delta) => {
        setLiveDelta(delta)

        // Actualiza el caché del fixture en tiempo real
        queryClient.setQueryData(
          QUERY_KEYS.fixtureById(matchId),
          (old: any) =>
            old
              ? {
                  ...old,
                  homeScore: delta.homeScore,
                  awayScore: delta.awayScore,
                  status: delta.status,
                }
              : old
        )

        // También actualiza la lista de fixtures en vivo
        queryClient.setQueryData(
          QUERY_KEYS.fixturesLive,
          (old: any[]) =>
            Array.isArray(old)
              ? old.map((f) =>
                  f.id === matchId
                    ? { ...f, homeScore: delta.homeScore, awayScore: delta.awayScore, status: delta.status }
                    : f
                )
              : old
        )
      }
    )

    return unsubscribe
  }, [matchId, queryClient])

  return liveDelta
}
