'use client'

/**
 * GoalCelebrationProvider
 *
 * Provider global montado en LocaleClientLayout.
 * - Carga los equipos favoritos del usuario autenticado.
 * - Detecta qué partidos están LIVE y se suscribe a su canal WebSocket de eventos.
 * - Cuando llega un evento GOAL para un equipo favorito → dispara la animación.
 * - Si el usuario no tiene favoritos configurados → muestra goles de todos los partidos.
 * - Se refresca automáticamente cada 90 s por si un partido pasa a LIVE.
 */

import {
  createContext, useContext, useState,
  useEffect, useRef, type ReactNode,
} from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { favoriteTeamsService } from '@/services/favoriteTeams'
import { getAllFixtures } from '@/services/publicTournament'
import { subscribeToTopic } from '@/services/websocket'
import { GoalCelebration, type GoalInfo } from '@/components/GoalCelebration'
import type { MatchEvent } from '@/types'

const GoalCelebrationContext = createContext<null>(null)

export function GoalCelebrationProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [goal, setGoal] = useState<GoalInfo | null>(null)

  // Refs — no necesitan re-render al cambiar
  const favoriteTeamIds = useRef<Set<number>>(new Set())
  const subscriptions   = useRef<Map<number, () => void>>(new Map())
  const clearTimer      = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Cargar equipos favoritos ──────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !user) {
      favoriteTeamIds.current = new Set()
      return
    }
    favoriteTeamsService.list(user.id)
      .then((teams: any[]) => {
        favoriteTeamIds.current = new Set(teams.map(t => Number(t.teamId)))
      })
      .catch(() => {})
  }, [isAuthenticated, user?.id])

  // ── Suscribirse a eventos de partidos en vivo ─────────────────────────────
  useEffect(() => {
    let mounted = true

    const syncLive = async () => {
      try {
        const fixtures: any[] = await getAllFixtures()
        if (!mounted) return

        const live    = fixtures.filter(f => f.status === 'LIVE')
        const liveIds = new Set(live.map((f: any) => f.id as number))

        // Desuscribir partidos que ya no están LIVE
        subscriptions.current.forEach((unsub, id) => {
          if (!liveIds.has(id)) { unsub(); subscriptions.current.delete(id) }
        })

        // Suscribir nuevos partidos LIVE
        live.forEach((fixture: any) => {
          if (subscriptions.current.has(fixture.id)) return

          const unsub = subscribeToTopic<MatchEvent>(
            `/topic/matches/${fixture.id}/events`,
            (ev) => {
              // Solo goles
              if (ev.type !== 'GOAL' && ev.type !== 'OWN_GOAL' && ev.type !== 'PENALTY_GOAL') return
              // Sin nombre no mostramos nada (dato incompleto)
              if (!ev.playerName) return

              const favs   = favoriteTeamIds.current
              const isFav  = ev.teamId !== null && ev.teamId !== undefined
                              && favs.has(Number(ev.teamId))

              // Si el usuario tiene favoritos y este no es uno → ignorar
              if (!isFav && favs.size > 0) return

              const homeCode = fixture.homeTeam?.fifaCode
                ?? fixture.homeTeam?.shortName
                ?? fixture.homeTeam?.name
                ?? '?'
              const awayCode = fixture.awayTeam?.fifaCode
                ?? fixture.awayTeam?.shortName
                ?? fixture.awayTeam?.name
                ?? '?'

              if (clearTimer.current) clearTimeout(clearTimer.current)

              setGoal({
                playerName:     ev.playerName,
                teamFifaCode:   ev.teamFifaCode ?? null,
                minute:         ev.minute ?? null,
                matchLabel:     `${homeCode} vs ${awayCode}`,
                isFavoriteTeam: isFav,
              })

              clearTimer.current = setTimeout(() => setGoal(null), 7_000)
            }
          )

          subscriptions.current.set(fixture.id, unsub)
        })
      } catch {
        // silencioso — red o API caída no rompe la app
      }
    }

    syncLive()
    // Re-evalúa qué partidos están LIVE cada 90 s
    const interval = setInterval(syncLive, 90_000)

    return () => {
      mounted = false
      clearInterval(interval)
      subscriptions.current.forEach(unsub => unsub())
      subscriptions.current.clear()
      if (clearTimer.current) clearTimeout(clearTimer.current)
    }
  }, [])  // solo al montar/desmontar el layout

  return (
    <GoalCelebrationContext.Provider value={null}>
      {children}
      <GoalCelebration goal={goal} />
    </GoalCelebrationContext.Provider>
  )
}

export const useGoalCelebration = () => useContext(GoalCelebrationContext)
