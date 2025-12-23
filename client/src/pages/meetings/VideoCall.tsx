import React, { useContext, useState } from 'react';
// FIX 1: This import should now work since we made the file .tsx
import { SocketContext } from '../../services/socketContext';
import { Phone, PhoneOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';

export const VideoCall: React.FC = () => {
    // FIX 2: We cast context to 'any' to avoid strict type checking issues for now
    const { 
        callAccepted, myVideo, userVideo, callEnded, stream, call, answerCall, leaveCall, callUser 
    } = useContext(SocketContext) as any;

    const [idToCall, setIdToCall] = useState('');

    return (
        <div className="p-4 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 text-center">Secure Video Room</h2>

            {/* Video Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* My Video */}
                {stream && (
                    <Card>
                        <CardBody className="p-2">
                            <p className="mb-2 font-medium">My Camera</p>
                            <video playsInline muted ref={myVideo} autoPlay className="w-full rounded-lg bg-black" />
                        </CardBody>
                    </Card>
                )}

                {/* User's Video */}
                {callAccepted && !callEnded && (
                    <Card>
                        <CardBody className="p-2">
                            <p className="mb-2 font-medium">Remote User</p>
                            <video playsInline ref={userVideo} autoPlay className="w-full rounded-lg bg-black" />
                        </CardBody>
                    </Card>
                )}
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center space-y-4 bg-white p-6 rounded-lg shadow-md">
                <div className="flex gap-4">
                    <input 
                        type="text" 
                        value={idToCall} 
                        onChange={(e) => setIdToCall(e.target.value)} 
                        placeholder="Enter ID to Call"
                        className="border p-2 rounded w-64"
                    />
                    <Button onClick={() => callUser(idToCall)} leftIcon={<Phone size={18}/>}>
                        Call
                    </Button>
                </div>

                {/* Incoming Call Notification */}
                {call.isReceivedCall && !callAccepted && (
                    <div className="flex items-center gap-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <p className="font-semibold text-yellow-800">Incoming Call...</p>
                        <Button onClick={answerCall}>
                            Answer Call
                        </Button>
                    </div>
                )}

                {/* Hang Up - FIX 3: Removed variant="danger" and added red styling via className */}
                {callAccepted && !callEnded && (
                    <Button 
                        onClick={leaveCall} 
                        leftIcon={<PhoneOff size={18}/>}
                        className="bg-red-600 hover:bg-red-700 text-white border-transparent"
                    >
                        End Call
                    </Button>
                )}
            </div>
            
            <div className="text-center text-gray-500 mt-4">
                <p>Share your ID to start a call</p>
            </div>
        </div>
    );
};