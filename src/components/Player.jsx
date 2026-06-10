import { useState, useRef, useEffect } from "react";

function Player() {
  const [isListening, setIsListening] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Écouter un streaming en direct");
  
  const socketRef = useRef(null);
  const audioCtxRef = useRef(null);
  const nextStartTimeRef = useRef(0); // Pour enchaîner les sons de manière fluide

  // Remplace par ton IP locale pour les tests réseau (ex: "192.168.1.50")
  const IP_LOCALE = "127.0.0.1"; 

  const startStreaming = async () => {
    setStatusMessage("Connexion au direct...");

    // 1. Initialiser le décodeur de son brut du navigateur
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext({ sampleRate: 44100 }); // Fréquence standard CD
    audioCtxRef.current = audioCtx;
    nextStartTimeRef.current = audioCtx.currentTime;

    // 2. Connexion WebSocket
    const socket = new WebSocket(`ws://${IP_LOCALE}:8000/ws/stream`);
    socketRef.current = socket;
    socket.binaryType = "arraybuffer"; // On reçoit des données binaires brutes

    socket.onopen = () => {
      setStatusMessage("● EN DIRECT");
      setIsListening(true);
    };

    // 3. RÉCEPTION DES FRÉQUENCES
    socket.onmessage = (event) => {
      if (!audioCtx || audioCtx.state === "suspended") return;

      // Convertir les données binaires reçues en tableau de fréquences (Float32)
      const arrayBuffer = event.data;
      const float32Array = new Float32Array(arrayBuffer);

      // Créer un mini-buffer audio dans le navigateur
      const audioBuffer = audioCtx.createBuffer(1, float32Array.length, 44100);
      audioBuffer.getChannelData(0).set(float32Array);

      // Créer la source de lecture
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);

      // Enchaîner les morceaux de son sans aucun vide (gaps)
      const currentTime = audioCtx.currentTime;
      if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime;
      }

      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += audioBuffer.duration; // Préparer le début du prochain morceau
    };

    socket.onclose = () => {
      stopStreaming();
    };

    socket.onerror = (err) => {
      console.error(err);
      setStatusMessage("Erreur de connexion");
    };
  };

  const stopStreaming = () => {
    if (socketRef.current) socketRef.current.close();
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setStatusMessage("Écouter un streaming en direct");
    setIsListening(false);
  };

  useEffect(() => {
    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, []);

  return (
    <div className="p-8 text-center bg-white rounded-2xl shadow-lg max-w-sm mx-auto my-10">
      <h2 className="text-xl font-bold mb-6 text-gray-800">{statusMessage}</h2>
      
      <button
        onClick={isListening ? stopStreaming : startStreaming}
        className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white transition shadow-md ${
          isListening 
            ? "bg-red-500 hover:bg-red-600 animate-pulse" 
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isListening ? "⏸️" : "▶️"}
      </button>
      <p className="mt-4 text-xs text-gray-500 font-medium">
        {isListening ? "Cliquez pour couper le son" : "Cliquez pour vous connecter au flux audio"}
      </p>
    </div>
  );
}

export default Player;