import { useState, useEffect } from "react";
import axios from "axios";

function Studio() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [stream, setStream] = useState(null);

  // Fonction pour démarrer l'émission en base de données
// ... (reste du code)

const startEmission = async () => {
  const token = localStorage.getItem("token");

  try {
    // 1. Création en DB (déjà fait)
    await axios.post("http://127.0.0.1:8000/api/emissions", 
      { title, description },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // 2. Accès Micro
    const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setStream(audioStream);
    setIsLive(true);

    // 3. CONNEXION WEBSOCKET
    const socket = new WebSocket("ws://127.0.0.1:8000/ws/stream");

    // 4. Découpage du son (MediaRecorder)
    const mediaRecorder = new MediaRecorder(audioStream);
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
        socket.send(event.data); // On envoie le morceau de son au serveur
      }
    };

    // On envoie un morceau de son toutes les 200ms
    mediaRecorder.start(200); 
    
    alert("VOUS ÊTES EN DIRECT !");

  } catch (error) {
    alert("Erreur de connexion au flux.");
  }
};


  // Fonction pour arrêter le live
  const stopEmission = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop()); // Coupe le micro
    }
    setIsLive(false);
    setStream(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">Studio Radio Rickess</h1>
        
        {!isLive ? (
          <div className="space-y-4">
            <input 
              type="text" placeholder="Titre de l'émission" 
              className="w-full p-2 border rounded"
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea 
              placeholder="Description" 
              className="w-full p-2 border rounded"
              onChange={(e) => setDescription(e.target.value)}
            />
            <button 
              onClick={startEmission}
              className="w-full bg-green-500 text-white p-3 rounded-lg font-bold hover:bg-green-600"
            >
              Lancer le Direct 🎙️
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="animate-pulse text-red-600 font-bold text-xl mb-4">● EN DIRECT</div>
            <p className="text-gray-700 mb-4">Votre micro est actuellement diffusé.</p>
            <button 
              onClick={stopEmission}
              className="bg-red-500 text-white p-3 rounded-lg font-bold hover:bg-red-600"
            >
              Arrêter l'émission
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Studio;
