import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react'
import { useLogStart, useLogEnd } from '../redux/hooks'

const VideoCallPage: React.FC = () => {
  const params = useParams<Record<string, string | undefined>>()
  const appointmentId = params.appointmentId
  const roomId        = params.roomId

  const navigate = useNavigate()
  const logStart = useLogStart()
  const logEnd   = useLogEnd()

  const [micEnabled, setMicEnabled]       = useState(true)
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [logId, setLogId]                 = useState<string | null>(null)

  if (!appointmentId || !roomId) {
    return <p className="text-center text-red-500">Invalid room or appointment ID.</p>
  }

  useEffect(() => {
    logStart(appointmentId, roomId)
      .unwrap()
      .then(res => setLogId(res.logId))
      .catch(err => console.error('Log start failed:', err))
  }, [appointmentId, roomId, logStart])

  const handleToggleCamera = () => setCameraEnabled(prev => !prev)
  const handleToggleMic    = () => setMicEnabled(prev => !prev)

  const handleLeave = async () => {
    if (logId) {
      try {
        await logEnd(logId).unwrap()
      } catch (err) {
        console.error('Log end failed:', err)
      }
    }
    navigate(-1)
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="flex-grow flex items-center justify-center text-white">
        <p>Video Stream Here</p>
      </div>

      <div className="bg-gray-800 p-4 flex justify-center space-x-6">
        <button
          onClick={handleToggleCamera}
          className="p-4 bg-white bg-opacity-30 hover:bg-opacity-50 rounded-full focus:outline-none"
        >
          {cameraEnabled ? (
            <Video className="w-6 h-6 text-white" />
          ) : (
            <VideoOff className="w-6 h-6 text-red-500" />
          )}
        </button>

        <button
          onClick={handleToggleMic}
          className="p-4 bg-white bg-opacity-30 hover:bg-opacity-50 rounded-full focus:outline-none"
        >
          {micEnabled ? (
            <Mic className="w-6 h-6 text-white" />
          ) : (
            <MicOff className="w-6 h-6 text-red-500" />
          )}
        </button>
        <button
          onClick={handleLeave}
          className="p-4 bg-red-600 hover:bg-red-700 rounded-full focus:outline-none"
        >
          <PhoneOff className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  )
}

export default VideoCallPage
