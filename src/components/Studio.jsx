import { useState, useEffect, useRef } from "react";
import axios from "axios";

function Studio() {
  const audioContextRef = useRef(null);
  const audioSourceNodeRef = useRef(null);
  const audioDestinationRef = useRef(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLive, setIsLive] = useState(false);

  // Source de diffusion choisie : "micro" ou "file"
  const [audioSource, setAudioSource] = useState("micro");

  // États pour la bibliothèque
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [myTracks, setMyTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState("");

  const audioRef = useRef(null); // Lecteur invisible pour les MP3
  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null); // Référence pour pouvoir couper le micro à la fin

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchMyTracks();
  }, []);

  const fetchMyTracks = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/my-tracks", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyTracks(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des pistes :", error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadTitle || !uploadFile) {
      alert("Veuillez donner un titre et sélectionner un fichier MP3.");
      return;
    }
    const formData = new FormData();
    formData.append("file", uploadFile);

    try {
      await axios.post(`http://127.0.0.1:8000/api/upload?title=${encodeURIComponent(uploadTitle)}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      alert("Fichier envoyé avec succès !");
      setUploadTitle("");
      setUploadFile(null);
      fetchMyTracks();
    } catch (error) {
      alert("Erreur lors de l'upload : " + (error.response?.data?.detail || "Erreur serveur"));
    }
  };

  // DÉMARRER LA DIFFUSION (Gère intelligemment le micro ou le MP3)
    const startEmission = async () => {
    try {
      // 1. Déclarer le Live en Base de Données
      await axios.post(
        "http://127.0.0.1:8000/api/emissions",
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let finalStream = null;

      if (audioSource === "micro") {
        // --- CAS 1 : MICRO ---
        finalStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = finalStream;
      } else {
        // --- CAS 2 : MP3 BIBLIOTHÈQUE ---
        if (!selectedTrack) {
          alert("Veuillez sélectionner une musique de votre bibliothèque à gauche !");
          return;
        }
        const trackUrl = `http://127.0.0.1:8000/${selectedTrack.replace("\\", "/")}`;
        
        // Initialiser l'AudioContext une seule fois
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        const audioContext = audioContextRef.current;
        await audioContext.resume(); // Force l'activation du son

        // Charger le fichier dans l'élément HTML audio
        audioRef.current.src = trackUrl;
        audioRef.current.crossOrigin = "anonymous"; // Évite les blocages de sécurité CORS

        // Connecter la balise <audio> à l'AudioContext UNIQUEMENT la première fois
        if (!audioSourceNodeRef.current) {
          audioSourceNodeRef.current = audioContext.createMediaElementSource(audioRef.current);
          audioDestinationRef.current = audioContext.createMediaStreamDestination();
          
          // Faire les branchements
          audioSourceNodeRef.current.connect(audioDestinationRef.current);
          audioSourceNodeRef.current.connect(audioContext.destination); // Pour écouter localement
        }

        // Lancer la lecture
        audioRef.current.play();
        finalStream = audioDestinationRef.current.stream;
      }

            // 3. CONNEXION WEBSOCKET VERS FASTAPI
      socketRef.current = new WebSocket("ws://127.0.0.1:8000/ws/stream");

      socketRef.current.onopen = () => {
        // 4. CAPTURE DU SON BRUT (À la place du MediaRecorder)
        const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });
        const source = audioContext.createMediaStreamSource(finalStream);
        
        // Un "ScriptProcessor" capture directement les variations de volume du micro
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        
        source.connect(processor);
        processor.connect(audioContext.destination);

              processor.onaudioprocess = (e) => {
          if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0); // Le son brut (Float32Array)
            
            // CRÉER UN NOUVEAU TAMPON DE DONNÉES EXACTEMENT DE LA BONNE TAILLE
            // Ceci garantit que la taille est un multiple de 4 et que c'est un ArrayBuffer "propre"
            const outputBuffer = new Float32Array(inputData); 
            socketRef.current.send(outputBuffer.buffer); // Envoyer le tampon sous-jacent du nouveau tableau
          }
        };


        // On garde en mémoire pour pouvoir éteindre proprement à la fin
        mediaRecorderRef.current = {
          stop: () => {
            processor.disconnect();
            source.disconnect();
            audioContext.close();
          }
        };

        setIsLive(true);
      };


    } catch (error) {
      console.error(error);
      alert("Erreur lors du lancement du direct.");
    }
  };


  // ARRÊTER LA DIFFUSION
  const stopEmission = () => {
    // 1. Arrêter le lecteur si on diffusait un MP3
    if (audioRef.current) {
      audioRef.current.pause();
    }
    // 2. Éteindre physiquement le micro s'il était allumé
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    // 3. Arrêter l'enregistrement
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    // 4. Fermer la WebSocket
    if (socketRef.current) {
      socketRef.current.close();
    }
    setIsLive(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
      
      {/* Lecteur invisible */}
      <audio ref={audioRef} />

      {/* SECTION 1 : BIBLIOTHÈQUE (À gauche) */}
      <div className="bg-white p-6 rounded-xl shadow-md h-fit">
        <h2 className="text-xl font-bold text-gray-800 mb-4">🎵 Ma Bibliothèque Audio (Serveur)</h2>
        
        {/* Formulaire d'upload */}
        <form onSubmit={handleUpload} className="space-y-4 mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800">Ajouter un nouveau MP3</h3>
          <input 
            type="text" 
            placeholder="Nom du morceau / Jingle" 
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
            className="w-full p-2 border rounded bg-white"
          />
          <input 
            type="file" 
            accept="audio/mp3, audio/mpeg"
            onChange={(e) => setUploadFile(e.target.files[0])}
            className="w-full text-sm"
          />
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded font-semibold hover:bg-blue-700">
            Envoyer sur le serveur ⬆️
          </button>
        </form>

        {/* Liste des musiques */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {myTracks.map((track) => (
            <div 
              key={track.id} 
              onClick={() => {
                setSelectedTrack(track.file_path);
                setAudioSource("file"); // Change la source automatiquement sur "Fichier"
              }}
              className={`p-3 border rounded-lg cursor-pointer transition ${
                selectedTrack === track.file_path && audioSource === "file"
                  ? "border-green-500 bg-green-50 font-bold" 
                  : "hover:bg-gray-50"
              }`}
            >
              {track.title}
            </div>
          ))}
          {myTracks.length === 0 && (
            <p className="text-gray-500 text-sm italic">Votre bibliothèque est vide.</p>
          )}
        </div>
      </div>

      {/* SECTION 2 : CONSOLE DE DIFFUSION (À droite) */}
      <div className="bg-white p-6 rounded-xl shadow-md h-fit">
        <h1 className="text-2xl font-bold text-blue-600 mb-6">🎙️ Console de Diffusion</h1>
        
        {!isLive ? (
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Titre du direct" 
              className="w-full p-2 border rounded"
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea 
              placeholder="Description" 
              className="w-full p-2 border rounded"
              onChange={(e) => setDescription(e.target.value)}
            />

            {/* LE SÉLECTEUR DE SOURCE (Le choix !) */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-2 border border-gray-200">
              <span className="block font-semibold text-gray-700 mb-1">Source Audio :</span>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="source" 
                  value="micro" 
                  checked={audioSource === "micro"}
                  onChange={() => setAudioSource("micro")} 
                />
                <span className="text-gray-700">🎙️ Utiliser mon Microphone</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="source" 
                  value="file" 
                  checked={audioSource === "file"}
                  onChange={() => setAudioSource("file")} 
                />
                <span className="text-gray-700">📁 Diffuser un MP3 de ma bibliothèque</span>
              </label>
            </div>

            {audioSource === "file" && (
              <div className="p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                <strong>Musique sélectionnée :</strong> <br />
                {selectedTrack ? "Prête à être diffusée" : "⚠️ Aucune. Sélectionnez un morceau dans la liste à gauche."}
              </div>
            )}

            <button 
              onClick={startEmission}
              className="w-full bg-green-600 text-white p-4 rounded-xl font-bold text-lg hover:bg-green-700 shadow-md transition"
            >
              Lancer le Direct Radio 🚀
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="animate-pulse text-red-600 font-extrabold text-3xl mb-4">● EN DIRECT SUR RICKESS</div>
            <p className="text-gray-600 mb-2 font-medium">
              Source active : {audioSource === "micro" ? "🎙️ Votre Microphone" : "📁 Fichier Serveur"}
            </p>
            <p className="text-gray-500 mb-6 text-sm">Le flux est actuellement diffusé aux auditeurs en temps réel.</p>
            <button 
              onClick={stopEmission}
              className="bg-red-600 text-white p-4 rounded-xl font-bold text-lg hover:bg-red-700 shadow-lg transition"
            >
              Couper le Direct 🛑
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

export default Studio;