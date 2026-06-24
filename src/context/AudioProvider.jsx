import { useState, useRef, useEffect, useMemo } from "react";
import api from "../Api";
import { AudioContext } from "./AudioContext";

export function AudioProvider({ children }) {
    const [currentChannel, setCurrentChannel] = useState(null);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [currentEmission, setCurrentEmission] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [statusMessage, setStatusMessage] = useState("Prêt pour l'écoute");
    
    const currentChannelId = currentChannel?.id;
    
    const socketRef = useRef(null);
    const audioCtxRef = useRef(null);
    const nextStartTimeRef = useRef(0);
    const htmlAudioRef = useRef(null);

    const stopStreaming = () => {
        setIsPlaying(false);
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }
        if (audioCtxRef.current) {
            try {
                audioCtxRef.current.close();
            } catch {
                // ignore
            }
            audioCtxRef.current = null;
        }
        if (htmlAudioRef.current) {
            try {
                htmlAudioRef.current.pause();
                htmlAudioRef.current.removeAttribute('src');
                htmlAudioRef.current.load();
            } catch {
                // ignore
            }
        }
        
        setStatusMessage("Écoute arrêtée");
        console.log("Audio : Système arrêté");
    };

    const playEmission = (emission) => {
        if (!emission || (!emission.stream_url && !emission.audio_path)) {
            console.warn("Audio : Pas de source pour cette émission", emission);
            setStatusMessage("Indisponible");
            return;
        }

        stopStreaming();
        setCurrentChannel(null);
        setCurrentTrack(null);
        setCurrentEmission(emission);
        setIsPlaying(true);
        setStatusMessage(`EN COURS — ${emission.title}`);

        let url = emission.stream_url;
        if (!url && emission.audio_path) {
            const cleanPath = emission.audio_path.replace(/\\/g, "/").replace(/^\/+/, "");
            url = `${api.defaults.baseURL}/${cleanPath}`;
        }
        
        console.log("Audio : Lecture émission ->", url);
        
        if (htmlAudioRef.current) {
            // Pas de crossOrigin pour les flux externes pour éviter les blocages CORS
            htmlAudioRef.current.removeAttribute("crossOrigin");
            htmlAudioRef.current.src = url;
            htmlAudioRef.current.play().catch(err => {
                console.error("Audio : Erreur play() émission", err);
                setStatusMessage("Erreur de lecture");
                setIsPlaying(false);
            });
        }
    };

    const playChannel = async (channel) => {
        const channelId = typeof channel === 'object' ? channel.id : channel;
        let channelData = typeof channel === 'object' ? channel : null;

        console.log("Audio : playChannel appelé pour ID", channelId, channelData);

        // On force la récupération des données fraîches pour être sûr d'avoir l'auth_word
        try {
            const res = await api.get(`/api/channels/${channelId}`);
            channelData = res.data;
            console.log("Audio : Données canal récupérées", channelData);
        } catch (err) {
            console.error("Audio : Erreur récup canal", err);
        }

        // Cas spécial : Radio-Browser (Importées)
        if (channelData && (channelData.auth_word === "radiobrowser" || channelData.payment_method === "Import")) {
            console.log("Audio : Canal importé détecté via auth_word, recherche du flux...");
            try {
                const resEm = await api.get(`/api/channels/${channelId}/emissions`);
                console.log("Audio : Émissions du canal", resEm.data);
                const liveEm = resEm.data.find(e => e.is_live && e.stream_url);
                if (liveEm) {
                    console.log("Audio : Flux externe trouvé, redirection vers playEmission", liveEm.stream_url);
                    playEmission(liveEm);
                    return;
                } else {
                    console.warn("Audio : Aucune émission LIVE avec stream_url trouvée pour ce canal importé");
                }
            } catch (err) {
                console.error("Audio : Erreur recherche flux externe", err);
            }
        }

        console.log("Audio : Passage en mode WebSocket (Direct local)");

        // Initialiser l'AudioContext pour le mode WebSocket (Direct local)
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            audioCtxRef.current = new AudioContextClass({ sampleRate: 44100 });
        }
        
        const audioCtx = audioCtxRef.current;
        if (audioCtx.state === 'suspended') {
            await audioCtx.resume();
        }

        // Si on clique sur le même canal déjà en cours de lecture, on arrête
        if (currentChannel?.id === channelId && isPlaying) {
            stopStreaming();
            return;
        }
        
        // Nettoyage avant nouvelle connexion
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }
        if (htmlAudioRef.current) {
            try {
                htmlAudioRef.current.pause();
                htmlAudioRef.current.removeAttribute('src');
                htmlAudioRef.current.load();
            } catch {
                // ignore
            }
        }

        setCurrentTrack(null);
        setCurrentEmission(null);
        setCurrentChannel(channelData || { id: channelId, name: "Radio en direct" });

        setIsPlaying(true);
        setStatusMessage("Connexion...");

        // On se connecte TOUJOURS en tant que listener depuis le Player global
        const wsUrl = api.defaults.baseURL.replace("http", "ws") + `/ws/stream/${channelId}?role=listener`;
        nextStartTimeRef.current = audioCtx.currentTime;

        console.log("Audio : Tentative de connexion listener ->", wsUrl);

        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;
        socket.binaryType = "arraybuffer";

        socket.onopen = () => {
            console.log(`Audio : Connecté au flux de la chaîne ${channelId}`);
            setStatusMessage("● EN DIRECT");
        };

        socket.onmessage = (event) => {
            // Vérifier que le contexte est toujours valide
            if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
            const ctx = audioCtxRef.current;
            
            if (ctx.state === 'suspended') ctx.resume();

            const float32Array = new Float32Array(event.data);
            if (float32Array.length === 0) return;

            const audioBuffer = ctx.createBuffer(1, float32Array.length, 44100);
            audioBuffer.getChannelData(0).set(float32Array);
            
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            
            // Gestion du buffer temporel pour éviter les craquements
            const now = ctx.currentTime;
            if (nextStartTimeRef.current < now) {
                nextStartTimeRef.current = now + 0.1; // Petit buffer de sécurité
            }
            
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
        };

        socket.onclose = (e) => {
            console.log("Audio : WebSocket fermé", e.code);
            // Si on n'a pas arrêté manuellement, c'est peut-être une fin de stream
            if (isPlaying && socketRef.current === socket) {
                setIsPlaying(false);
                setStatusMessage("Stream terminé");
            }
        };

        socket.onerror = (err) => {
            console.error("Audio : Erreur WebSocket", err);
            setStatusMessage("Erreur de connexion");
            setIsPlaying(false);
        };
    };

    const playTrack = (track) => {
        if (!track || !track.file_path) {
            console.warn("Audio : Pas de fichier", track);
            setStatusMessage("Audio non disponible");
            return;
        }

        // Si on clique sur la même musique qui joue déjà, on recommence au début
        if (currentTrack?.id === track.id && isPlaying && htmlAudioRef.current) {
            console.log("Audio : Relecture de la piste actuelle");
            htmlAudioRef.current.currentTime = 0;
            htmlAudioRef.current.play();
            return;
        }

        stopStreaming();
        setCurrentChannel(null);
        setCurrentTrack(track);
        setIsPlaying(true);
        setStatusMessage(`Lecture : ${track.title}`);

        const cleanPath = track.file_path.replace(/\\/g, "/").replace(/^\/+/, "");
        const trackUrl = `${api.defaults.baseURL}/${cleanPath}`;
        
        console.log("Audio : Lecture fichier ->", trackUrl);
        
        if (htmlAudioRef.current) {
            htmlAudioRef.current.removeAttribute("crossOrigin");
            htmlAudioRef.current.src = trackUrl;
            htmlAudioRef.current.volume = 1.0;
            htmlAudioRef.current.play().catch(err => {
                console.error("Audio : Erreur play()", err);
                setStatusMessage("Erreur de lecture");
                setIsPlaying(false);
            });
        }
    };

    const togglePlay = async () => {
        const path = window.location.pathname;
        const searchPath = window.location.search;
        console.log("Audio : TogglePlay appelé", { isPlaying, currentChannelId: currentChannel?.id, path, searchPath });
        
        if (isPlaying) {
            console.log("Audio : Arrêt demandé");
            stopStreaming();
            return;
        }

        // 1. Si on a déjà un canal, track ou émission en mémoire
        if (currentChannel) {
            console.log("Audio : Lecture du canal en mémoire", currentChannel.id);
            await playChannel(currentChannel);
            return;
        } 
        
        if (currentTrack) {
            console.log("Audio : Lecture du track en mémoire", currentTrack.title);
            playTrack(currentTrack);
            return;
        }

        if (currentEmission) {
            console.log("Audio : Lecture de l'émission en mémoire", currentEmission.title);
            playEmission(currentEmission);
            return;
        }

        // 2. Tentative de récupération auto via l'URL
        const normalizedPath = path.toLowerCase();
        
        // Pattern A: /chaines/:id ou /ChannelDashboard/:id
        if (normalizedPath.includes("/chaines/") || normalizedPath.includes("/channeldashboard/")) {
            const segments = path.split("/");
            // On cherche le dernier segment numérique
            let id = null;
            for (let i = segments.length - 1; i >= 0; i--) {
                if (segments[i] && !isNaN(segments[i])) {
                    id = segments[i];
                    break;
                }
            }
            if (id) {
                console.log("Audio : Récupération auto ID", id);
                await playChannel(parseInt(id));
                return;
            }
        }

        // Pattern B: /Studio?channel_id=:id
        if (normalizedPath.includes("/studio")) {
            const params = new URLSearchParams(searchPath);
            const id = params.get("channel_id");
            if (id && !isNaN(id)) {
                console.log("Audio : Récupération auto via Studio ID", id);
                await playChannel(parseInt(id));
                return;
            }
        }

        setStatusMessage("Sélectionnez une radio");
        console.log("Audio : Rien à lire (Aucun contexte trouvé dans l'URL ou l'état)");
    };

    useEffect(() => {
        return () => stopStreaming();
    }, []);

    const value = useMemo(() => ({
        currentChannel,
        setCurrentChannel,
        currentChannelId,
        currentTrack,
        setCurrentTrack,
        currentEmission,
        setCurrentEmission,
        isPlaying, 
        statusMessage, 
        playChannel, 
        playTrack,
        playEmission,
        stopStreaming,
        togglePlay 
    }), [currentChannel, currentChannelId, currentTrack, currentEmission, isPlaying, statusMessage]);

    return (
        <AudioContext.Provider value={value}>
            {children}
            <audio ref={htmlAudioRef} style={{ display: 'none' }} />
        </AudioContext.Provider>
    );
}
