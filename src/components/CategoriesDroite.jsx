import { useState, useEffect } from "react";
import api from "../Api";
import { Radio, Compass, Play, Music, Globe, MapPin, Search, Trophy, Leaf, GraduationCap, Newspaper, Palette } from "lucide-react";
import { useAudio } from "../context/AudioContext";

export default function CategoriesDroite({ genreId, region }) {
  const { playChannel, playEmission, currentChannelId, currentEmission, isPlaying } = useAudio();
  const [headerInfo, setHeaderInfo] = useState({ name: "", meta: "" });
  const [channels, setChannels] = useState([]);
  const [emissions, setEmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const AFRICAN_COUNTRIES = [
    "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde", "Cameroon", 
    "Central African Republic", "Chad", "Comoros", "Congo", "Cote d'Ivoire", "Djibouti", "Egypt", 
    "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia", "Gabon", "Gambia", "Ghana", "Guinea", 
    "Guinea-Bissau", "Kenya", "Lesotho", "Liberia", "Libya", "Madagascar", "Malawi", "Mali", 
    "Mauritania", "Mauritius", "Morocco", "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda", 
    "Sao Tome and Principe", "Senegal", "Seychelles", "Sierra Leone", "Somalia", "South Africa", 
    "South Sudan", "Sudan", "Tanzania", "Togo", "Tunisia", "Uganda", "Zambia", "Zimbabwe",
    "Ivory Coast", "United Republic Of Tanzania", "The Democratic Republic Of The Congo", "Africa"
  ];

  useEffect(() => {
    if (!genreId && !region) return;
    setSearchTerm(""); // Reset la recherche lors du changement de catégorie

    const fetchData = async () => {
      setLoading(true);
      try {
        let catName = "Tout le Cameroun";
        let metaInfo = "";

        if (genreId) {
          const resCats = await api.get("/api/categories");
          const currentCat = resCats.data.find(c => String(c.id) === String(genreId));
          catName = currentCat?.name || "Catégorie";
          metaInfo = `${currentCat?.channels_count} CHAÎNES · ${currentCat?.emissions_count} ÉMISSIONS`;
        }

        if (region) {
          if (region === "Toutes les régions") {
            if (genreId) {
                catName = `${catName} (Tout le pays)`;
                metaInfo = `Toutes les émissions du pays pour cette catégorie`;
            } else {
                catName = "Tout le Cameroun";
                metaInfo = `Toutes les radios et émissions nationales`;
            }
          } else {
            if (genreId) {
                catName = `${catName} - ${region}`;
                metaInfo = `Filtré par région : ${region}`;
            } else {
                catName = region;
                metaInfo = `Radios et Émissions de la région ${region}`;
            }
          }
        }

        setHeaderInfo({ name: catName, meta: metaInfo });

        // Construction des URLs de filtrage
        let channelUrl = "/api/channels?";
        let emissionUrl = "/api/emissions?";
        
        if (genreId) {
          channelUrl += `category_id=${genreId}&`;
          emissionUrl += `category_id=${genreId}&`;
        }
        if (region && region !== "Toutes les régions") {
          channelUrl += `region=${region}&`;
          emissionUrl += `region=${region}&`;
        }

        const resChannels = await api.get(channelUrl);
        setChannels(resChannels.data);

        const resEmissions = await api.get(emissionUrl);
        setEmissions(resEmissions.data);

      } catch (err) {
        console.error("Erreur chargement données", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [genreId, region]);

  // Filtrage local par recherche
  const filteredChannels = channels.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredEmissions = emissions.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Séparation Local (Cameroun priorité) vs Afrique (Reste du continent)
  const localChannels = filteredChannels.filter(c => c.payment_method !== "Import");
  const africaChannels = filteredChannels.filter(c => 
    c.payment_method === "Import" && (AFRICAN_COUNTRIES.includes(c.region) || c.region === "Cameroon")
  );

  const localEmissions = filteredEmissions.filter(e => !e.stream_url);
  const africaEmissions = filteredEmissions.filter(e => 
    e.stream_url && (AFRICAN_COUNTRIES.includes(e.region) || e.channel_name?.toLowerCase().includes("cameroon") || !e.region)
  );

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

  const renderChannelGrid = (list, title) => {
    if (list.length === 0) return null;
    return (
      <section className="mb-10">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
          <Compass size={14} strokeWidth={2.5} className="text-[#D4480A]" /> {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((c) => (
            <div key={c.id} className="flex items-center gap-4 p-5 bg-white rounded-[2rem] border border-orange-50 shadow-sm hover:shadow-xl hover:border-[#D4480A]/20 transition-all group">
              <div className="w-14 h-14 bg-[#1A1A18] rounded-2xl flex items-center justify-center text-white text-lg font-black group-hover:bg-[#D4480A] transition-colors">
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-[#1A1A18] uppercase tracking-tight truncate max-w-[150px]">{c.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.region || "Cameroun"}</p>
              </div>
              <button 
                onClick={() => playChannel(c)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm ${
                  isPlaying && String(currentChannelId) === String(c.id)
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
    );
  };

  const renderEmissionList = (list, title) => {
    if (list.length === 0) return null;
    return (
      <section className="mb-10">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
          <Music size={14} strokeWidth={2.5} className="text-[#D4480A]" /> {title}
        </h3>
        <div className="space-y-3">
          {list.map((e) => {
            const isCurrent = currentEmission?.id === e.id && isPlaying;
            return (
              <div key={e.id}
                onClick={() => playEmission(e)}
                className={`flex items-center justify-between p-5 rounded-2xl border cursor-pointer transition-all
                  ${isCurrent ? "bg-white border-[#D4480A] shadow-lg shadow-orange-100" : "bg-white border-slate-100 hover:border-orange-100"}`}>
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${isCurrent ? "bg-[#D4480A] text-white" : "bg-slate-50 text-slate-400"}`}>
                        {isCurrent ? <Play size={18} strokeWidth={2.5} fill="currentColor" className="animate-pulse" /> : <Radio size={18} strokeWidth={2} />}
                    </div>
                    <div>
                        <p className={`text-sm font-black uppercase tracking-tight ${isCurrent ? "text-[#D4480A]" : "text-[#1A1A18]"}`}>{e.title}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{e.channel_name}</p>
                    </div>
                </div>
                {e.is_live && (
                  <span className="px-3 py-1 bg-[#2D7A3A] text-white text-[10px] font-black rounded-full uppercase tracking-widest animate-pulse">
                    LIVE
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  if (!genreId && !region) return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-white">
      <div className="w-20 h-20 bg-[#F5F2EE] rounded-full flex items-center justify-center mb-4">
        <Globe size={40} strokeWidth={1.5} className="text-[#D4480A]/20" />
      </div>
      <p className="font-black text-xs uppercase tracking-[0.2em]">Choisissez un genre ou une région</p>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center h-full bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4480A]"></div>
    </div>
  );

  const hasContent = localChannels.length > 0 || africaChannels.length > 0 || localEmissions.length > 0 || africaEmissions.length > 0;

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">

      <div className="p-8 md:p-12 bg-[#1A1A18] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4480A]/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-[#D4480A] rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-900/50 transform -rotate-3 text-white text-4xl md:text-5xl">
              {genreId ? getIcon(headerInfo.name, 48) : <MapPin size={48} className="text-white" />}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase">{headerInfo.name}</h1>
              <p className="text-orange-100/50 font-bold text-xs uppercase tracking-widest mt-2">
                {headerInfo.meta}
              </p>
            </div>
          </div>

          <div className="relative group w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-100/30 group-focus-within:text-[#D4480A] transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Filtrer ces résultats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3.5 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:bg-white/10 focus:ring-2 focus:ring-[#D4480A]/50 transition-all placeholder:text-white/20"
            />
          </div>
        </div>
      </div>

      <div className="p-8 space-y-10 bg-[#F5F2EE]/30">
        {!hasContent ? (
           <div className="text-center py-20">
             <p className="text-sm text-slate-400 italic">Aucun contenu africain trouvé pour ce critère.</p>
           </div>
        ) : (
          <>
            {/* --- SECTION CAMEROUN (PRIORITÉ ABSOLUE) --- */}
            {(localChannels.length > 0 || localEmissions.length > 0) && (
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                   <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-orange-100"></div>
                   <span className="text-[10px] font-black text-[#D4480A] uppercase tracking-[0.4em]">Au Cameroun</span>
                   <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-orange-100"></div>
                </div>
                {renderChannelGrid(localChannels, "Chaînes Locales")}
                {renderEmissionList(localEmissions, "Émissions Nationales")}
              </div>
            )}

            {/* --- SECTION AFRIQUE (UNIQUEMENT) --- */}
            {(africaChannels.length > 0 || africaEmissions.length > 0) && (
              <div className="space-y-8 pt-10 border-t border-orange-100/30">
                <div className="flex items-center gap-4">
                   <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-slate-200"></div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Ailleurs en Afrique</span>
                   <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-slate-200"></div>
                </div>
                {renderChannelGrid(africaChannels, "Radios Africaines")}
                {renderEmissionList(africaEmissions, "Émissions du Continent")}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
