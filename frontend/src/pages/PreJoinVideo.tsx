import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCreateRoom, useGetRoomToken } from '../redux/hooks'
import { Mic, MicOff, Video, VideoOff, Phone, Monitor } from 'lucide-react'

interface NavigationState {
  mic: boolean
  camera: boolean
  fromPreJoin?: boolean
}

const PreJoinPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId?: string }>()
  const navigate = useNavigate()
  const createRoom = useCreateRoom()
  const getRoomToken = useGetRoomToken()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [micEnabled, setMicEnabled] = useState(true)
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewReady, setPreviewReady] = useState(false)

  // Cleanup function
  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }, [])

  // Initialize camera preview
  const initializePreview = useCallback(async () => {
    if (!appointmentId) return
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: true
      })
      
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setPreviewReady(true)
      }
    } catch (err) {
      console.error('Failed to access camera:', err)
      setError('Unable to access camera and microphone')
    }
  }, [appointmentId])

  const toggleCamera = useCallback(() => {
    setCameraEnabled(prev => !prev)
  }, [])

  const toggleMic = useCallback(() => {
    setMicEnabled(prev => !prev)
  }, [])

  useEffect(() => {
    initializePreview()

    return cleanupStream
  }, [initializePreview, cleanupStream])

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = cameraEnabled
      })
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = micEnabled
      })
    }
  }, [cameraEnabled, micEnabled])

  if (!appointmentId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-pink-800">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl shadow-2xl">
          <p className="text-center text-red-400 text-xl">Invalid appointment ID.</p>
        </div>
      </div>
    )
  }

  const handleJoin = async () => {
    if (!appointmentId) return
    
    setError(null)
    setLoading(true)

    cleanupStream()

    try {
      let result = await getRoomToken(appointmentId).unwrap()
      if (!result.roomId) {
        result = await createRoom(appointmentId).unwrap()
      }

      const navigationState: NavigationState = { 
        mic: micEnabled, 
        camera: cameraEnabled,
        fromPreJoin: true
      }

      navigate(`/video/${appointmentId}/room/${result.roomId}`, {
        state: navigationState,
      })
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'message' in err 
        ? (err as { message: string }).message 
        : String(err)

      if (errorMessage === 'Video room not found' || errorMessage.includes('not found')) {
        try {
          const newRoom = await createRoom(appointmentId).unwrap()
          const navigationState: NavigationState = { 
            mic: micEnabled, 
            camera: cameraEnabled
          }

          navigate(`/video/${appointmentId}/room/${newRoom.roomId}`, {
            state: navigationState,
          })
          return
        } catch (createErr: unknown) {
          const createErrorMessage = createErr && typeof createErr === 'object' && 'message' in createErr 
            ? (createErr as { message: string }).message 
            : 'Failed to create room'
          setError(createErrorMessage)
        }
      } else {
        console.error('Join call error:', err)
        setError(errorMessage || 'Failed to join call')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 bg-white/80 backdrop-blur-md border border-blue-200/50 p-8 rounded-3xl shadow-2xl max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
            <Phone className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Ready to Join?</h1>
          <p className="text-blue-700">Check your camera and microphone settings</p>
        </div>

        <div className="relative mb-8 rounded-2xl overflow-hidden bg-blue-900 aspect-video">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform scale-x-[-1]"
            style={{ display: previewReady && cameraEnabled ? 'block' : 'none' }}
          />

          {!cameraEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-900/90">
              <div className="text-center">
                <VideoOff className="w-16 h-16 text-blue-300 mx-auto mb-2" />
                <p className="text-blue-200">Camera is off</p>
              </div>
            </div>
          )}

          {!previewReady && cameraEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-900/90">
              <div className="text-center">
                <Monitor className="w-16 h-16 text-blue-300 mx-auto mb-2 animate-pulse" />
                <p className="text-blue-200">Starting camera...</p>
              </div>
            </div>
          )}

          <div className="absolute top-4 right-4">
            <div className={`p-2 rounded-full ${micEnabled ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {micEnabled ? (
                <Mic className="w-4 h-4 text-green-400" />
              ) : (
                <MicOff className="w-4 h-4 text-red-400" />
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center space-x-6 mb-8">
          <button
            type="button"
            onClick={toggleCamera}
            className={`group p-4 rounded-full transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300/50 ${
              cameraEnabled 
                ? 'bg-blue-100 hover:bg-blue-200 border-2 border-blue-300' 
                : 'bg-red-500 hover:bg-red-600 border-2 border-red-400'
            }`}
          >
            {cameraEnabled ? (
              <Video className="w-6 h-6 text-blue-600 group-hover:text-blue-700" />
            ) : (
              <VideoOff className="w-6 h-6 text-white" />
            )}
          </button>

          <button
            type="button"
            onClick={toggleMic}
            className={`group p-4 rounded-full transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300/50 ${
              micEnabled 
                ? 'bg-blue-100 hover:bg-blue-200 border-2 border-blue-300' 
                : 'bg-red-500 hover:bg-red-600 border-2 border-red-400'
            }`}
          >
            {micEnabled ? (
              <Mic className="w-6 h-6 text-blue-600 group-hover:text-blue-700" />
            ) : (
              <MicOff className="w-6 h-6 text-white" />
            )}
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${cameraEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-blue-700">Camera</span>
            </div>
            <span className="text-blue-900 font-medium">{cameraEnabled ? 'On' : 'Off'}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${micEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-blue-700">Microphone</span>
            </div>
            <span className="text-blue-900 font-medium">{micEnabled ? 'On' : 'Off'}</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700 text-center text-sm">{error}</p>
          </div>
        )}

        <button
          type="button"
          onClick={handleJoin}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300/50 disabled:transform-none disabled:opacity-50 shadow-lg"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Joining...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Phone className="w-5 h-5" />
              <span>Join Call</span>
            </div>
          )}
        </button>

        <p className="text-center text-blue-600 text-xs mt-6">
          Make sure you&apos;re in a quiet environment with good lighting
        </p>
      </div>
    </div>
  )
}

export default PreJoinPage