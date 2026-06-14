// Plus besoin de useParams — reçoit l'id directement via props
import { CATEGORIES } from "./categories.data";
import { Radio, Compass, Play } from "lucide-react";
import { useAudio } from "../context/AudioContext";

export default function CategoriesDroite({ id }) {
  const { playChannel, currentChannelId, isPlaying } = useAudio();
  const cat = CATEGORIES.find((c) => String(c.id) === String(id));

  if (!cat) return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-white">
      <div className="w-20 h-20 bg-[#F5F2EE] rounded-full flex items-center justify-center mb-4">
        <Radio size={40} strokeWidth={1.5} className="text-[#D4480A]/20" />
      </div>
      <p className="font-black text-xs uppercase tracking-[0.2em]">Choisissez un genre à explorer</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">

      <div className="p-8 md:p-12 bg-[#1A1A18] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4480A]/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-24 h-24 bg-[#D4480A] rounded-3xl flex items-center justify-center text-5xl shadow-2xl shadow-orange-900/50 transform -rotate-3">
            {cat.emoji}
          </div>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">{cat.nom}</h1>
            <p className="text-orange-100/50 font-bold text-xs uppercase tracking-widest mt-2">{cat.meta}</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-10 bg-[#F5F2EE]/30">

        <section>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
            <Compass size={14} strokeWidth={2.5} className="text-[#D4480A]" /> Chaînes de ce genre
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cat.chaines.map((c) => (
              <div key={c.nom} className="flex items-center gap-4 p-5 bg-white rounded-[2rem] border border-orange-50 shadow-sm hover:shadow-xl hover:border-[#D4480A]/20 transition-all group">
                <div className="w-14 h-14 bg-[#1A1A18] rounded-2xl flex items-center justify-center text-white text-lg font-black group-hover:bg-[#D4480A] transition-colors">
                  {c.initials}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-[#1A1A18] uppercase tracking-tight">{c.nom}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.auditeurs} auditeurs</p>
                </div>
                <button 
                  onClick={() => playChannel(c.id || 1)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm ${
                    isPlaying && String(currentChannelId) === String(c.id || 1)
                    ? "bg-[#D4480A] text-white"
                    : "bg-[#FFF3EC] text-[#D4480A] hover:bg-[#D4480A] hover:text-white"
                  }`}
                >
                   <Play size={20} strokeWidth={2.5} fill="currentColor" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Émissions Populaires</h3>
          <div className="space-y-3">
            {cat.emissions.map((e) => (
              <div key={e.nom}
                className={`flex items-center justify-between p-5 rounded-2xl border transition-all
                  ${e.live ? "bg-white border-[#D4480A] shadow-lg shadow-orange-100" : "bg-white border-slate-100 hover:border-orange-100"}`}>
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${e.live ? "bg-[#D4480A] text-white" : "bg-slate-50 text-slate-400"}`}>
                        <Radio size={18} strokeWidth={2} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-[#1A1A18] uppercase tracking-tight">{e.nom}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{e.info}</p>
                    </div>
                </div>
                {e.live && (
                  <span className="px-3 py-1 bg-[#2D7A3A] text-white text-[10px] font-black rounded-full uppercase tracking-widest animate-pulse">
                    LIVE
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}