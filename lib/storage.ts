export interface Connection {
  consumerNo: string
  name: string
  type?: string
  balance?: number
  address?: string
}

export interface UserSession {
  email: string
  name?: string
}

export interface ProfileUpdates {
  mobile?: string
  email?: string
}

export const DEFAULT_CONNECTIONS: Connection[] = [
  { consumerNo: "KPDCL-2024-001", name: "Mohammad Irfan", type: "Domestic", balance: 500, address: "House No. 42, Colony Road, Srinagar" },
  { consumerNo: "KPDCL-2024-002", name: "Fatima Begum", type: "Commercial", balance: 0, address: "Shop No. 12, Main Bazaar, Anantnag" },
]

export const STORAGE_KEYS = {
  LINKED_CONSUMERS: "kpdcl_linked_consumers",
  USER_SESSION: "kpdcl_user_session",
  PROFILE_UPDATES_PREFIX: "kpdcl_profile_updates_",
} as const

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

export function dispatchStorageEvent(): void {
  if (isBrowser()) {
    window.dispatchEvent(new Event("storage"))
  }
}

/**
 * Retrieves linked connections from localStorage.
 * Returns null if the key has NEVER been set (caller should fall back to default connections).
 * Returns an array (even if empty []) when the user explicitly modified or cleared connections.
 */
export function getStoredConnections(): Connection[] | null {
  if (!isBrowser()) return null
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LINKED_CONSUMERS)
    if (raw === null) return null
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed.map((item: Connection) => {
        const def = DEFAULT_CONNECTIONS.find(d => d.consumerNo.toLowerCase() === item.consumerNo?.toLowerCase())
        return {
          ...item,
          address: item.address || def?.address || "Srinagar, J&K",
        }
      })
    }
    return null
  } catch (err) {
    console.error("Failed to read connections from localStorage:", err)
    return null
  }
}

export function setStoredConnections(connections: Connection[]): void {
  if (!isBrowser()) return
  try {
    localStorage.setItem(STORAGE_KEYS.LINKED_CONSUMERS, JSON.stringify(connections))
    dispatchStorageEvent()
  } catch (err) {
    console.error("Failed to save connections to localStorage:", err)
  }
}

export function getStoredSession(): UserSession | null {
  if (!isBrowser()) return null
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_SESSION)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (err) {
    console.error("Failed to read user session from localStorage:", err)
    return null
  }
}

export function setStoredSession(session: UserSession): void {
  if (!isBrowser()) return
  try {
    localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(session))
    dispatchStorageEvent()
  } catch (err) {
    console.error("Failed to save user session to localStorage:", err)
  }
}

export function clearStoredSession(): void {
  if (!isBrowser()) return
  try {
    localStorage.removeItem(STORAGE_KEYS.USER_SESSION)
    dispatchStorageEvent()
  } catch (err) {
    console.error("Failed to clear user session from localStorage:", err)
  }
}

export function getStoredProfileUpdates(consumerNo: string): ProfileUpdates | null {
  if (!isBrowser() || !consumerNo) return null
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.PROFILE_UPDATES_PREFIX}${consumerNo}`)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (err) {
    console.error("Failed to read profile updates from localStorage:", err)
    return null
  }
}

export function setStoredProfileUpdates(consumerNo: string, updates: ProfileUpdates): void {
  if (!isBrowser() || !consumerNo) return
  try {
    localStorage.setItem(`${STORAGE_KEYS.PROFILE_UPDATES_PREFIX}${consumerNo}`, JSON.stringify(updates))
    dispatchStorageEvent()
  } catch (err) {
    console.error("Failed to save profile updates to localStorage:", err)
  }
}

/**
 * Resets all demo data back to default:
 * - Restores DEFAULT_CONNECTIONS
 * - Clears all custom profile updates
 * - Dispatches storage event so all components/pages re-render in real time
 */
export function resetToDefaults(): void {
  if (!isBrowser()) return
  try {
    localStorage.setItem(STORAGE_KEYS.LINKED_CONSUMERS, JSON.stringify(DEFAULT_CONNECTIONS))
    
    // Clear custom profile updates
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(STORAGE_KEYS.PROFILE_UPDATES_PREFIX)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k))

    dispatchStorageEvent()
  } catch (err) {
    console.error("Failed to reset demo data to defaults:", err)
  }
}

