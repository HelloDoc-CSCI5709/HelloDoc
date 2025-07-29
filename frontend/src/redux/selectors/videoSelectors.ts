import type { VideoState } from '../types/videoTypes'

export const selectVideoRoom = (state: { video: VideoState }) => state.video.room
export const selectVideoLogs = (state: { video: VideoState }) => state.video.logs
export const selectVideoLoading = (state: { video: VideoState }) => state.video.loading
export const selectVideoError = (state: { video: VideoState }) => state.video.error
