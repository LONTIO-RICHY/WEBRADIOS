import { useState, useEffect } from "react";
import api from "../Api";
import { Radio, MapPin, Globe, Search, Music, Trophy, Leaf, GraduationCap, Newspaper, Palette } from "lucide-react";

export default function CategoriesGauche({ activeId, activeRegion, onSelectGenre, onSelectRegion }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("genres"); // 'genres' or 'regions'

  const CAMEROON_REGIONS = [
    "Toutes les régions", "Adamaoua", "Centre", "Est", "Extrême-Nord", "Littoral", "Nord", "Nord-Ouest", "Ouest", "Sud", "Sud-Ouest"
  ];

  const getIcon = (name, size = 24, className = "") => {
    const icons = {
      "Musique": <Music size={size} className={className} />,
      "Sport": <Trophy size={size} className={className} />,
      "Environnement": <Leaf size={size} className={className} />,
      "Éducation": <GraduationCap size={size} className={className} />,
      "Actualités": <Newspaper size={size} className={className} />,
      "Culture": <Palette size={size} className={className} />
    };
    return icons[name] || <Radio size={size} className={className} />;
  };

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get("/api/categories");
        setCategories(res.data);
      } catch (err) {
        console.error("Erreur chargement catégories", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#F5F2EE] border-r border-slate-200">

      <h2 className="px-6 py-4 text-xl font-black text-[#1A1A18] border-b border-slate-100 flex items-center justify-between gap-2">
         <div className="flex items-center gap-2">
            <div className="p-2 bg-[#D4480A] rounded-lg shadow-lg shadow-orange-200/30">
                <Globe className="text-white" size={18} strokeWidth={2} />
            </div>
            Exploration
         </div>
         {(activeId || activeRegion) && (
           <button 
            onClick={() => { onSelectGenre(null); onSelectRegion(null); }}
            className="text-[10px] font-black text-[#D4480A] uppercase tracking-tighter hover:underline"
           >
            Réinitialiser
           </button>
         )}
      </h2>

      {/* Tabs Selector */}
      <div className="flex p-2 bg-white/50 m-4 rounded-2xl border border-orange-50">
        <button 
          onClick={() => setActiveTab("genres")}
          className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative
            ${activeTab === "genres" ? "bg-[#1A1A18] text-white shadow-lg" : "text-slate-400 hover:text-[#1A1A18]"}`}
        >
          Par Genre
          {activeId && activeTab !== "genres" && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#D4480A] rounded-full border-2 border-white"></span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab("regions")}
          className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative
            ${activeTab === "regions" ? "bg-[#1A1A18] text-white shadow-lg" : "text-slate-400 hover:text-[#1A1A18]"}`}
        >
          Par Région
          {activeRegion && activeTab !== "regions" && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#D4480A] rounded-full border-2 border-white"></span>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar">
        {activeTab === "genres" ? (
          loading ? (
            <div className="p-10 text-center text-slate-400 font-bold animate-pulse">Chargement...</div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {categories.map((cat) => {
                const estActif = String(cat.id) === String(activeId);

                return (
                  <div
                    key={cat.id}
                    onClick={() => onSelectGenre(cat.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center gap-4
                      ${estActif
                        ? "bg-white border-[#D4480A] shadow-xl shadow-orange-100"
                        : "bg-white border-transparent hover:border-orange-100 hover:shadow-md"}`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${estActif ? "bg-[#FFF3EC] text-[#D4480A]" : "bg-slate-50 text-slate-400"}`}>
                      {getIcon(cat.name, 24)}
                    </div>
                    <div className="flex-1">

                        <p className={`text-sm font-black uppercase tracking-tight ${estActif ? "text-[#D4480A]" : "text-[#1A1A18]"}`}>
                        {cat.name}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {cat.channels_count} CHAÎNES · {cat.emissions_count} ÉMISSIONS
                        </p>
                    </div>
                    {estActif && <div className="w-2 h-2 bg-[#D4480A] rounded-full animate-pulse"></div>}
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {CAMEROON_REGIONS.map((reg) => {
              const estActif = activeRegion === reg;

              return (
                <div
                  key={reg}
                  onClick={() => onSelectRegion(reg)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center gap-4
                    ${estActif
                      ? "bg-white border-[#D4480A] shadow-xl shadow-orange-100"
                      : "bg-white border-transparent hover:border-orange-100 hover:shadow-md"}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${estActif ? "bg-[#FFF3EC] text-[#D4480A]" : "bg-slate-50 text-slate-400"}`}>
                    <MapPin size={24} />
                  </div>
                  <div className="flex-1">
                      <p className={`text-sm font-black uppercase tracking-tight ${estActif ? "text-[#D4480A]" : "text-[#1A1A18]"}`}>
                      {reg}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Région du Cameroun
                      </p>
                  </div>
                  {estActif && <div className="w-2 h-2 bg-[#D4480A] rounded-full animate-pulse"></div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}