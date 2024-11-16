import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AgoraUIKit from 'agora-react-uikit';
import { ArrowLeft, Video, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const ChatScreen = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [videoCall, setVideoCall] = useState(false);
  const [remoteUser, setRemoteUser] = useState(false);
  const [localVideoReady, setLocalVideoReady] = useState(false);

  const rtcProps = {
    appId: 'a5c8633aad4346b3972d3dafe5dc289c',
    channel: `chat_${userId}`,
    // token: null, // Use null for testing, replace with your token in production
    enableAudio: true,
    enableVideo: true,
    mode: 'rtc',
    layout: 1,
    dual: true,
    codec: 'h264',
    config: {
      role: 'host',
      audienceLatency: 1,
      channelProfile: 1,
      audioScenario: 3,
    },
  };

  const callbacks = {
    EndCall: () => {
      setVideoCall(false);
      setRemoteUser(false);
      setLocalVideoReady(false);
    },
    UserJoined: (user) => {
      console.log('User joined:', user);
      setRemoteUser(true);
    },
    UserLeft: (user) => {
      console.log('User left:', user);
      setRemoteUser(false);
    },
    LocalVideoStateChanged: (state) => {
      console.log('Video state:', state);
      if (state === 2) {
        setLocalVideoReady(true);
      }
    },
    LocalAudioStateChanged: (state, error) => {
      console.log('Audio state:', state, 'Error:', error);
    },
  };

  return (
    <div className="flex flex-col h-[90vh]">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white">
        <Button variant="ghost" size="icon" onClick={() => navigate('/chat-list')}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${userId}`} />
            <AvatarFallback>{userId?.charAt(0)}</AvatarFallback>
          </Avatar>
          <span>{userId}</span>
        </div>
        <div className="flex" style={{ visibility: 'hidden' }}>
          <Button variant="ghost" size="icon" onClick={() => setVideoCall(true)}>
            <Video className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon">
            <Phone className="h-6 w-6" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow relative">
        {videoCall ? (
          <div className="h-full relative bg-black">
            <AgoraUIKit
              rtcProps={rtcProps}
              callbacks={callbacks}
              styleProps={{
                UIKitContainer: {
                  height: '100%',
                  width: '100%',
                  position: 'relative',
                },
                gridVideoContainer: {
                  position: 'relative',
                  height: '100%',
                  width: '100%',
                },
                remoteVideo: {
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  backgroundColor: '#000000',
                  zIndex: 1,
                },
                localVideo: {
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '160px',
                  height: '240px',
                  objectFit: 'cover',
                  backgroundColor: '#000000',
                  borderRadius: '12px',
                  zIndex: 2,
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                },
                localControls: {
                  position: 'absolute',
                  bottom: '32px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'rgba(0, 0, 0, 0.75)',
                  backdropFilter: 'blur(8px)',
                  padding: '12px 24px',
                  borderRadius: '100px',
                  display: 'flex',
                  gap: '24px',
                  zIndex: 50,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                },
                remoteMuteButton: {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '12px',
                  borderRadius: '50%',
                  color: 'white',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  },
                },
                endCallButton: {
                  backgroundColor: '#ef4444',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '12px 24px',
                  borderRadius: '100px',
                  color: 'white',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: '#dc2626',
                  },
                },
              }}
            />
            {!remoteUser && localVideoReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-white">
                <div className="animate-pulse mb-6">
                  <div className="w-20 h-20 rounded-full border-4 border-white border-t-transparent animate-spin" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Waiting for {userId}</h2>
                <p className="text-gray-300">The call will begin when they join</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-gray-50">
            <Avatar className="h-20 w-20 mb-4">
              <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${userId}`} />
              <AvatarFallback>{userId?.charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="text-xl font-medium mb-6">Start a video call with {userId}</p>
            <Button
              onClick={() => setVideoCall(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Video className="h-5 w-5" />
              Start Video Call
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};
