import { createAsyncThunk } from '@reduxjs/toolkit'
import type { VideoRoom, VideoLog } from '../types/videoTypes'
import type { ApiResponse }         from '../types/appointmentTypes'  // re‑use your generic

declare type RequestInit = globalThis.RequestInit

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_BASE_URL}/api`

interface ErrorResponse {
  message: string
  [key: string]: unknown
}

const fetchWithAuth = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = localStorage.getItem('accessToken')
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  })
  if (!response.ok) {
    const errorData: ErrorResponse = await response.json()
    throw new Error(errorData.message || 'Request failed')
  }
  return response.json()
}

// ── Create Room ─────────────────────────────────────────────────────────────
export const createRoom = createAsyncThunk<
  VideoRoom,
  { appointmentId: string; expiresInMinutes?: number },
  { rejectValue: string }
>(
  'video/createRoom',
  async ({ appointmentId, expiresInMinutes = 60 }, { rejectWithValue }) => {
    try {
      const res = await fetchWithAuth<VideoRoom>('/video/room', {
        method: 'POST',
        body: JSON.stringify({ appointmentId, expiresInMinutes }),
      })
      return res.body
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Unknown error')
    }
  }
)

// ── Get Room Token ──────────────────────────────────────────────────────────
export const getRoomToken = createAsyncThunk<
  VideoRoom,
  string,
  { rejectValue: string }
>(
  'video/getRoomToken',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const res = await fetchWithAuth<VideoRoom>(`/video/token/${appointmentId}`)
      return res.body
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Unknown error')
    }
  }
)

// ── Log Start ────────────────────────────────────────────────────────────────
export const logStart = createAsyncThunk<
  VideoLog,
  { appointmentId: string; roomId: string },
  { rejectValue: string }
>(
  'video/logStart',
  async ({ appointmentId, roomId }, { rejectWithValue }) => {
    try {
      console.log(appointmentId)
      const res = await fetchWithAuth<VideoLog>('/video/logs/start', {
        method: 'POST',
        body: JSON.stringify({ appointmentId, roomId }),
      })
      return res.body
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Unknown error')
    }
  }
)

// ── Log End ──────────────────────────────────────────────────────────────────
export const logEnd = createAsyncThunk<
  VideoLog,
  string,
  { rejectValue: string }
>(
  'video/logEnd',
  async (logId, { rejectWithValue }) => {
    try {
      const res = await fetchWithAuth<VideoLog>('/video/logs/end', {
        method: 'PUT',
        body: JSON.stringify({ logId }),
      })
      return res.body
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Unknown error')
    }
  }
)

// ── Get Logs ─────────────────────────────────────────────────────────────────
export const getLogs = createAsyncThunk<
  VideoLog[],
  string,
  { rejectValue: string }
>(
  'video/getLogs',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const res = await fetchWithAuth<VideoLog[]>(`/video/logs/${appointmentId}`)
      return res.body
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Unknown error')
    }
  }
)
