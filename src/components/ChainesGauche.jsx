// ChainesGauche.jsx — Liste des chaînes (colonne gauche)
// Chaque chaîne est un lien React Router vers /chaines/:id
// La colonne droite (ChainesDroite) lit l'id dans l'URL via useParams()

import { Link, useParams } from "react-router-dom";
import { Search, Radio, Compass, Heart, Download } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../Api";
import { useAuth } from "../context/AuthContext";
import { ChannelSkeleton } from "./Skeleton";

export default function ChainesGauche() {
  const { id } = useParams();
  const { user } = useAuth();
  const [mesChaines, setMesChaines] = useState([]);
  const [mesFavoris, setMesFavoris] = useState([]);
  const [toutesLesChaines, setToutesLesChaines] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChannels = async () => {
      setLoading(true);
      try {
        const resAll = await api.get("/api/channels");
        setToutesLesChaines(resAll.data);

        if (user) {
          const [resMy, resFavs] = await Promise.all([
            api.get("/api/my-channels", {
              headers: { Authorization: `Bearer ${user.token}` }
            }),
            api.get("/api/favorites/me", {
              headers: { Authorization: `Bearer ${user.token}` }
            })
          ]);
          setMesChaines(resMy.data);
          setMesFavoris(resFavs.data);
        }
      } catch (err) {
        console.error("Erreur chargement des chaînes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChannels();
  }, [user]);

  const filteredChannels = toutesLesChaines.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-[#F5F2EE] border-r border-slate-200">
      <div className="p-6">
        <h2 className="text-xl font-black text-[#1A1A18] flex items-center gap-2 mb-6">
          <div className="p-2 bg-[#D4480A] rounded-lg shadow-lg shadow-orange-200/50">
            <Radio className="text-white" size={20} strokeWidth={2} />
          </div>
          Exploration
        </h2>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#D4480A] transition-colors" size={18} strokeWidth={2} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une chaîne..."
            className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#D4480A]/20 focus:border-[#D4480A] transition-all shadow-sm"
          />
        </div>

        {/* Accès rapide Bibliothèque */}
        <Link to="/MaBibliotheque">
          <div className="mt-6 p-4 bg-[#FFF3EC] border border-orange-100 rounded-2xl flex items-center gap-3 hover:shadow-lg hover:border-orange-200 transition-all group">
            <div className="p-2 bg-[#D4480A] rounded-lg text-white group-hover:scale-110 transition-transform">
              <Download size={18} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black text-[#D4480A] uppercase tracking-widest">Ma Collection</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Sauvegardés</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-6">
        {loading ? (
          <div className="space-y-4 pt-4">
             {[1,2,3,4,5].map(i => <ChannelSkeleton key={i} />)}
          </div>
        ) : (
          <>
            {/* Mes Chaînes Créées */}
            {user && mesChaines.length > 0 && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <p className="px-2 mb-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Mes Propriétés</p>
                <div className="space-y-2">
                  {mesChaines.map((c) => (
                    <Link to={`/ChannelDashboard/${c.id}`} key={`my-${c.id}`}>
                      <div className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border border-orange-100 bg-white hover:shadow-lg hover:shadow-orange-100/50 group">
                        <div className="w-10 h-10 bg-[#D4480A] rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md group-hover:scale-110 transition-transform">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[#1A1A18] truncate">{c.name}</p>
                          <p className="text-[10px] text-[#D4480A] font-black tracking-widest uppercase">Admin</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Mes Favoris */}
            {user && mesFavoris.length > 0 && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-600">
                <p className="px-2 mb-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Heart size={12} strokeWidth={2.5} className="text-rose-500" fill="currentColor" /> Coups de cœur
                </p>
                <div className="space-y-2">
                  {mesFavoris.map((c) => {
                    const estActif = String(c.id) === id;
                    return (
                      <Link to={`/Chaines/${c.id}`} key={`fav-${c.id}`}>
                        <div className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border
                          ${estActif 
                            ? "bg-[#D4480A] border-[#D4480A] shadow-xl shadow-orange-200/50" 
                            : "bg-white border-slate-100 hover:border-orange-200"}`}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold
                            ${estActif ? "bg-white text-[#D4480A]" : "bg-rose-50 text-rose-500 shadow-inner"}`}>
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold truncate ${estActif ? "text-white" : "text-[#1A1A18]"}`}>
                              {c.name}
                            </p>
                            <p className={`text-[10px] font-medium ${estActif ? "text-orange-100" : "text-gray-400"}`}>
                              En favori
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Toutes les chaînes */}
            <div className="animate-in fade-in slide-in-from-left-4 duration-700">
              <p className="px-2 mb-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                 <Compass size={12} strokeWidth={2.5} /> Découvrir
              </p>
              <div className="space-y-2">
                {filteredChannels.length > 0 ? (
                  filteredChannels.map((c) => {
                    const estActif = String(c.id) === id;
                    const dejaEnFavori = mesFavoris.some(f => f.id === c.id);
                    if (dejaEnFavori) return null; // Ne pas doubler si déjà dans favoris ? Ou on laisse ?
                    // On laisse pour la découverte globale, ou on filtre. Disons qu'on filtre pour gagner de la place.
                    
                    return (
                      <Link to={`/Chaines/${c.id}`} key={c.id}>
                        <div className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border
                          ${estActif 
                            ? "bg-[#D4480A] border-[#D4480A] shadow-xl shadow-orange-200/50 translate-x-1" 
                            : "bg-white border-slate-100 hover:border-orange-200 hover:shadow-md"}`}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-colors
                            ${estActif ? "bg-white text-[#D4480A]" : "bg-slate-50 text-slate-500"}`}>
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold truncate ${estActif ? "text-white" : "text-[#1A1A18]"}`}>
                              {c.name}
                            </p>
                            <p className={`text-[10px] font-medium ${estActif ? "text-orange-100" : "text-gray-400"}`}>
                              {c.owner_name}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="text-center py-10">
                    <p className="text-sm text-gray-400 font-medium">Aucune chaîne trouvée</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
