 import { useState, useEffect } from "react";
 import { Search, Sparkles, Radio, Phone, User, CreditCard, Lock, Play, Palette } from "lucide-react";
 import Listederoulante from "./Listederoulante";
 import { useAuth } from "../context/AuthContext";
 import { useAudio } from "../context/AudioContext";
 import api from "../Api";
 import { useNavigate, Link } from "react-router-dom";

 export const Corps = () => {
     const { user } = useAuth();
     const { setCurrentChannel, playChannel } = useAudio();
     const navigate = useNavigate();
     
     // États pour la recherche
     const [searchTerm, setSearchTerm] = useState("");
     const [searchResults, setSearchResults] = useState({ channels: [], emissions: [] });
     const [isSearching, setIsLiveSearching] = useState(false);

     // Charger une chaîne par défaut
     useEffect(() => {
        const loadInitialData = async () => {
            try {
                // 1. Charger les chaînes pour le player
                const res = await api.get("/api/channels");
                if (res.data.length > 0) {
                    setCurrentChannel(res.data[0]);
                }
            } catch(e) {
                console.error("Erreur chargement données initiales", e);
            }
        };
        loadInitialData();
     }, [setCurrentChannel]);

     const [formData, setFormData] = useState({
         name: "",
         phone: "",
         owner_name: "",
         amount: "",
         payment_method: "Mobile Money",
         auth_word: ""
     });
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState("");

     // Logique de recherche avec Debounce
     useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.length >= 2) {
                setIsLiveSearching(true);
                try {
                    const response = await api.get(`/api/search?q=${searchTerm}`);
                    setSearchResults(response.data);
                } catch (err) {
                    console.error("Erreur recherche", err);
                } finally {
                    setIsLiveSearching(false);
                }
            } else {
                setSearchResults({ channels: [], emissions: [] });
            }
        }, 400); // Attendre 400ms après la dernière frappe

        return () => clearTimeout(delayDebounceFn);
     }, [searchTerm]);

     const handleCreateChannel = async (e) => {
         e.preventDefault();
         if (!user) {
             alert("Veuillez vous connecter pour créer une chaîne");
             return;
         }

         setLoading(true);
         setError("");

         try {
             const response = await api.post("/api/channels", formData, {
                 headers: { Authorization: `Bearer ${user.token}` }
             });
             alert("Chaîne créée avec succès !");
             navigate(`/ChannelDashboard/${response.data.id}`);
         } catch (err) {
             setError(err.response?.data?.detail || "Erreur lors de la création");
         } finally {
             setLoading(false);
         }
     };

     return (
         <div className="min-h-screen bg-[#F5F2EE] pb-20">
             <span className="relative top-4 left-5">
                 <Listederoulante />
             </span>

             <div className="flex flex-col justify-center items-center pt-20 px-4 text-center">
                 <h2 className="bg-[#D4480A] flex p-2 px-6 rounded-full m-3 text-white font-medium text-sm shadow-md shadow-orange-200/50 animate-fade-in uppercase tracking-wider">
                     <span className="mr-2"><Sparkles size={16} strokeWidth={2.5} /></span> plus de 200 chaines disponibles
                 </h2>
                 <h1 className="text-4xl md:text-5xl font-black m-3 text-[#1A1A18] tracking-tighter">
                     Écoutez vos émissions favorites en direct
                 </h1>
                 <p className="text-xl md:text-2xl text-slate-500 m-5 max-w-2xl font-normal leading-relaxed">
                     Découvrez des centaines de webradios thématiques et ne manquez plus jamais vos programmes préférés.
                 </p>

                 <div className="relative flex flex-col items-center w-full max-w-lg mb-12 group">
                     <div className="relative w-full">
                        <i className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-slate-400 group-focus-within:text-[#D4480A] transition-colors">
                            <Search size={24} strokeWidth={2} />
                        </i>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Recherche une émission ou une chaîne..."
                            className="w-full py-5 pl-12 pr-4 rounded-2xl border border-slate-200 shadow-sm focus:border-[#D4480A] focus:ring-4 focus:ring-[#D4480A]/10 focus:bg-white focus:outline-none transition-all"
                        />
                        {isSearching && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#D4480A]"></div>
                            </div>
                        )}
                     </div>

                     {/* RÉSULTATS DE RECHERCHE DYNAMIQUE */}
                     {searchTerm.length >= 2 && (
                         <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-orange-50 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                             {searchResults.channels.length === 0 && searchResults.emissions.length === 0 && !isSearching ? (
                                 <div className="p-8 text-slate-400 italic text-sm">Aucun résultat pour "{searchTerm}"</div>
                             ) : (
                                 <div className="max-h-[400px] overflow-y-auto custom-scrollbar text-left">
                                     {searchResults.channels.length > 0 && (
                                         <div className="p-4 border-b border-slate-50">
                                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Chaînes Trouvées</p>
                                             {searchResults.channels.map(c => (
                                                 <Link key={c.id} to={`/chaines/${c.id}`} className="flex items-center gap-3 p-3 hover:bg-[#F5F2EE] rounded-xl transition-colors group">
                                                     <div className="w-10 h-10 bg-[#D4480A] rounded-lg flex items-center justify-center text-white font-black shadow-sm group-hover:scale-110 transition-transform">
                                                         {c.name.charAt(0).toUpperCase()}
                                                     </div>
                                                     <div>
                                                         <p className="text-sm font-black text-[#1A1A18] uppercase tracking-tight">{c.name}</p>
                                                         <p className="text-[10px] text-slate-400 font-bold uppercase">{c.owner_name}</p>
                                                     </div>
                                                 </Link>
                                             ))}
                                         </div>
                                     )}
                                     {searchResults.emissions.length > 0 && (
                                         <div className="p-4">
                                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Émissions Trouvées</p>
                                             {searchResults.emissions.map(e => (
                                                 <Link key={e.id} to={`/emissions/${e.id}`} className="flex items-center gap-3 p-3 hover:bg-[#F5F2EE] rounded-xl transition-colors group">
                                                     <div className="w-10 h-10 bg-[#1A1A18] rounded-lg flex items-center justify-center text-[#D4480A] font-black shadow-sm group-hover:scale-110 transition-transform">
                                                         <Play size={16} fill="currentColor" />
                                                     </div>
                                                     <div>
                                                         <p className="text-sm font-black text-[#1A1A18] uppercase tracking-tight">{e.title}</p>
                                                         <p className="text-[10px] text-slate-400 font-bold uppercase">ID Chaîne: {e.channel_id}</p>
                                                     </div>
                                                 </Link>
                                             ))}
                                         </div>
                                     )}
                                 </div>
                             )}
                         </div>
                     )}
                 </div>

                 {user && (
                     <div className="w-full max-w-2xl bg-white p-10 rounded-[2rem] shadow-2xl border border-orange-50 mb-20 animate-fade-in">
                         <h2 className="text-3xl font-black text-[#1A1A18] mb-8 flex items-center justify-center gap-3 tracking-tight">
                             <Radio className="text-[#D4480A]" size={32} strokeWidth={2} /> Créer ma propre chaîne
                         </h2>

                         {error && (
                             <div className="bg-red-50 text-[#C0392B] p-4 rounded-xl mb-6 font-bold border border-red-100">
                                 {error}
                             </div>
                         )}

                         <form onSubmit={handleCreateChannel} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                             <div className="space-y-2">
                                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                     <Radio size={16} strokeWidth={2.5} /> Nom de la chaîne
                                 </label>
                                 <input
                                     required
                                     type="text"
                                     placeholder="Ma Super Radio"
                                     className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[#D4480A]/20 focus:border-[#D4480A] outline-none transition-all"
                                     value={formData.name}
                                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                 />
                             </div>

                             <div className="space-y-2">
                                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                     <Phone size={16} strokeWidth={2.5} /> Numéro de téléphone
                                 </label>
                                 <input
                                     required
                                     type="tel"
                                     placeholder="6xx xxx xxx"
                                     className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[#D4480A]/20 focus:border-[#D4480A] outline-none transition-all"
                                     value={formData.phone}
                                     onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                 />
                             </div>

                             <div className="space-y-2">
                                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                     <User size={16} strokeWidth={2.5} /> Votre Nom complet
                                 </label>
                                 <input
                                     required
                                     type="text"
                                     placeholder="Jean Dupont"
                                     className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[#D4480A]/20 focus:border-[#D4480A] outline-none transition-all"
                                     value={formData.owner_name}
                                     onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                                 />
                             </div>

                             <div className="md:col-span-2 space-y-2">
                                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                     <CreditCard size={16} strokeWidth={2.5} /> Paiement (Mobile Money)
                                 </label>
                                 <div className="flex flex-col sm:flex-row gap-4">
                                     <input
                                         required
                                         type="text"
                                         placeholder="Montant (ex: 5000 FCFA)"
                                         className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[#D4480A]/20 focus:border-[#D4480A] outline-none transition-all"
                                         value={formData.amount}
                                         onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                     />
                                     <select 
                                         className="p-4 bg-[#FFF3EC] border border-orange-100 rounded-xl outline-none font-bold text-[#D4480A] focus:ring-2 focus:ring-[#D4480A]/20 sm:w-72"
                                         value={formData.payment_method}
                                         onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                     >
                                         <option>Orange Money</option>
                                         <option>MTN MoMo</option>
                                         <option>Carte Bancaire</option>
                                     </select>
                                 </div>
                                 
                                 {/* Affichage dynamique du numéro selon le mode de paiement choisi */}
                                 {(formData.payment_method === "MTN MoMo" || formData.payment_method === "Orange Money") && (
                                     <div className="mt-4 p-4 bg-orange-50/50 rounded-xl border border-dashed border-orange-200 animate-in fade-in slide-in-from-top-1">
                                        {formData.payment_method === "MTN MoMo" && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[#FFCC00] rounded-lg flex items-center justify-center font-black text-xs text-black shadow-sm">MTN</div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compte MTN MoMo</p>
                                                    <p className="text-sm font-bold text-slate-600">Payer au : <span className="text-[#1A1A18] font-black text-lg">677774032</span></p>
                                                </div>
                                            </div>
                                        )}
                                        {formData.payment_method === "Orange Money" && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[#FF6600] rounded-lg flex items-center justify-center font-black text-xs text-white shadow-sm">ORA</div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compte Orange Money</p>
                                                    <p className="text-sm font-bold text-slate-600">Payer au : <span className="text-[#1A1A18] font-black text-lg">699334323</span></p>
                                                </div>
                                            </div>
                                        )}
                                     </div>
                                 )}
                             </div>

                             <div className="md:col-span-2 space-y-2">
                                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                                     <Lock size={16} strokeWidth={2.5} /> Mot d'authentification
                                 </label>
                                 <input
                                     required
                                     type="password"
                                     placeholder="Entrez le mot clé pour valider"
                                     className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[#D4480A]/20 focus:border-[#D4480A] outline-none transition-all"
                                     value={formData.auth_word}
                                     onChange={(e) => setFormData({ ...formData, auth_word: e.target.value })}
                                 />
                             </div>

                             <button
                                 type="submit"
                                 disabled={loading}
                                 className="md:col-span-2 bg-[#D4480A] hover:bg-[#B83A08] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-orange-200/50 transform active:scale-95 transition-all disabled:opacity-50 mt-4"
                             >
                                 {loading ? "Création en cours..." : "Valider et Créer ma chaîne"}
                             </button>
                         </form>
                     </div>
                 )}
             </div>
         </div>
     );
 };