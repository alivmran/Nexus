import React, { createContext, useState, useRef, useEffect, ReactNode } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';

// Detects if we are on the internet or local (Deployment Ready)
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const socket = io(SOCKET_URL);

interface SocketContextType {
  call: any;
  callAccepted: boolean;
  myVideo: React.RefObject<HTMLVideoElement>;
  userVideo: React.RefObject<HTMLVideoElement>;
  stream: MediaStream | null;
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  callEnded: boolean;
  me: string;
  callUser: (id: string) => void;
  leaveCall: () => void;
  answerCall: () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

const ContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [me, setMe] = useState('');
    const [call, setCall] = useState({});
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [name, setName] = useState('');

    const myVideo = useRef<HTMLVideoElement>(null);
    const userVideo = useRef<HTMLVideoElement>(null);
    const connectionRef = useRef<Peer.Instance>();

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                setStream(currentStream);
                if(myVideo.current) {
                    myVideo.current.srcObject = currentStream;
                }
            });

        socket.on('me', (id) => setMe(id));

        socket.on('callUser', ({ from, name: callerName, signal }) => {
            setCall({ isReceivedCall: true, from, name: callerName, signal });
        });
    }, []);

    const answerCall = () => {
        setCallAccepted(true);
        const peer = new Peer({ initiator: false, trickle: false, stream: stream! });

        // FIX: Explicitly type 'data' as any to satisfy TypeScript
        peer.on('signal', (data: any) => {
            socket.emit('answerCall', { signal: data, to: (call as any).from });
        });

        // FIX: Explicitly type 'currentStream' as MediaStream
        peer.on('stream', (currentStream: MediaStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = currentStream;
            }
        });

        peer.signal((call as any).signal);
        connectionRef.current = peer;
    };

    const callUser = (id: string) => {
        const peer = new Peer({ initiator: true, trickle: false, stream: stream! });

        // FIX: Explicitly type 'data' as any
        peer.on('signal', (data: any) => {
            socket.emit('callUser', { userToCall: id, signalData: data, from: me, name });
        });

        // FIX: Explicitly type 'currentStream' as MediaStream
        peer.on('stream', (currentStream: MediaStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = currentStream;
            }
        });

        socket.on('callAccepted', (signal) => {
            setCallAccepted(true);
            peer.signal(signal);
        });

        connectionRef.current = peer;
    };

    const leaveCall = () => {
        setCallEnded(true);
        if(connectionRef.current) {
            connectionRef.current.destroy();
        }
        window.location.reload();
    };

    return (
        <SocketContext.Provider value={{
            call,
            callAccepted,
            myVideo,
            userVideo,
            stream,
            name,
            setName,
            callEnded,
            me,
            callUser,
            leaveCall,
            answerCall,
        }}>
            {children}
        </SocketContext.Provider>
    );
};

export { ContextProvider, SocketContext };