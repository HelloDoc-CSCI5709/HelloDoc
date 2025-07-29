// src/redux/reducers/videoReducer.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { VideoState, VideoRoom, VideoLog } from '../types/videoTypes'
import {
  createRoom,
  getRoomToken,
  logStart,
  logEnd,
  getLogs,
} from '../actions/videoActions'

const initialState: VideoState = {
  room: null,
  logs: [],
  loading: false,
  error: null,
}

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    resetVideoState(state) {
      state.room = null
      state.logs = []
      state.loading = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createRoom.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createRoom.fulfilled, (state, action: PayloadAction<VideoRoom>) => {
        state.loading = false
        state.room = action.payload
      })
      .addCase(createRoom.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to create room'
      })
      .addCase(getRoomToken.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getRoomToken.fulfilled, (state, action: PayloadAction<VideoRoom>) => {
        state.loading = false
        state.room = action.payload
      })
      .addCase(getRoomToken.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to fetch token'
      })
      .addCase(logStart.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(logStart.fulfilled, (state, action: PayloadAction<VideoLog>) => {
        state.loading = false
        state.logs.push(action.payload)
      })
      .addCase(logStart.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to start log'
      })
      .addCase(logEnd.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(logEnd.fulfilled, (state, action: PayloadAction<VideoLog>) => {
        state.loading = false
        const idx = state.logs.findIndex((l) => l.logId === action.payload.logId)
        if (idx !== -1) state.logs[idx] = action.payload
      })
      .addCase(logEnd.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to end log'
      })

      .addCase(getLogs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getLogs.fulfilled, (state, action: PayloadAction<VideoLog[]>) => {
        state.loading = false
        state.logs = action.payload
      })
      .addCase(getLogs.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false
        state.error = action.payload ?? 'Failed to fetch logs'
      })
  },
})

export const { resetVideoState } = videoSlice.actions
export default videoSlice.reducer
