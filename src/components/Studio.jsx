import { useState, useEffect, useRef } from "react";
import api from "../Api";
import { useLocation, useNavigate } from "react-router-dom";
import { Play, Pause, Radio, Mic, Music, Upload, Power, AlertTriangle, PlusCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAudio } from "../context/AudioContext";
import toast from "react-hot-toast";

function Studio() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentChannel } = useAudio();
  const queryParams = new URLSearchParams(location.search);
  const channelIdFromUrl = queryParams.get("channel_id");

  const audioContextRef = useRef(null);
  const audioSourceNodeRef = useRef(null);
  const audioDestinationRef = useRef(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [currentEmissionId, setCurrentEmissionId] = useState(null);
  const [channelId, setChannelId] = useState(channelIdFromUrl || "");
  const [myChannels, setMyChannels] = useState([]);
  const [selectedArchive, setSelectedArchive] = useState(""); // Nouvel état pour l'archive

  // Source de diffusion choisie : "micro" ou "file"
  const [audioSource, setAudioSource] = useState("micro");

  // États pour la bibliothèque
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [myTracks, setMyTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState("");
  const [isPlayingTrack, setIsPlayingTrack] = useState(false);

  const audioRef = useRef(null); // Lecteur invisible pour les MP3
  const socketRef = useRef(null);
  const streamRef = useRef(null); 
  const mediaRecorderRef = useRef(null);

  // Fonction pour basculer la lecture d'une piste dans le studio
  const toggleTrackPreview = async (track) => {
    if (!audioRef.current) return;

    const cleanPath = track.file_path.replace(/\\/g, "/");
    const finalPath = cleanPath.startsWith("/") ? cleanPath.substring(1) : cleanPath;
    const trackUrl = `${api.defaults.baseURL}/${finalPath}`;

    // Si on clique sur la piste déjà en cours de lecture
    if (selectedTrack === track.file_path && isPlayingTrack) {
        console.log("Studio : Pause de la piste");
        audioRef.current.pause();
        setIsPlayingTrack(false);
        return;
    }

    // Sinon, on lance la nouvelle piste (ou on reprend l'actuelle)
    console.log("Studio : Lecture de la piste", track.title);
    setSelectedTrack(track.file_path);
    setAudioSource("file");
    if (!title) setTitle(track.title);

    if (audioRef.current.src !== trackUrl) {
        audioRef.current.src = trackUrl;
        audioRef.current.crossOrigin = "anonymous";
        audioRef.current.load();
    }

    try {
        // Important: L'AudioContext doit être créé ou repris sur interaction utilisateur
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });
        }
        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }

        await audioRef.current.play();
        setIsPlayingTrack(true);
        toast.success(`Lecture : ${track.title}`);
    } catch (e) {
        console.error("Erreur lecture studio", e);
        toast.error("Impossible de lire ce fichier");
    }
  };

  useEffect(() => {
    const initStudio = async () => {
        // 1. VÉRIFICATION AUTHENTIFICATION
        if (!user) {
            toast.error("Veuillez vous connecter pour accéder au Studio.");
            navigate("/PageLogin");
            return;
        }

        try {
            const [tracksRes, channelsRes] = await Promise.all([
                api.get("/api/my-tracks", { headers: { Authorization: `Bearer ${user.token}` } }),
                api.get("/api/my-channels", { headers: { Authorization: `Bearer ${user.token}` } })
            ]);

            // 2. VÉRIFICATION POSSESSION DE CHAÎNE
            if (channelsRes.data.length === 0 && !user.is_admin) {
                toast((t) => (
                    <div className="flex flex-col gap-3">
                        <p className="font-bold text-sm">Vous n'avez pas encore de chaîne radio !</p>
                        <button 
                            onClick={() => { toast.dismiss(t.id); navigate("/"); }}
                            className="bg-[#D4480A] text-white px-3 py-1.5 rounded-lg text-xs font-black uppercase"
                        >
                            Créer ma chaîne maintenant
                        </button>
                    </div>
                ), { duration: 6000 });
                navigate("/");
                return;
            }

            setMyTracks(tracksRes.data);
            setMyChannels(channelsRes.data);
            
            if (channelIdFromUrl) {
                const target = channelsRes.data.find(c => String(c.id) === String(channelIdFromUrl));
                if (!target && !user.is_admin) {
                    toast.error("Vous n'êtes pas l'administrateur de cette chaîne.");
                    navigate("/");
                    return;
                }
                setChannelId(channelIdFromUrl);
                if (target) setCurrentChannel(target);
            } else if (channelsRes.data.length > 0) {
                setChannelId(channelsRes.data[0].id);
                setCurrentChannel(channelsRes.data[0]);
            }
        } catch (err) {
            console.error("Erreur init Studio", err);
            toast.error("Impossible de charger vos données.");
            navigate("/");
        }
    };
    initStudio();
  }, [user, channelIdFromUrl, navigate, setCurrentChannel]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadTitle || !uploadFile) {
      toast.error("Veuillez donner un titre et sélectionner un fichier.");
      return;
    }
    
    if (!channelId) {
        toast.error("Sélectionnez d'abord une chaîne à droite pour y archiver ce son.");
        return;
    }

    const formData = new FormData();
    formData.append("file", uploadFile);

    try {
      // 1. Upload du fichier
      const uploadRes = await api.post(`/api/upload?title=${encodeURIComponent(uploadTitle)}`, formData, {
        headers: { 
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      
      const newTrack = uploadRes.data;

      // 2. ARCHIVAGE AUTOMATIQUE : Création immédiate de l'émission pour cette chaîne
      await api.post(
        "/api/emissions",
        { 
          title: uploadTitle, 
          description: "Archive automatique (Bibliothèque)", 
          channel_id: parseInt(channelId),
          audio_path: newTrack.file_path
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      toast.success("Son envoyé et archivé sur votre chaîne !");
      setUploadTitle("");
      setUploadFile(null);
      
      // Rafraîchir la liste
      const res = await api.get("/api/my-tracks", { headers: { Authorization: `Bearer ${user.token}` } });
      setMyTracks(res.data);
    } catch (error) {
      console.error("Erreur archivage:", error);
      toast.error(error.response?.data?.detail || "Erreur lors de l'archivage");
    }
  };

  // VÉRIFIER LE PLANNING
  const checkPlanning = async () => {
      try {
          const res = await api.get(`/api/channels/${channelId}/planning`);
          const now = new Date();
          
          // Chercher s'il y a un créneau actif maintenant
          const currentSlot = res.data.find(slot => {
              const start = new Date(slot.start_time);
              const end = new Date(slot.end_time);
              return now >= start && now <= end;
          });

          if (!currentSlot && !user.is_admin) {
              toast.error("Attention : Vous n'êtes pas programmé pour passer à l'antenne maintenant. Vous pouvez tout de même diffuser, mais cela ne correspond pas au planning public.");
              return false;
          }
          return true;
       } catch {
           return true; // En cas d'erreur API, on laisse passer
       }
  };

  // DÉMARRER LA DIFFUSION
  const startEmission = async () => {
    if (!channelId) {
        toast.error("Veuillez sélectionner une chaîne !");
        return;
    }
    if (!title) {
        toast.error("Donnez un titre à votre émission.");
        return;
    }

    // VÉRIFICATION DU PLANNING (Notification seulement)
    await checkPlanning();

    try {
      console.log("Studio : Démarrage de l'émission...");
      
      // 1. Déclarer le Live en Base de Données
      const emissionRes = await api.post(
        "/api/emissions",
        { 
          title, 
          description, 
          channel_id: parseInt(channelId),
          audio_path: selectedArchive || null 
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      const liveId = emissionRes.data.id;
      setCurrentEmissionId(liveId);

      let finalStream = null;

      if (audioSource === "micro") {
        finalStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = finalStream;
      } else {
        if (!selectedTrack) {
          toast.error("Sélectionnez une musique dans votre bibliothèque !");
          return;
        }
        
        const cleanPath = selectedTrack.replace(/\\/g, "/").replace(/^\/+/, "");
        const trackUrl = `${api.defaults.baseURL}/${cleanPath}`;
        
        console.log("Studio : Streaming du fichier:", trackUrl);

        const fileCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = fileCtx;
        
        audioRef.current.crossOrigin = "anonymous"; 
        audioRef.current.src = trackUrl;

        const sourceNode = fileCtx.createMediaElementSource(audioRef.current);
        const destNode = fileCtx.createMediaStreamDestination();
        
        sourceNode.connect(destNode);
        sourceNode.connect(fileCtx.destination); // Pour s'entendre soi-même
        
        audioSourceNodeRef.current = sourceNode;
        audioDestinationRef.current = destNode;

        await audioRef.current.play();
        finalStream = destNode.stream;
      }

      // 2. CONNEXION WEBSOCKET BROADCASTER
      const wsUrl = api.defaults.baseURL.replace("http", "ws") + `/ws/stream/${channelId}?role=broadcaster`;
      console.log("Studio : Connexion WS ->", wsUrl);
      
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("Studio : WebSocket Broadcaster ouvert");
        
        const broadcastCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });
        const source = broadcastCtx.createMediaStreamSource(finalStream);
        const processor = broadcastCtx.createScriptProcessor(4096, 1, 1);
        
        source.connect(processor);
        processor.connect(broadcastCtx.destination);

        processor.onaudioprocess = (e) => {
          if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0); 
            socketRef.current.send(new Float32Array(inputData).buffer); 
          }
        };

        mediaRecorderRef.current = {
          stop: () => {
            console.log("Studio : Nettoyage processeur");
            processor.disconnect();
            source.disconnect();
            broadcastCtx.close();
          }
        };
        setIsLive(true);
        toast.success("VOUS ÊTES EN DIRECT !");
      };

      socket.onerror = (err) => {
          console.error("Studio : Erreur WS", err);
          toast.error("Erreur de streaming");
          stopEmission();
      };

    } catch (error) {
      console.error("Studio : Erreur globale", error);
      toast.error("Échec du lancement.");
    }
  };

  const stopEmission = async () => {
    console.log("Studio : Fermeture de l'antenne");
    
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    
    if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    
    if (currentEmissionId) {
      try {
        await api.post(`/api/emissions/${currentEmissionId}/stop`, {}, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      } catch (err) {
        console.error("Studio : Erreur stop API", err);
      }
    }

    setIsLive(false);
    setCurrentEmissionId(null);
    toast.success("Antenne coupée");
  };

  return (
    <div className="min-h-screen bg-[#F5F2EE] p-8 grid grid-cols-1 md:grid-cols-2 gap-8 pb-32">
      <audio ref={audioRef} />

      {/* SECTION 1 : BIBLIOTHÈQUE */}
      <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-orange-50 h-fit">
        <h2 className="text-xl font-black text-[#1A1A18] mb-6 flex items-center gap-3">
            <div className="p-2 bg-[#D4480A] rounded-lg shadow-lg shadow-orange-200/30">
                <Music className="text-white" size={18} strokeWidth={2} />
            </div>
            Ma Bibliothèque Audio
        </h2>
        
        <form onSubmit={handleUpload} className="space-y-4 mb-8 p-6 bg-[#FFF3EC] rounded-2xl border border-orange-100">
          <h3 className="text-xs font-black text-[#D4480A] uppercase tracking-widest">Ajouter un nouveau média</h3>
          <input 
            type="text" 
            placeholder="Nom du morceau / Jingle" 
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
            className="w-full p-3 bg-white border border-orange-100 rounded-xl outline-none focus:ring-2 focus:ring-[#D4480A]/20 focus:border-[#D4480A] transition-all text-sm font-bold"
          />
          <div className="relative group">
            <input 
                type="file" 
                accept="audio/mp3, audio/mpeg"
                onChange={(e) => setUploadFile(e.target.files[0])}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-[#D4480A] file:text-white hover:file:bg-[#B83A08] transition-all cursor-pointer"
            />
          </div>
          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-[#D4480A] hover:bg-[#B83A08] text-white p-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-md shadow-orange-200/50 transition-all active:scale-95">
            <Upload size={14} strokeWidth={2.5} /> Envoyer sur le serveur
          </button>
        </form>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Mes Titres</p>
          {myTracks.map((track) => (
            <div 
              key={track.id} 
              onClick={() => toggleTrackPreview(track)}
              className={`p-4 border rounded-2xl cursor-pointer transition-all flex items-center justify-between group ${
                selectedTrack === track.file_path && audioSource === "file"
                  ? "border-[#D4480A] bg-[#FFF3EC] shadow-inner" 
                  : "bg-slate-50 border-slate-50 hover:border-orange-100 hover:bg-white hover:shadow-md"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-all ${selectedTrack === track.file_path && isPlayingTrack ? "bg-[#D4480A] text-white scale-110" : "bg-white text-slate-400 group-hover:text-[#D4480A]"}`}>
                    {selectedTrack === track.file_path && isPlayingTrack ? (
                        <Pause size={14} strokeWidth={2.5} fill="currentColor" />
                    ) : (
                        <Play size={14} strokeWidth={2.5} fill="currentColor" />
                    )}
                </div>
                <span className={`text-sm font-bold truncate ${selectedTrack === track.file_path ? "text-[#D4480A]" : "text-slate-700"}`}>
                    {track.title}
                </span>
              </div>
              
              {selectedTrack === track.file_path && isPlayingTrack && (
                  <div className="flex gap-1 items-end h-3">
                      <div className="w-1 bg-[#D4480A] rounded-full animate-bounce [animation-duration:0.6s]"></div>
                      <div className="w-1 bg-[#D4480A] rounded-full animate-bounce [animation-duration:0.4s]"></div>
                      <div className="w-1 bg-[#D4480A] rounded-full animate-bounce [animation-duration:0.8s]"></div>
                  </div>
              )}
            </div>
          ))}
          {myTracks.length === 0 && (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-400 text-xs font-bold italic tracking-wide">Votre bibliothèque est vide.</p>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2 : CONSOLE DE DIFFUSION */}
      <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-orange-50 h-fit">
        <h1 className="text-2xl font-black text-[#1A1A18] mb-8 flex items-center gap-3">
            <div className="p-2 bg-[#D4480A] rounded-lg shadow-lg shadow-orange-200/30">
                <Radio className="text-white" size={22} strokeWidth={2} />
            </div>
            Console de Diffusion
        </h1>
        
        {!isLive ? (
          <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Titre de l'émission</label>
                <input 
                type="text" 
                placeholder="Ex: Le Morning de Luko" 
                value={title}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-[#D4480A]/20 focus:border-[#D4480A] transition-all text-sm font-bold"
                onChange={(e) => setTitle(e.target.value)}
                />
            </div>
            
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description (Optionnel)</label>
                <textarea 
                placeholder="De quoi allez-vous parler aujourd'hui ?" 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-[#D4480A]/20 focus:border-[#D4480A] transition-all text-sm min-h-[100px]"
                onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            <div className="p-6 bg-[#FFF3EC] rounded-2xl border border-orange-100 space-y-4">
              <span className="block text-xs font-black text-[#D4480A] uppercase tracking-widest mb-2">Choisir la Chaîne de diffusion</span>
              {myChannels.length > 0 ? (
                <select 
                  value={channelId} 
                  onChange={(e) => setChannelId(e.target.value)}
                  className="w-full p-4 bg-white border border-orange-100 rounded-xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-[#D4480A]/20"
                >
                  {myChannels.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              ) : (
                <div className="p-4 bg-white rounded-xl border-2 border-dashed border-orange-200 flex flex-col items-center gap-3">
                    <AlertTriangle className="text-orange-400" size={32} />
                    <p className="text-xs font-bold text-slate-500 text-center">Vous n'avez pas encore de chaîne créée pour diffuser.</p>
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 py-2 px-4 bg-[#D4480A] text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#B83A08] transition-all"
                    >
                        <PlusCircle size={14} /> Créer ma première chaîne
                    </button>
                </div>
              )}
            </div>

            <div className="p-6 bg-[#FFF3EC] rounded-2xl border border-orange-100 space-y-4">
              <span className="block text-xs font-black text-[#D4480A] uppercase tracking-widest mb-2">Attacher une Archive (Optionnel)</span>
              <p className="text-[9px] text-slate-400 font-bold uppercase mb-2">Permet l'écoute hors-ligne pour vos auditeurs</p>
              <select 
                value={selectedArchive} 
                onChange={(e) => setSelectedArchive(e.target.value)}
                className="w-full p-4 bg-white border border-orange-100 rounded-xl outline-none font-bold text-slate-700 focus:ring-2 focus:ring-[#D4480A]/20"
              >
                <option value="">-- Aucune archive --</option>
                {myTracks.map(t => (
                    <option key={t.id} value={t.file_path}>{t.title}</option>
                ))}
              </select>
            </div>

            <div className="p-6 bg-[#FFF3EC] rounded-2xl border border-orange-100 space-y-4">
              <span className="block text-xs font-black text-[#D4480A] uppercase tracking-widest mb-2">Choisir la Source Audio</span>
              <div className="grid grid-cols-1 gap-3">
                <label className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border ${audioSource === "micro" ? "bg-white border-[#D4480A] shadow-md" : "bg-white/50 border-transparent hover:bg-white"}`}>
                    <input 
                    type="radio" 
                    name="source" 
                    value="micro" 
                    className="accent-[#D4480A]"
                    checked={audioSource === "micro"}
                    onChange={() => setAudioSource("micro")} 
                    />
                    <span className="flex items-center gap-2 text-sm font-black text-slate-600">
                      <Mic size={16} strokeWidth={2} className={audioSource === "micro" ? "text-[#D4480A]" : ""} />
                      Microphone en direct
                    </span>
                </label>
                <label className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border ${audioSource === "file" ? "bg-white border-[#D4480A] shadow-md" : "bg-white/50 border-transparent hover:bg-white"}`}>
                    <input 
                    type="radio" 
                    name="source" 
                    value="file" 
                    className="accent-[#D4480A]"
                    checked={audioSource === "file"}
                    onChange={() => setAudioSource("file")} 
                    />
                    <span className="flex items-center gap-2 text-sm font-black text-slate-600">
                      <Music size={16} strokeWidth={2} className={audioSource === "file" ? "text-[#D4480A]" : ""} />
                      Musique de la bibliothèque
                    </span>
                </label>
              </div>
            </div>

            <button 
              onClick={startEmission}
              disabled={myChannels.length === 0}
              className={`w-full flex items-center justify-center gap-3 p-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95 ${
                myChannels.length === 0 
                ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none" 
                : "bg-[#D4480A] hover:bg-[#B83A08] text-white shadow-orange-200/50 hover:-translate-y-1"
              }`}
            >
              <Radio size={20} strokeWidth={2.5} /> Lancer l'antenne
            </button>
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-900 rounded-[2rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4480A]/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#2D7A3A] text-white text-[10px] font-black rounded-full uppercase tracking-widest mb-6 animate-pulse shadow-lg shadow-green-900/50">
                    <span className="w-2 h-2 bg-white rounded-full" />
                    En Direct
                </div>
                <h3 className="text-3xl font-black text-white tracking-tighter mb-2">{title || "Émission sans titre"}</h3>
                <p className="text-orange-100/50 text-xs font-bold uppercase tracking-widest mb-8">
                  Source : {audioSource === "micro" ? "Microphone" : "Bibliothèque"}
                </p>
                
                <div className="flex justify-center gap-4 mb-8">
                    <div className="w-1.5 h-8 bg-[#D4480A] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-12 bg-[#D4480A] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-10 bg-[#D4480A] rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-14 bg-[#D4480A] rounded-full animate-bounce [animation-delay:-0.4s]"></div>
                    <div className="w-1.5 h-8 bg-[#D4480A] rounded-full animate-bounce [animation-delay:-0.2s]"></div>
                </div>

                <button 
                onClick={stopEmission}
                className="flex items-center gap-2 mx-auto bg-[#C0392B] hover:bg-[#A93226] text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-red-900/40 transition-all hover:scale-105"
                >
                <Power size={18} strokeWidth={2} /> Couper le Direct
                </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default Studio;
