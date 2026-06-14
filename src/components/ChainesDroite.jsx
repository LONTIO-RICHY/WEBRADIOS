import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../Api";
import { Radio, Heart, Play, Calendar, Info, Download } from "lucide-react";
import { useAudio } from "../context/AudioContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import CommentSection from "./CommentSection";

export default function ChainesDroite() {
  const { id } = useParams();
  const { user } = useAuth();
  const [chaine, setChaine] = useState(null);
  const [emissions, setEmissions] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const { playChannel, playTrack, stopStreaming, currentChannelId, currentTrack, isPlaying, setCurrentChannel } = useAudio();

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [resChaine, resEmissions, resStatus] = await Promise.all([
          api.get(`/api/channels/${id}`),
          api.get(`/api/channels/${id}/emissions`),
          api.get(`/api/channels/${id}/status`)
        ]);
        setChaine(resChaine.data);
        // On synchronise le contexte audio avec la chaîne qu'on regarde
        setCurrentChannel(resChaine.data);
        
        setEmissions(resEmissions.data);
        setIsLive(resStatus.data.is_live);

        if (user) {
          const resFavs = await api.get("/api/favorites/me", {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setIsFavorite(resFavs.data.some(f => String(f.id) === String(id)));
        }
      } catch (err) {
        console.error("Erreur chargement détails chaîne", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, user]);

  const toggleFavorite = async () => {
    if (!user) {
      toast.error("Connectez-vous pour ajouter des favoris !");
      return;
    }
    try {
      const res = await api.post(`/api/favorites/${id}`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const added = res.data.status === "added";
      setIsFavorite(added);
      if (added) {
        toast.success("Ajouté aux favoris !");
      } else {
        toast("Retiré des favoris", { icon: "🗑️" });
      }
    } catch (err) {
      toast.error("Erreur favoris");
      console.error("Erreur toggle favorite", err);
    }
  };

  if (!id) return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <Radio size={40} strokeWidth={1.5} className="text-slate-300" />
      </div>
      <p className="font-bold tracking-tight">Sélectionnez une chaîne pour explorer son univers</p>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center h-full bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!chaine) return (
    <div className="flex items-center justify-center h-full text-rose-500 font-bold">
      Chaîne introuvable
    </div>
  );

  const handlePlayDirect = () => {
    if (String(currentChannelId) === String(id) && isPlaying) {
      stopStreaming();
    } else {
      playChannel(id);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-y-auto bg-white">
      {/* ── Bannière Hero ── */}
      <div className="relative overflow-hidden bg-[#1A1A18] p-8 md:p-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4480A]/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="w-32 h-32 bg-[#D4480A] rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-orange-900/50 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
            {chaine.name.charAt(0).toUpperCase()}
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              {isLive && (
                <span className="px-3 py-1 bg-[#2D7A3A] text-white text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-green-900/20">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  En Direct
                </span>
              )}
              <span className="px-3 py-1 bg-white/10 text-white/70 text-[10px] font-black rounded-full uppercase tracking-widest backdrop-blur-md">
                {chaine.payment_method}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">{chaine.name}</h1>
            <p className="text-orange-100/70 font-medium flex items-center justify-center md:justify-start gap-2 italic">
              <Info size={16} strokeWidth={2} /> Créé par {chaine.owner_name}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-8 bg-[#F5F2EE]/50">
        <div className="lg:col-span-2 space-y-8">
          {/* ── Liste des Émissions ── */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-[#1A1A18] tracking-tight flex items-center gap-2">
                <Calendar className="text-[#D4480A]" size={20} strokeWidth={2} /> Emissions & Programmes
              </h3>
              <span className="text-xs font-bold text-gray-400 bg-white px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                {emissions.length} émissions
              </span>
            </div>

            {emissions.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {emissions.map((e) => (
                  <div key={e.id} className="group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-[#F07A3A]/30 hover:shadow-xl hover:shadow-orange-100/50 transition-all">
                    <div 
                      onClick={handlePlayDirect}
                      className="w-14 h-14 bg-[#FFF3EC] rounded-xl flex items-center justify-center text-[#D4480A] group-hover:bg-[#D4480A] group-hover:text-white transition-colors duration-300 cursor-pointer"
                    >
                      <Play size={24} strokeWidth={2.5} fill="currentColor" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-[#1A1A18] group-hover:text-[#D4480A] transition-colors">{e.title}</h4>
                      <p className="text-sm text-gray-500 line-clamp-1">{e.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                          onClick={async () => {
                            if (!user) return toast.error("Connectez-vous !");
                            try {
                              await api.post(`/api/library/${e.id}`, {}, { headers: { Authorization: `Bearer ${user.token}` } });
                              toast.success("Sauvegardé dans votre collection");
                            } catch (err) { toast.error("Erreur sauvegarde"); }
                          }}
                          className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-orange-50 hover:text-[#D4480A] transition-all"
                          title="Sauvegarder dans ma bibliothèque"
                        >
                          <Download size={18} strokeWidth={2.5} />
                        </button>
                        <button 
                          onClick={() => {
                            if (e.audio_path) {
                                playTrack({ title: e.title, file_path: e.audio_path });
                            } else {
                                handlePlayDirect();
                            }
                          }}
                          className={`px-4 py-2 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${
                            (e.audio_path ? (currentTrack?.title === e.title && isPlaying) : (String(currentChannelId) === String(id) && isPlaying))
                            ? "bg-[#D4480A] text-white" 
                            : "bg-[#FFF3EC] text-[#D4480A] hover:bg-[#D4480A] hover:text-white"
                          }`}
                        >
                          {(e.audio_path ? (currentTrack?.title === e.title && isPlaying) : (String(currentChannelId) === String(id) && isPlaying)) ? "En écoute" : (e.audio_path ? "Lire l'archive" : "Écouter")}
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 bg-white border border-dashed border-gray-200 rounded-3xl text-center">
                <p className="text-slate-400 font-bold italic">Aucune émission programmée pour le moment</p>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          {/* ── Actions & Infos Rapides ── */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h4 className="font-black text-[#1A1A18] mb-4 uppercase text-xs tracking-[0.2em] border-b border-gray-50 pb-2">Actions</h4>
            <div className="space-y-3">
              <button 
                onClick={handlePlayDirect}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm shadow-xl transition-all ${
                  String(currentChannelId) === String(id) && isPlaying
                  ? "bg-[#2D7A3A] text-white shadow-green-200/50"
                  : "bg-[#D4480A] text-white shadow-orange-200/50 hover:bg-[#B83A08] hover:-translate-y-1"
                }`}
              >
                <Play size={20} strokeWidth={2.5} fill="currentColor" /> 
                {String(currentChannelId) === String(id) && isPlaying ? "ARRÊTER L'ÉCOUTE" : "ÉCOUTER LE DIRECT"}
              </button>
              <button 
                onClick={toggleFavorite}
                className={`w-full flex items-center justify-center gap-2 py-4 border-2 rounded-2xl font-black text-sm transition-all ${
                  isFavorite 
                  ? "bg-[#FFF3EC] border-[#D4480A] text-[#D4480A]" 
                  : "border-[#FFF3EC] text-[#D4480A] hover:bg-[#FFF3EC]"
                }`}
              >
                <Heart size={20} strokeWidth={2} fill={isFavorite ? "currentColor" : "none"} /> 
                {isFavorite ? "DANS MES FAVORIS" : "AJOUTER AUX FAVORIS"}
              </button>
            </div>
          </div>

          <div className="bg-[#D4480A] p-6 rounded-3xl text-white shadow-xl shadow-orange-900/20">
            <p className="text-[10px] font-black text-orange-200 uppercase tracking-widest mb-1">Contact Antenne</p>
            <p className="text-xl font-black tracking-tight mb-4">{chaine.phone}</p>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <p className="text-[10px] text-orange-100 font-bold leading-relaxed italic">
                Soutenez cette chaîne pour qu'elle continue de vous offrir du contenu de qualité.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ZONE DE COMMENTAIRES */}
      <CommentSection channelId={id} />
    </div>
  );
}
