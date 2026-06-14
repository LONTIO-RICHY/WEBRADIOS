// EmissionsGauche.jsx — Liste des émissions (colonne gauche)
// Clic sur une émission → change l'URL → /emissions/:id
// EmissionsDroite lit useParams() et affiche le détail

import { Link, useParams } from "react-router-dom";
import { EMISSIONS } from "./emissions.data";
import { Search, Play } from "lucide-react";

const ONGLETS = ["En direct", "À venir", "Replay"];

export default function EmissionsGauche() {
  const { id } = useParams();

  return (
    <div className="flex flex-col h-full bg-[#F5F2EE] border-r border-slate-200">

      <h2 className="px-6 py-4 text-xl font-black text-[#1A1A18] border-b border-slate-100 flex items-center gap-2">
         <div className="p-2 bg-[#D4480A] rounded-lg shadow-lg shadow-orange-200/30">
            <Play className="text-white" size={18} strokeWidth={2} fill="currentColor" />
         </div>
         Émissions
      </h2>

      <div className="px-4 py-4 space-y-4">
        <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#D4480A] transition-colors" size={16} strokeWidth={2} />
            <input
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-[#D4480A]/20 focus:border-[#D4480A] transition-all shadow-sm"
            />
        </div>

        <div className="flex gap-2">
            {ONGLETS.map((o, i) => (
            <button key={o}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all
                ${i === 0
                    ? "bg-[#D4480A] text-white shadow-md shadow-orange-200"
                    : "bg-white text-slate-400 hover:text-[#D4480A] border border-slate-100"}`}>
                {o}
            </button>
            ))}
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto px-4 space-y-2 pb-10 custom-scrollbar">
        {EMISSIONS.map((e) => {
          const estActif = String(e.id) === id;

          return (
            <Link to={`/emissions/${e.id}`} key={e.id}>
              <li className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border
                ${estActif
                  ? "bg-white border-[#D4480A] shadow-xl shadow-orange-100 translate-x-1"
                  : "bg-white border-transparent hover:border-orange-100 hover:shadow-md"}`}>

                <div className={`${e.couleur} w-11 h-11 rounded-xl flex items-center
                  justify-center text-white text-xs font-black shadow-sm group-hover:scale-110 transition-transform`}>
                  {e.initials}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-black uppercase tracking-tight truncate ${estActif ? "text-[#D4480A]" : "text-[#1A1A18]"}`}>{e.nom}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{e.horaire}</p>
                </div>

                {e.live && (
                  <div className="w-2 h-2 bg-[#2D7A3A] rounded-full animate-pulse shadow-lg shadow-green-200"></div>
                )}
              </li>
            </Link>
          );
        })}
      </ul>
    </div>
  );
}
