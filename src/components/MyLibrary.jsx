import { useEffect, useState } from "react";
import api from "../Api";
import { useAuth } from "../context/AuthContext";
import { useAudio } from "../context/AudioContext";
import { Download, Play, Music, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function MyLibrary() {
    const { user } = useAuth();
    const { playTrack, playChannel, currentTrack, currentChannelId, isPlaying } = useAudio();
    const [savedTracks, setSavedTracks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLibrary = async () => {
        if (!user || !user.token) return;
        setLoading(true);
        try {
            const res = await api.get("/api/library/me", {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setSavedTracks(res.data);
        } catch (err) {
            console.error("Erreur chargement bibliothèque", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        if (user && user.token) {
            fetchLibrary();
        }
        return () => { isMounted = false; };
    }, [user?.token]);

    const removeTrack = async (trackId) => {
        try {
            await api.post(`/api/library/${trackId}`, {}, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            toast.success("Retiré de la bibliothèque");
            fetchLibrary();
        } catch (err) {
            toast.error("Erreur suppression");
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F2EE] p-8 pb-32">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12 flex items-center gap-4">
                    <div className="p-4 bg-[#D4480A] rounded-3xl shadow-xl shadow-orange-200/50">
                        <Download className="text-white" size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-[#1A1A18] tracking-tighter uppercase">Ma Bibliothèque</h1>
                        <p className="text-slate-500 font-bold text-sm tracking-widest uppercase mt-1">Vos émissions & musiques sauvegardées</p>
                    </div>
                </header>

                {loading ? (
                    <div className="grid grid-cols-1 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-white rounded-3xl animate-pulse border border-gray-100" />
                        ))}
                    </div>
                ) : savedTracks.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {savedTracks.map((track) => (
                            <div key={track.id} className="group flex items-center gap-6 p-6 bg-white rounded-[2rem] border border-gray-100 hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-100/50 transition-all">
                                <div className="w-14 h-14 bg-[#FFF3EC] rounded-2xl flex items-center justify-center text-[#D4480A] group-hover:bg-[#D4480A] group-hover:text-white transition-all duration-300">
                                    <Music size={24} strokeWidth={2.5} />
                                </div>
                                
                                <div className="flex-1">
                                    <h3 className="font-black text-[#1A1A18] uppercase tracking-tight group-hover:text-[#D4480A] transition-colors">{track.title}</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Format Audio HD</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => (track.file_path) ? playTrack(track) : playChannel(track.channel_id)}
                                        className={`p-4 rounded-2xl shadow-lg transition-all active:scale-90 ${
                                            (track.file_path ? currentTrack?.id === track.id : currentChannelId === track.channel_id) && isPlaying
                                            ? "bg-[#2D7A3A] text-white animate-pulse"
                                            : "bg-[#D4480A] text-white hover:bg-[#B83A08]"
                                        }`}
                                    >
                                        <Play size={20} fill="currentColor" />
                                    </button>
                                    <button 
                                        onClick={() => removeTrack(track.id)}
                                        className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                        <Download size={64} className="mx-auto mb-6 text-slate-200" />
                        <h2 className="text-xl font-black text-slate-400 uppercase tracking-tight">Votre bibliothèque est vide</h2>
                        <p className="text-slate-400 text-sm mt-2">Parcourez les chaînes pour sauvegarder des émissions.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
