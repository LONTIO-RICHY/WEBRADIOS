import { useEffect, useRef } from "react";

function Player() {
  const audioRef = useRef(null);
  const mediaSource = new MediaSource();
  let sourceBuffer;

  useEffect(() => {
    const socket = new WebSocket("ws://127.0.0.1:8000/ws/stream");
    socket.binaryType = "arraybuffer";

    const audio = audioRef.current;
    audio.src = URL.createObjectURL(mediaSource);

    mediaSource.addEventListener("sourceopen", () => {
      // On définit le format audio (WebM/Opus est le standard navigateur)
      sourceBuffer = mediaSource.addSourceBuffer('audio/webm; codecs="opus"');
    });

    socket.onmessage = (event) => {
      if (sourceBuffer && !sourceBuffer.updating) {
        sourceBuffer.appendBuffer(event.data);
      }
    };

    return () => socket.close();
  }, []);

  return (
    <div className="p-2 text-center">
      <h2 className="text-xl font-bold mb-4">Écouter un streaming en direct</h2>
     <span className="cursor-pointer"><audio ref={audioRef} controls autoPlay className="mx-auto cursor-pointer" /></span> 
    </div>
  );
}

export default Player;
