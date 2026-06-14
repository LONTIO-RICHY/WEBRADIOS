// EmissionsDroite.jsx — Détail de l'émission sélectionnée (colonne droite)
// Lit l'id dans l'URL via useParams() → affiche les infos complètes
// Backend : remplacer EMISSIONS.find() par fetch("GET /api/emissions/:id")

import { useParams } from "react-router-dom";
import { EMISSIONS } from "./emissions.data";
import { Play, Calendar, Radio, Heart } from "lucide-react";
import CommentSection from "./CommentSection";
import { useAudio } from "../context/AudioContext";
import toast from "react-hot-toast";

export default function EmissionsDroite() {
  const { id } = useParams();
  const { playChannel, isPlaying, currentChannelId } = useAudio();

  const e = EMISSIONS.find((em) => String(em.id) === id);

  if (!e) return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-white">
      <div className="w-20 h-20 bg-[#F5F2EE] rounded-full flex items-center justify-center mb-4">
        <Play size={40} strokeWidth={1.5} className="text-[#D4480A]/20" />
      </div>
      <p className="font-black text-xs uppercase tracking-[0.2em]">Sélectionnez un programme</p>
    </div>
  );

  const handlePlay = () => {
    if (e.channel_id) {
        playChannel(e.channel_id);
    } else {
        toast.error("Cette émission n'est pas rattachée à un flux direct.");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">

      {/* ── Bannière hero ── */}
      <div className="relative overflow-hidden bg-[#1A1A18] p-8 md:p-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4480A]/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className={`${e.couleur} w-32 h-32 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-2xl`}>
            {e.initials}
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              {e.live && (
                <span className="px-3 py-1 bg-[#2D7A3A] text-white text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  En Direct
                </span>
              )}
              <span className="px-3 py-1 bg-white/10 text-white/70 text-[10px] font-black rounded-full uppercase tracking-widest backdrop-blur-md">
                {e.chaine}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-1 uppercase">{e.nom}</h1>
            <p className="text-orange-100/50 font-bold text-xs uppercase tracking-widest italic">{e.horaire}</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-10 bg-[#F5F2EE]/30">

        {/* ── Description ── */}
        <section>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">À propos de l'émission</h3>
          <p className="text-slate-600 leading-relaxed font-medium bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">{e.description}</p>
        </section>

        {/* ── Animateurs ── */}
        <section>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 text-center md:text-left">L'Équipe Antenne</h3>
          <div className="flex gap-4 flex-wrap justify-center md:justify-start">
            {e.animateurs.map((a) => (
              <div key={a.nom} className="flex items-center gap-4 bg-white rounded-[2rem] p-4 border border-orange-50 shadow-sm pr-8">
                <div className={`${a.couleur} w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xs font-black shadow-md`}>
                  {a.initials}
                </div>
                <div>
                  <p className="text-sm font-black text-[#1A1A18] uppercase tracking-tight">{a.nom}</p>
                  <p className="text-[10px] font-bold text-[#D4480A] uppercase tracking-widest">{a.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Actions & Prochaines diffusions ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="bg-white p-6 rounded-[2.5rem] border border-orange-50 shadow-xl">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Calendar size={14} strokeWidth={2} className="text-[#D4480A]" /> Planning
                </h3>
                <div className="space-y-3">
                    {e.diffusions.map((d) => (
                    <div key={d.jour} className={`flex items-center justify-between p-4 rounded-2xl border
                        ${d.today ? "bg-[#FFF3EC] border-[#D4480A]" : "bg-slate-50 border-slate-50"}`}>
                        <div className="flex items-center gap-3">
                            <span className={`text-xs font-black uppercase tracking-tight ${d.today ? "text-[#D4480A]" : "text-slate-700"}`}>{d.jour}</span>
                            {d.today && <span className="w-1.5 h-1.5 bg-[#D4480A] rounded-full animate-ping"></span>}
                        </div>
                        <span className="text-xs font-bold text-slate-400">{d.heure}</span>
                    </div>
                    ))}
                </div>
            </section>

            <section className="flex flex-col gap-3 justify-center">
                <button 
                    onClick={handlePlay}
                    className={`w-full flex items-center justify-center gap-3 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:-translate-y-1 ${
                        currentChannelId === e.channel_id && isPlaying
                        ? "bg-[#2D7A3A] text-white animate-pulse"
                        : "bg-[#D4480A] text-white shadow-orange-200/50 hover:bg-[#B83A08]"
                    }`}
                >
                    <Play size={20} strokeWidth={2.5} fill="currentColor" /> 
                    {currentChannelId === e.channel_id && isPlaying ? "EN COURS D'ÉCOUTE" : "ÉCOUTER MAINTENANT"}
                </button>
                <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-2 py-4 border-2 border-orange-100 text-[#D4480A] rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-[#FFF3EC] transition-all">
                        <Radio size={16} strokeWidth={2} /> RAPPEL
                    </button>
                    <button className="flex items-center justify-center gap-2 py-4 border-2 border-orange-100 text-[#D4480A] rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-[#FFF3EC] transition-all">
                        <Heart size={16} strokeWidth={2} /> FAVORIS
                    </button>
                </div>
            </section>
        </div>

        <CommentSection emissionId={id} />
      </div>
    </div>
  );
}
