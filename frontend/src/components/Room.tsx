import { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";

const URL = "https://vlserver-l4kwq93n.b4a.run";

export const Room = ({
    // name,
    localAudioTrack,
    localVideoTrack
}: {
    // name: string,
    localAudioTrack: MediaStreamTrack | null,
    localVideoTrack: MediaStreamTrack | null,
}) => {
    // const [searchParams, setSearchParams] = useSearchParams();
    const [lobby, setLobby] = useState(true);
    const [socketConnection, setSocketConnection] = useState<Socket | null>(null);
    const [sendingPc, setSendingPc] = useState<null | RTCPeerConnection>(null);
    const [receivingPc, setReceivingPc] = useState<null | RTCPeerConnection>(null);
    const [remoteVideoTrack, setRemoteVideoTrack] = useState<MediaStreamTrack | null>(null);
    const [remoteAudioTrack, setRemoteAudioTrack] = useState<MediaStreamTrack | null>(null);
    const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const socket = io(URL);
        socket.on('send-offer', async ({roomId}) => {
            console.log("sending offer");
            setLobby(false);
            const pc = new RTCPeerConnection();
            console.log(sendingPc)
            // if(sendingPc){
            // }
            setSendingPc(pc);
            
            if (localVideoTrack) {
                console.error("added tack");
                console.log(localVideoTrack)
                pc.addTrack(localVideoTrack)
            }
            if (localAudioTrack) {
                console.error("added tack");
                console.log(localAudioTrack)
                pc.addTrack(localAudioTrack)
            }

            pc.onicecandidate = async (e) => {
                console.log("receiving ice candidate locally");
                if (e.candidate) {
                    socket.emit("add-ice-candidate", {
                    candidate: e.candidate,
                    type: "sender",
                    roomId
                   })
                }
            }

            pc.onnegotiationneeded = async () => {
                console.log("on negotiation neeeded, sending offer");
                const sdp = await pc.createOffer();
                //@ts-ignore
                pc.setLocalDescription(sdp)
                socket.emit("offer", {
                    sdp,
                    roomId
                })
            }
        });

        socket.on("offer", async ({roomId, sdp: remoteSdp}) => {
            console.log("received offer");
            setLobby(false);
            const pc = new RTCPeerConnection();
            pc.setRemoteDescription(remoteSdp)
            const sdp = await pc.createAnswer();
            //@ts-ignore
            pc.setLocalDescription(sdp)
            const stream = new MediaStream();
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = stream;
            }

            // if(remoteMediaStream){
            // }
            console.log(remoteMediaStream)
            setRemoteMediaStream(stream);
            // trickle ice 
            // if(receivingPc){
            // }
            console.log(receivingPc)

            setReceivingPc(pc);
            // window.pcr = pc;
            // pc.ontrack = () => {
            //     alert("ontrack");
            //     // console.error("inside ontrack");
            //     // const {track, type} = e;
            //     // if (type == 'audio') {
            //     //     // setRemoteAudioTrack(track);
            //     //     // @ts-ignore
            //     //     remoteVideoRef.current.srcObject.addTrack(track)
            //     // } else {
            //     //     // setRemoteVideoTrack(track);
            //     //     // @ts-ignore
            //     //     remoteVideoRef.current.srcObject.addTrack(track)
            //     // }
            //     // //@ts-ignore
            //     // remoteVideoRef.current.play();
            // }

            pc.onicecandidate = async (e) => {
                if (!e.candidate) {
                    return;
                }
                console.log("omn ice candidate on receiving seide");
                if (e.candidate) {
                    socket.emit("add-ice-candidate", {
                    candidate: e.candidate,
                    type: "receiver",
                    roomId
                   })
                }
            }

            socket.emit("answer", {
                roomId,
                sdp: sdp
            });
            setTimeout(() => {
                const track1 = pc.getTransceivers()[0].receiver.track
                const track2 = pc.getTransceivers()[1].receiver.track
                console.log(track1);
                if (track1.kind === "video") {
                    // if(remoteAudioTrack){
                    // }
                    console.log(remoteAudioTrack)
                    setRemoteAudioTrack(track2)
                    console.log(remoteVideoTrack)
                    // if(remoteVideoTrack){
                    // }
                    setRemoteVideoTrack(track1)
                } else {
                    // if(remoteAudioTrack){
                    // }
                    setRemoteAudioTrack(track1)
                    // if(remoteVideoTrack){
                    // }
                    setRemoteVideoTrack(track2)
                }
                //@ts-ignore
                remoteVideoRef.current.srcObject.addTrack(track1)
                //@ts-ignore
                remoteVideoRef.current.srcObject.addTrack(track2)
                //@ts-ignore
                remoteVideoRef.current.play();
                // if (type == 'audio') {
                //     // setRemoteAudioTrack(track);
                //     // @ts-ignore
                //     remoteVideoRef.current.srcObject.addTrack(track)
                // } else {
                //     // setRemoteVideoTrack(track);
                //     // @ts-ignore
                //     remoteVideoRef.current.srcObject.addTrack(track)
                // }
                // //@ts-ignore
            }, 500)
        });

        socket.on("answer", ({sdp: remoteSdp}) => {
            setLobby(false);
            setSendingPc(pc => {
                pc?.setRemoteDescription(remoteSdp)
                return pc;
            });
            console.log("loop closed");
        })

        socket.on("lobby", () => {
            setLobby(true);
        })

        socket.on("add-ice-candidate", ({candidate, type}) => {
            console.log("add ice candidate from remote");
            console.log({candidate, type})
            if (type == "sender") {
                setReceivingPc(pc => {
                    if (!pc) {
                        console.error("receiving pc not found")
                    } else {
                        console.error(pc.ontrack)
                    }
                    pc?.addIceCandidate(candidate)
                    return pc;
                });
            } else {
                setSendingPc(pc => {
                    if (!pc) {
                        console.error("sending pc not found")
                    } else {
                        // console.error(pc.ontrack)
                    }
                    pc?.addIceCandidate(candidate)
                    return pc;
                });
            }
        })
        if(socketConnection){
            setSocketConnection(socketConnection)
        }
        
    }, [name])

    useEffect(() => {
        if (localVideoRef.current) {
            if (localVideoTrack) {
                localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
                localVideoRef.current.play();
            }
        }
    }, [localVideoRef])

    return (
        <div className="flex md:flex-row flex-col items-center justify-evenly min-h-screen transition-all duration-200">
            {/* Video containers */}
            {[localVideoRef, remoteVideoRef].map((ref, idx) => (
                <div
                key={idx}
                className={`flex items-center justify-center ${lobby && idx === 1 ? 'hidden' : ''}`}
                >
                <video
                    autoPlay
                    className="md:max-w-lg rounded-xl transition-all duration-200"
                    style={{ transform: 'rotateY(180deg)' }}
                    ref={ref}
                />
                </div>
            ))}

            {/* Lobby Spinner */}
            {lobby && (
                <div className="flex items-center justify-center min-h-screen">
                <div className="flex items-center space-x-3">
                    <svg
                    className="animate-spin h-10 w-10 text-indigo-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                    </svg>
                    <p className="text-indigo-500 text-lg">Connecting to someone...</p>
                </div>
            </div>
        )}
    </div>  
    );
}
