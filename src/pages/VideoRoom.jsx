/**
 * Video Session Room
 * Real-time peer-to-peer video/audio session using PeerJS + Socket.IO
 * Designed for low-bandwidth environments with toggle controls
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, 
  MessageSquare, Send, X 
} from 'lucide-react';
import { io } from 'socket.io-client';
import Peer from 'peerjs';
import { sessionAPI } from '../services/apiService';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import RatingModal from '../components/rating/RatingModal';
import toast from 'react-hot-toast';

// Socket.IO server URL
const SOCKET_URL = 'https://skillswap-backend-1-pp5y.onrender.com';

export default function VideoRoom() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Video/Audio refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);

  // State
  const [sessionData, setSessionData] = useState(null);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [peerConnected, setPeerConnected] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load session data
  useEffect(() => {
    loadSession();
    return () => cleanup();
  }, [sessionId]);

  // Load session details from backend
  const loadSession = async () => {
    try {
      const response = await sessionAPI.getSession(sessionId);
      setSessionData(response.data);
      // Initialize WebRTC after session loads
      initializeConnection(response.data);
    } catch (error) {
      toast.error('Failed to load session');
      navigate('/sessions');
    } finally {
      setLoading(false);
    }
  };

  // Initialize Socket.IO + PeerJS connections
  const initializeConnection = async (session) => {
    try {
      // Get user's camera/mic stream (low bandwidth settings for rural areas)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },    // Lower resolution for bandwidth
          height: { ideal: 480 },
          frameRate: { ideal: 15 },  // 15 FPS to save bandwidth
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      localStreamRef.current = stream;

      // Show local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Connect to Socket.IO server
      socketRef.current = io(SOCKET_URL);

      // Join the session room
      socketRef.current.emit('join-room', {
        roomId: sessionId,
        userId: user._id,
        userName: user.name,
      });

      // Listen for peer joining the room
      socketRef.current.on('user-joined', ({ userId, userName }) => {
        toast.success(`${userName} joined the session`);
        setPeerConnected(true);
      });

      // Listen for peer leaving
      socketRef.current.on('user-left', () => {
        toast('Peer disconnected');
        setPeerConnected(false);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
      });

      // Listen for chat messages
      socketRef.current.on('receive-message', (data) => {
        setChatMessages(prev => [...prev, data]);
      });

      // Listen for session ending
      socketRef.current.on('session-ended', () => {
        toast('Session ended');
        setShowRating(true);
      });

      // Listen for peer audio/video toggles
      socketRef.current.on('peer-audio-toggle', ({ enabled }) => {
        toast(enabled ? 'Peer unmuted' : 'Peer muted');
      });

      socketRef.current.on('peer-video-toggle', ({ enabled }) => {
        toast(enabled ? 'Peer turned on camera' : 'Peer turned off camera');
      });

      // Initialize PeerJS for WebRTC
      peerRef.current = new Peer(user._id, {
        host: '/',
        port: 9000,
        path: '/peerjs',
      });

      // When PeerJS is ready
      peerRef.current.on('open', (id) => {
        setIsConnected(true);
        console.log('PeerJS connected with ID:', id);
      });

      // Receive incoming call
      peerRef.current.on('call', (call) => {
        call.answer(stream); // Answer with our stream
        call.on('stream', (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
          setPeerConnected(true);
        });
      });

      // Handle PeerJS signal relay through socket
      socketRef.current.on('peer-signal', ({ signal, from }) => {
        // Auto call the other peer when they join
        const call = peerRef.current.call(from, stream);
        call.on('stream', (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
          setPeerConnected(true);
        });
      });

    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to access camera/microphone');
    }
  };

  // Cleanup connections on unmount
  const cleanup = () => {
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    peerRef.current?.destroy();
    socketRef.current?.disconnect();
  };

  // Toggle microphone
  const toggleAudio = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioOn(audioTrack.enabled);

      // Notify peer
      socketRef.current?.emit('toggle-audio', {
        roomId: sessionId,
        userId: user._id,
        enabled: audioTrack.enabled,
      });
    }
  };

  // Toggle camera
  const toggleVideo = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOn(videoTrack.enabled);

      socketRef.current?.emit('toggle-video', {
        roomId: sessionId,
        userId: user._id,
        enabled: videoTrack.enabled,
      });
    }
  };

  // End session
  const endSession = async () => {
    try {
      // Notify peer
      socketRef.current?.emit('end-session', { roomId: sessionId });

      // Update session status to completed
      await sessionAPI.updateSessionStatus(sessionId, 'completed');

      cleanup();
      setShowRating(true);
    } catch (error) {
      toast.error('Error ending session');
    }
  };

  // Send chat message
  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    socketRef.current?.emit('send-message', {
      roomId: sessionId,
      message: chatInput,
      sender: { _id: user._id, name: user.name },
    });

    setChatInput('');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Connecting to session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Rating Modal - shows when session ends */}
      {showRating && (
        <RatingModal
          sessionData={sessionData}
          onClose={() => {
            setShowRating(false);
            navigate('/sessions');
          }}
        />
      )}

      {/* Session Header */}
      <header className="bg-gray-800 px-4 py-3 flex items-center justify-between z-10">
        <div>
          <h2 className="text-white font-bold text-lg">
            {sessionData?.skill} Session
          </h2>
          <p className="text-gray-400 text-sm">
            {peerConnected ? '🟢 Connected' : '🔴 Waiting for peer...'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">
            {sessionData?.duration} min
          </span>
        </div>
      </header>

      {/* Video Container */}
      <div className="flex-1 relative flex items-center justify-center p-4">
        {/* Remote Video (main view) */}
        <div className="relative w-full h-full max-w-4xl rounded-2xl overflow-hidden bg-gray-800">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          {!peerConnected && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="animate-pulse text-6xl mb-4">👤</div>
                <p className="text-lg">Waiting for peer to join...</p>
                <p className="text-sm text-gray-400 mt-2">
                  Share the session link with your partner
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Local Video (small overlay) */}
        <div className="absolute bottom-8 right-8 w-48 h-36 rounded-xl overflow-hidden shadow-lg border-2 border-gray-700">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {!isVideoOn && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <VideoOff className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-gray-800 px-4 py-4">
        <div className="flex items-center justify-center gap-4">
          {/* Mic Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-colors ${
              isAudioOn
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
            title={isAudioOn ? 'Mute' : 'Unmute'}
          >
            {isAudioOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </button>

          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-colors ${
              isVideoOn
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
            title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
          </button>

          {/* Chat Toggle */}
          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-4 rounded-full transition-colors ${
              showChat
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
            title="Chat"
          >
            <MessageSquare className="h-6 w-6" />
          </button>

          {/* End Call */}
          <button
            onClick={endSession}
            className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
            title="End Session"
          >
            <PhoneOff className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Chat Sidebar */}
      {showChat && (
        <div className="absolute right-0 top-16 bottom-20 w-80 bg-white shadow-2xl flex flex-col z-20 rounded-l-2xl">
          {/* Chat Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Session Chat</h3>
            <button onClick={() => setShowChat(false)}>
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 && (
              <p className="text-gray-500 text-sm text-center">No messages yet</p>
            )}
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`${
                  msg.sender._id === user._id ? 'text-right' : 'text-left'
                }`}
              >
                <p className="text-xs text-gray-500 mb-1">{msg.sender.name}</p>
                <p
                  className={`inline-block px-3 py-2 rounded-lg text-sm ${
                    msg.sender._id === user._id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {msg.message}
                </p>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={sendChatMessage} className="p-4 border-t flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-600"
            />
            <button
              type="submit"
              className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
