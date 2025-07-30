import React, {
  useState,
  useEffect,
  useRef,
  useCallback
} from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff
} from 'lucide-react';
import { useLogStart, useLogEnd } from '../redux/hooks';

const SOCKET_URL = `${import.meta.env.VITE_BACKEND_BASE_URL}/video`;

interface NavigationState {
  mic?: boolean;
  camera?: boolean;
}

interface Participant {
  socketId: string;
  userId: string;
  userRole: string;
  isDoctor: boolean;
  isPatient: boolean;
}

interface OfferPayload {
  offer: RTCSessionDescriptionInit;
  from?: string;
}

interface AnswerPayload {
  answer: RTCSessionDescriptionInit;
  from?: string;
}

interface IceCandidatePayload {
  candidate: RTCIceCandidateInit;
  from?: string;
}

interface JoinRoomResponse {
  error?: string;
  isInitiator: boolean;
  userId: string;
  userRole: string;
  isDoctor: boolean;
  isPatient: boolean;
  participantCount?: number;
}

const VideoCallPage: React.FC = () => {
  const { appointmentId, roomId } = useParams<{
    appointmentId: string;
    roomId: string;
  }>();

  const navigate = useNavigate();
  const location = useLocation();
  const startLog = useLogStart();
  const endLog = useLogEnd();

  const navigationState = location.state as NavigationState;

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);
  
  const streamRef = useRef<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const makingOfferRef = useRef(false);
  const isInitiatorRef = useRef(false);
  const politeRef = useRef(false);

  const localReadyRef = useRef(false);
  const remoteReadyRef = useRef(false);

  const [micEnabled, setMicEnabled] = useState(navigationState?.mic ?? true);
  const [cameraEnabled, setCameraEnabled] = useState(navigationState?.camera ?? true);

  const [connectionStatus, setConnectionStatus] = useState('Initializing…');
  
  const [localUser, setLocalUser] = useState<Participant | null>(null);
  const [remoteUser, setRemoteUser] = useState<Participant | null>(null);

  const [userRole, setUserRole] = useState<'host' | 'guest' | null>(null);
  const [participantCount, setParticipantCount] = useState<number>(0);
  
  const [logId, setLogId] = useState<string | null>(null);
  
  const didSetupRef = useRef(false);

  // Move all hooks before any conditional returns
  const cleanupAll = useCallback(() => {
    if (pcRef.current) {
        pcRef.current.ontrack = null;
        pcRef.current.onicecandidate = null;
        pcRef.current.onnegotiationneeded = null;
        pcRef.current.onconnectionstatechange = null;
        pcRef.current.close();
        pcRef.current = null;
    }

    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }

    setRemoteStream(null);

    if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
    }

    localReadyRef.current = false;
    remoteReadyRef.current = false;
    makingOfferRef.current = false;
    isInitiatorRef.current = false;
    politeRef.current = false;
    setLocalUser(null);
    setRemoteUser(null);
    setUserRole(null);
    setParticipantCount(0);
    setConnectionStatus('Call ended');
  }, []);

  const initializeMedia = useCallback(async (): Promise<MediaStream | null> => {
    console.log('initializeMedia');
    setConnectionStatus('Getting camera & mic…');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      streamRef.current = stream;
      
      stream.getAudioTracks().forEach(track => {
        track.enabled = navigationState?.mic ?? true;
        console.log(`Audio track initialized as ${track.enabled ? 'enabled' : 'disabled'}`);
      });
      
      stream.getVideoTracks().forEach(track => {
        track.enabled = navigationState?.camera ?? true;
        console.log(`Video track initialized as ${track.enabled ? 'enabled' : 'disabled'}`);
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setConnectionStatus('Media ready');
      return stream;
    } catch (err) {
      console.error('Media initialization error:', err);
      setConnectionStatus('Error: Cannot access camera/mic');
      return null;
    }
    
  }, [navigationState?.mic, navigationState?.camera]);

  const createOfferManually = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) {
      console.log('No peer connection available for manual offer');
      return;
    }

    if (pc.signalingState !== 'stable' || makingOfferRef.current) {
      console.log('Cannot create manual offer right now, signalingState:', pc.signalingState);
      return;
    }

    try {
      makingOfferRef.current = true;
      console.log('Creating manual offer...');
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await pc.setLocalDescription(offer);

      if (socketRef.current && pc.localDescription) {
        socketRef.current.emit('video:offer', {
          offer: pc.localDescription
        });
        console.log('Manual offer sent');
        setConnectionStatus('Offer sent…');
      }
    } catch (e) {
      console.error('Manual offer error:', e);
    } finally {
      makingOfferRef.current = false;
    }
  }, []);

  const createPeerConnection = useCallback(() => {
    console.log('createPeerConnection - cleaning up existing connection first');

    if (pcRef.current) {
      pcRef.current.ontrack = null;
      pcRef.current.onicecandidate = null;
      pcRef.current.onnegotiationneeded = null;
      pcRef.current.onconnectionstatechange = null;
      pcRef.current.close();
      pcRef.current = null;
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    });

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, streamRef.current!);
        console.log(`Added ${track.kind} track to peer connection`);
      });
    }
        
    pc.onnegotiationneeded = async () => {
      console.log(
        'onnegotiationneeded - isInitiator:',
        isInitiatorRef.current,
        'localReady:',
        localReadyRef.current,
        'remoteReady:',
        remoteReadyRef.current
      );

      if (
        isInitiatorRef.current &&
        localReadyRef.current &&
        remoteReadyRef.current &&
        !makingOfferRef.current &&
        socketRef.current?.connected
      ) {
        try {
          makingOfferRef.current = true;
          console.log('Creating offer...');
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          });
          await pc.setLocalDescription(offer);

          if (socketRef.current && pc.localDescription) {
            socketRef.current.emit('video:offer', {
              offer: pc.localDescription
            });
            console.log('Offer sent');
            setConnectionStatus('Offer sent…');
          }
        } catch (e) {
          console.error('Negotiation error:', e);
          setConnectionStatus('Error creating offer');
        } finally {
          makingOfferRef.current = false;
        }
      } else {
        console.log('⏸Skipping offer creation - conditions not met');
      }
    };

    pc.onicecandidate = e => {
      if (e.candidate && socketRef.current) {
        socketRef.current.emit('video:iceCandidate', {
          candidate: e.candidate
        });
      }
    };

    pc.ontrack = e => {
      console.log('ontrack - kind:', e.track.kind, 'streams:', e.streams.length);

      const [incomingStream] = e.streams;
      
      if (incomingStream) {
        console.log('Setting remote stream with tracks:', incomingStream.getTracks().map(t => t.kind));
        setRemoteStream(incomingStream);
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      console.log('Connection state:', state);
      if (state === 'connected') {
        setConnectionStatus('Connected – Call active');
      } else if (state === 'failed') {
        setConnectionStatus('Connection failed');
        setTimeout(() => {
          if (localReadyRef.current && remoteReadyRef.current) {
            console.log('Attempting to reconnect after connection failure');
            createPeerConnection();
            if (isInitiatorRef.current) {
              createOfferManually();
            }
          }
        }, 1000);
      } else if (state === 'disconnected') {
        setConnectionStatus('Connection disconnected');
      }
    };

    pcRef.current = pc;
    console.log('New peer connection created');
  }, [createOfferManually]);

  const initializeSocket = useCallback(() => {
    if (socketRef.current) {
      console.log('Socket already exists, cleaning up first');
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    console.log('initializeSocket');

    const socket = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('accessToken'),
        appointmentId,
        roomId
      },
      transports: ['websocket']
    });

    socket.on('connect', () => {
      console.log('socket connected', socket.id);
      socket.emit(
        'video:joinRoom',
        { appointmentId, roomId },
        async (res: JoinRoomResponse) => {
          console.log('🎬 joinRoom callback', res);
          
          if (res.error) {
            console.error('Failed to join room:', res.error);
            setConnectionStatus(`Error: ${res.error}`);
            return;
          }

          isInitiatorRef.current = res.isInitiator;
          politeRef.current = !res.isInitiator;
          setUserRole(res.isInitiator ? 'host' : 'guest');
          setParticipantCount(res.participantCount || 1);

          setLocalUser({
            socketId: socket.id!,
            userId: res.userId,
            userRole: res.userRole,
            isDoctor: res.isDoctor,
            isPatient: res.isPatient
          });

          try {
            if (appointmentId && roomId) {
              const log = await startLog(appointmentId, roomId).unwrap();
              setLogId(log.logId);
            } else {
              console.error('Log start failed: appointmentId or roomId is undefined');
            }
          } catch (err) {
            console.error('Log start failed:', err);
          }

          localReadyRef.current = true;
          console.log('Emitting ready signal');
          socket.emit('video:ready');

          createPeerConnection();

          if (res.isInitiator && remoteReadyRef.current) {
            console.log('Initiator creating initial offer');
            setTimeout(() => createOfferManually(), 100);
          }
        }
      );
    });

    socket.on('video:participantJoined', (p: Participant & { role?: string; isInitiator?: boolean }) => {
      console.log('peer joined', p);
      setRemoteUser(p);
      setParticipantCount(2);
      setConnectionStatus('Peer joined – negotiating…');
      
      remoteReadyRef.current = false;
      createPeerConnection();
    });

    socket.on('video:roleChanged', ({ newRole, isInitiator: newIsInitiator, reason }: { 
      newRole: 'host' | 'guest', 
      isInitiator: boolean,
      reason: string 
    }) => {
      console.log(`Role changed to ${newRole} (isInitiator: ${newIsInitiator}) - Reason: ${reason}`);
      
      isInitiatorRef.current = newIsInitiator;
      politeRef.current = !newIsInitiator;
      setUserRole(newRole);
      createPeerConnection();
      
      if (newRole === 'host') {
        setConnectionStatus('You are now the host');
        if (remoteReadyRef.current) {
          setTimeout(() => createOfferManually(), 100);
        }
      }
    });

    socket.on('video:roomUpdate', ({ participantCount: count }: { participantCount: number }) => {
      setParticipantCount(count);
      console.log(`Room update: ${count} participants`);
    });

    socket.on('room-full', ({ message }: { message: string }) => {
      setConnectionStatus(message);
      console.log('Room is full, redirecting...');
      setTimeout(() => navigate(-1), 3000);
    });

    socket.on('video:ready', ({ from }: { from?: string } = {}) => {
      console.log('Remote is ready, from:', from);
      remoteReadyRef.current = true;
      createPeerConnection();
      
      if (
        isInitiatorRef.current &&
        localReadyRef.current &&
        remoteReadyRef.current
      ) {
        console.log('Both ready – creating offer');
        setTimeout(() => createOfferManually(), 100);
      }
    });

    socket.on('video:offer', async ({ offer, from }: OfferPayload) => {
      if (from === socket.id) return;
      const pc = pcRef.current;
      if (!pc) {
        console.log('No peer connection available for offer');
        return;
      }

      const polite = politeRef.current;
      const collision = makingOfferRef.current || pc.signalingState !== 'stable';
      if (!polite && collision) {
        console.log('Ignoring offer (impolite & collision)');
        return;
      }

      try {
        console.log('Setting remote offer');
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        if (pc.signalingState === 'have-remote-offer') {
          console.log('Creating answer');
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('video:answer', { roomId, answer: pc.localDescription! });
          console.log('Answer sent');
        }
      } catch (e) {
        console.error('Offer handling error:', e);
      }
    });

    socket.on('video:answer', async ({ answer, from }: AnswerPayload) => {
      if (from === socket.id) return;
      const pc = pcRef.current;
      if (!pc || pc.signalingState !== 'have-local-offer') {
        console.log('Cannot handle answer, signalingState:', pc?.signalingState);
        return;
      }

      try {
        console.log('Setting remote answer');
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        setConnectionStatus('Connection established');
      } catch (e) {
        console.error('Answer handling error:', e);
      }
    });

    socket.on(
      'video:iceCandidate',
      async ({ candidate, from }: IceCandidatePayload) => {
        if (from === socket.id) return;
        const pc = pcRef.current;
        if (!pc) return;
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error('ICE error:', e);
        }
      }
    );

    socket.on('video:peerLeft', ({ reason, remainingParticipants }: { reason: string, remainingParticipants: number }) => {
      console.log('peer left, reason:', reason);

      remoteReadyRef.current = false;
      makingOfferRef.current = false;

      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }

      setRemoteUser(null);
      setRemoteStream(null);
      setParticipantCount(remainingParticipants);

      if (remainingParticipants === 1) {
        isInitiatorRef.current = true;
        politeRef.current = false;
        setUserRole('host');
        setConnectionStatus('Peer disconnected - You are now the host');
      } else {
        setConnectionStatus('Peer disconnected');
      }
    });

    socket.on('disconnect', () => {
      console.log('socket disconnected');
      cleanupAll();
    });

    socket.on('connect_error', err => {
      console.error('Socket error:', err);
      setConnectionStatus('Connection error');
    });

    socketRef.current = socket;
  }, [appointmentId, roomId, startLog, createPeerConnection, createOfferManually, navigate, cleanupAll]);

  const toggleMic = useCallback(() => {
    setMicEnabled(prev => {
      const newState = !prev;
      console.log(`Microphone ${newState ? 'unmuted' : 'muted'}`);

      if (socketRef.current) {
        socketRef.current.emit('video:micToggle', { 
          muted: !newState,
          from: socketRef.current.id 
        });
      }
      
      return newState;
    });
  }, []);

  const handleLeave = useCallback(async () => {
    if (logId) {
      try {
        await endLog(logId).unwrap();
      } catch (e) {
        console.error('End log failed:', e);
      }
    }
    cleanupAll();
    navigate(-1);
  }, [logId, endLog, navigate, cleanupAll]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      console.log('Setting remote stream to video element');
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (didSetupRef.current) return;
    didSetupRef.current = true;

    const setup = async () => {
      const media = await initializeMedia();
      if (media) {
        initializeSocket();
      }
    };
    setup();

    return () => {
      cleanupAll();
    };
  }, [initializeMedia, initializeSocket, cleanupAll]);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.muted = true;
    }
  }, []);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = micEnabled;
        console.log(`Audio track ${micEnabled ? 'enabled' : 'disabled'}`);
      });
    }
  }, [micEnabled]);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = cameraEnabled;
        console.log(`Video track ${cameraEnabled ? 'enabled' : 'disabled'}`);
      });
    }
  }, [cameraEnabled]);

  // Early return after all hooks are called
  if (!appointmentId || !roomId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-tr from-indigo-900 via-purple-900 to-pink-900">
        <p className="text-red-400 text-xl">
          Invalid room or appointment ID.
        </p>
      </div>
    );
  }

  const youLabel = localUser
    ? `You (${userRole?.toUpperCase() || 'Unknown'}) – ${
        localUser.isDoctor ? 'Doctor' : 'Patient'
      }`
    : 'You';
    
  const peerLabel = remoteUser
    ? `${remoteUser.isDoctor ? 'Doctor' : 'Patient'} (${
        userRole === 'host' ? 'GUEST' : 'HOST'
      })`
    : participantCount < 2 ? 'Waiting for peer…' : 'Peer connecting…';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-white flex flex-col items-center relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100/25 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <header className="relative z-10 w-full max-w-6xl p-6">
        <div className="bg-white/80 backdrop-blur-md border border-blue-200/50 rounded-2xl shadow-lg p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-blue-900 font-medium text-lg">{connectionStatus}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{participantCount}</span>
                </div>
              </div>
              <span className="text-blue-700 text-sm font-medium">
                Participants: {participantCount}/2
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-grow w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        <div className="group relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-900 to-blue-800 min-h-[300px] lg:min-h-[400px] transform transition-all duration-300 hover:scale-[1.02]">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform scale-x-[-1]"
            onLoadedMetadata={() =>
              console.log('Local video metadata loaded')
            }
            onPlay={() => console.log('Local video playing')}
          />

          <div className="absolute top-4 left-4 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg">
            <span className="text-blue-900 text-sm font-semibold">{youLabel}</span>
          </div>

          <div className="absolute top-4 right-4">
            <div className={`p-2 rounded-full ${cameraEnabled ? 'bg-green-500/20 border border-green-400/30' : 'bg-red-500/20 border border-red-400/30'} backdrop-blur-sm`}>
              {cameraEnabled ? (
                <Video className="w-4 h-4 text-green-600" />
              ) : (
                <VideoOff className="w-4 h-4 text-red-600" />
              )}
            </div>
          </div>

          {!cameraEnabled && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-800 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-4">
                  <VideoOff className="w-10 h-10 text-blue-200" />
                </div>
                <p className="text-blue-200 font-medium">Camera is off</p>
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        <div className="group relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-900 to-blue-800 min-h-[300px] lg:min-h-[400px] transform transition-all duration-300 hover:scale-[1.02]">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            controls={false}
            className="w-full h-full object-cover"
            style={{ display: remoteStream ? 'block' : 'none' }}
            onLoadedMetadata={() =>
              console.log('Remote video metadata loaded')
            }
            onPlay={() => console.log('Remote video playing')}
            onError={(e) => console.error('Remote video error:', e)}
          />

          <div className="absolute top-4 left-4 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg">
            <span className="text-blue-900 text-sm font-semibold">{peerLabel}</span>
          </div>

          {!remoteStream && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-800">
              <div className="text-center">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <VideoOff className="w-10 h-10 text-blue-200" />
                </div>
                <p className="text-blue-200 font-medium mb-2">Waiting for peer</p>
                <div className="flex justify-center space-x-1">
                  <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}

          {typeof window !== 'undefined' && window.location.hostname === 'localhost' && remoteStream && (
            <div className="absolute bottom-4 right-4 px-2 py-1 bg-red-500/80 backdrop-blur-sm rounded-lg">
              <span className="text-white text-xs font-mono">
                Stream: {remoteStream.getTracks().map(t => `${t.kind}(${t.readyState})`).join(', ')}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </main>

      <footer className="relative z-10 w-full max-w-6xl p-6">
        <div className="bg-white/80 backdrop-blur-md border border-blue-200/50 rounded-2xl shadow-lg p-6">
          <div className="flex justify-center items-center space-x-8">
            <div className="relative group">
              <button
                onClick={() => setCameraEnabled(c => !c)}
                className={`p-4 rounded-2xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300/50 ${
                  cameraEnabled
                    ? 'bg-blue-100 hover:bg-blue-200 border-2 border-blue-300 shadow-lg'
                    : 'bg-red-500 hover:bg-red-600 border-2 border-red-400 shadow-lg'
                }`}
                aria-label={cameraEnabled ? 'Turn off camera' : 'Turn on camera'}
              >
                {cameraEnabled ? (
                  <Video className="w-7 h-7 text-blue-600" />
                ) : (
                  <VideoOff className="w-7 h-7 text-white" />
                )}
              </button>
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                {cameraEnabled ? 'Turn off camera' : 'Turn on camera'}
              </div>
            </div>
            <div className="relative group">
              <button
                onClick={toggleMic}
                className={`p-4 rounded-2xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300/50 ${
                  micEnabled
                    ? 'bg-blue-100 hover:bg-blue-200 border-2 border-blue-300 shadow-lg'
                    : 'bg-red-500 hover:bg-red-600 border-2 border-red-400 shadow-lg'
                }`}
                aria-label={micEnabled ? 'Mute mic' : 'Unmute mic'}
              >
                {micEnabled ? (
                  <Mic className="w-7 h-7 text-blue-600" />
                ) : (
                  <MicOff className="w-7 h-7 text-white" />
                )}
              </button>
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                {micEnabled ? 'Mute microphone' : 'Unmute microphone'}
              </div>
            </div>

            <div className="relative group">
              <button
                onClick={handleLeave}
                className="p-4 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-2 border-red-400 shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-red-300/50"
                aria-label="Leave call"
              >
                <PhoneOff className="w-7 h-7 text-white" />
              </button>
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                Leave call
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center space-x-6 mt-4 pt-4 border-t border-blue-200/50">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${cameraEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-blue-700 text-sm">Camera {cameraEnabled ? 'On' : 'Off'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${micEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-blue-700 text-sm">Mic {micEnabled ? 'On' : 'Off'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-blue-700 text-sm">Connected</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VideoCallPage;