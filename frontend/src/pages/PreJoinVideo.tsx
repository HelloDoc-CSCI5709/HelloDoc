import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCreateRoom, useGetRoomToken } from '../redux/hooks'
import { Mic, MicOff, Video, VideoOff } from 'lucide-react'

const PreJoinPage: React.FC = () => {
  const { appointmentId } = useParams<Record<string, string | undefined>>()
  const navigate = useNavigate()
  const createRoom = useCreateRoom()
  const getRoomToken = useGetRoomToken()

  if (!appointmentId) {
    return <p className="text-center text-red-500">Invalid appointment ID.</p>
  }

  const [micEnabled, setMicEnabled] = useState(true)
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleJoin = async () => {
    setError(null)
    setLoading(true)
    try {
      let result = await getRoomToken(appointmentId).unwrap()
      if (!result.roomId) {
        result = await createRoom(appointmentId).unwrap()
      }

      navigate(`/video/${appointmentId}/room/${result.roomId}`, {
        state: { mic: micEnabled, camera: cameraEnabled },
      })
    } catch (err: any) {
      if (err === 'Video room not found' || err?.message?.includes('not found')) {
        try {
          const newRoom = await createRoom(appointmentId).unwrap()
          navigate(`/video/${appointmentId}/room/${newRoom.roomId}`, {
            state: { mic: micEnabled, camera: cameraEnabled },
          })
          return
        } catch (createErr: any) {
          setError(createErr)
        }
      } else {
        setError(err)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-semibold text-center mb-6">Prepare to Join</h2>
        <p className="text-center text-gray-600 mb-8">Enable your camera and microphone</p>

        <div className="flex justify-around mb-8">
          <button
            onClick={() => setCameraEnabled(prev => !prev)}
            className={`p-4 rounded-full transition focus:outline-none ${
              cameraEnabled ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            {cameraEnabled ? (
              <Video className="w-8 h-8 text-green-500" />
            ) : (
              <VideoOff className="w-8 h-8 text-red-500" />
            )}
          </button>

          <button
            onClick={() => setMicEnabled(prev => !prev)}
            className={`p-4 rounded-full transition focus:outline-none ${
              micEnabled ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            {micEnabled ? (
              <Mic className="w-8 h-8 text-green-500" />
            ) : (
              <MicOff className="w-8 h-8 text-red-500" />
            )}
          </button>
        </div>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <button
          onClick={handleJoin}
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? 'Joining...' : 'Join Call'}
        </button>
      </div>
    </div>
  )
}

export default PreJoinPage
