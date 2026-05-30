/**
 * Cliente STOMP minimal sobre WebSocket nativo del browser.
 * No requiere ninguna dependencia externa — usa la API WebSocket estándar.
 *
 * STOMP es un protocolo de texto simple:
 *   CONNECT\n...\n\n\0  →  servidor responde CONNECTED
 *   SUBSCRIBE\ndestination:/topic/...\nid:sub-N\n\n\0
 *   SERVER MESSAGE\ndestination:...\n\n{json}\0
 */

const WS_URL =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8080/ws')
    : null

// ── Tipos internos ──────────────────────────────────────────────────────────

type Callback<T> = (data: T) => void

interface Subscription {
  id: string
  destination: string
  callback: Callback<unknown>
}

// ── Estado singleton ────────────────────────────────────────────────────────

let ws: WebSocket | null = null
let connected = false
let subCounter = 0
const subscriptions = new Map<string, Subscription>()
const pendingSubs: Subscription[] = []

// ── Utilidades STOMP ────────────────────────────────────────────────────────

function stompFrame(command: string, headers: Record<string, string>, body = ''): string {
  const h = Object.entries(headers)
    .map(([k, v]) => `${k}:${v}`)
    .join('\n')
  return `${command}\n${h}\n\n${body}\0`
}

function parseFrame(raw: string): { command: string; headers: Record<string, string>; body: string } {
  const nullIdx = raw.indexOf('\0')
  const text = nullIdx >= 0 ? raw.slice(0, nullIdx) : raw
  const lines = text.split('\n')
  const command = lines[0].trim()
  const headers: Record<string, string> = {}
  let i = 1
  while (i < lines.length && lines[i].trim() !== '') {
    const colon = lines[i].indexOf(':')
    if (colon > 0) headers[lines[i].slice(0, colon).trim()] = lines[i].slice(colon + 1).trim()
    i++
  }
  const body = lines.slice(i + 1).join('\n').trim()
  return { command, headers, body }
}

// ── Conexión ────────────────────────────────────────────────────────────────

function connect() {
  if (!WS_URL || ws) return

  ws = new WebSocket(WS_URL)

  ws.onopen = () => {
    ws!.send(stompFrame('CONNECT', { 'accept-version': '1.2', 'heart-beat': '0,0' }))
  }

  ws.onmessage = (event) => {
    const frame = parseFrame(event.data as string)

    if (frame.command === 'CONNECTED') {
      connected = true
      // Suscribir los que estaban esperando
      for (const sub of pendingSubs) {
        doSubscribe(sub)
      }
      pendingSubs.length = 0
      return
    }

    if (frame.command === 'MESSAGE') {
      const dest = frame.headers['destination']
      for (const sub of subscriptions.values()) {
        if (sub.destination === dest) {
          try {
            sub.callback(frame.body ? JSON.parse(frame.body) : null)
          } catch {
            // body no parseable
          }
        }
      }
    }
  }

  ws.onclose = () => {
    connected = false
    ws = null
    // Reconectar después de 5s
    setTimeout(connect, 5000)
  }

  ws.onerror = () => {
    ws?.close()
  }
}

function doSubscribe(sub: Subscription) {
  subscriptions.set(sub.id, sub)
  ws!.send(
    stompFrame('SUBSCRIBE', { destination: sub.destination, id: sub.id, ack: 'auto' })
  )
}

// ── API pública ─────────────────────────────────────────────────────────────

/**
 * Suscribe a un topic STOMP.
 * Retorna una función de cleanup que cancela la suscripción.
 */
export function subscribeToTopic<T>(
  destination: string,
  callback: Callback<T>
): () => void {
  if (typeof window === 'undefined') return () => {}

  // Conectar si aún no hay cliente
  if (!ws) connect()

  const id = `sub-${subCounter++}`
  const sub: Subscription = { id, destination, callback: callback as Callback<unknown> }

  if (connected && ws) {
    doSubscribe(sub)
  } else {
    pendingSubs.push(sub)
  }

  return () => {
    subscriptions.delete(id)
    if (connected && ws) {
      ws.send(stompFrame('UNSUBSCRIBE', { id }))
    }
  }
}

/** Cierra la conexión (útil al destruir la app) */
export function disconnectStomp(): void {
  ws?.close()
  ws = null
  connected = false
  subscriptions.clear()
  pendingSubs.length = 0
}
