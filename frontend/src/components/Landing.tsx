import { useEffect, useRef, useState } from "react";
import { Room } from "./Room";

export const Landing = () => {
  // const [name, setName] = useState("");
  const [localAudioTrack, setLocalAudioTrack] =
    useState<MediaStreamTrack | null>(null);
  const [localVideoTrack, setlocalVideoTrack] =
    useState<MediaStreamTrack | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [joined, setJoined] = useState(false);

  const getCam = async () => {
    const stream = await window.navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    // MediaStream
    const audioTrack = stream.getAudioTracks()[0];
    const videoTrack = stream.getVideoTracks()[0];
    setLocalAudioTrack(audioTrack);
    setlocalVideoTrack(videoTrack);
    if (!videoRef.current) {
      return;
    }
    videoRef.current.srcObject = new MediaStream([videoTrack]);
    videoRef.current.play();
    // MediaStream
  };

  useEffect(() => {
    if (videoRef && videoRef.current) {
      getCam();
    }
  }, [videoRef]);

  if (!joined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        {/* Video Container */}
        <video
          autoPlay
          ref={videoRef}
          className="md:max-w-lg rounded-xl transition-all duration-200"
          style={{ transform: "rotateY(180deg)" }}
        ></video>

        {/* Input for Name */}
        <input
          type="text"
          placeholder="Enter your name"
          className="border border-gray-300 w-full max-w-sm md:max-w-lg rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          // onChange={(e) => setName(e.target.value)}
          aria-label="Enter your name"
        />

        {/* Join Button */}
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-3xl hover:bg-blue-600 transition-all duration-200 w-24"
          onClick={() => setJoined(true)}
          aria-label="Join the session"
        >
          Join
        </button>
      </div>
    );
  }

  return (
    <Room
      // name={name}
      localAudioTrack={localAudioTrack}
      localVideoTrack={localVideoTrack}
    />
  );
};
