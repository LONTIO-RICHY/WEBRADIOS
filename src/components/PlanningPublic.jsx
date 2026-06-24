import { useState, useEffect } from "react";
import api from "../Api";
import { Calendar, Clock, Music } from "lucide-react";

const PlanningPublic = () => {
    const [planning, setPlanning] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlanning = async () => {
            try {
                const res = await api.get("/api/planning");
                setPlanning(res.data);
            } catch (err) {
                console.error("Erreur planning", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlanning();
    }, []);

    const formatTime = (dateStr) => {
        if (!dateStr) return "Heure inconnue";
        try {
            return new Date(dateStr).toLocaleTimeString([], { hour: '2h', minute: '2h' });
        } catch { return "Heure invalide"; }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "Date inconnue";
        try {
            return new Date(dateStr).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
        } catch { return "Date invalide"; }
    };

    // Grouper par date avec sécurité
    const groupedPlanning = planning.reduce((groups, slot) => {
        if (!slot || !slot.start_time) return groups;
        const date = new Date(slot.start_time).toLocaleDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(slot);
        return groups;
    }, {});

    if (loading) return <div className="p-20 text-center font-black text-[#D4480A] animate-pulse uppercase tracking-widest">Chargement du programme...</div>;

    return (
        <div className="max-w-5xl mx-auto p-6 pb-32">
            <header className="mb-12 text-center">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#FFF3EC] text-[#D4480A] rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-orange-100">
                    <Calendar size={14} /> Grille des Programmes
                </div>
                <h1 className="text-5xl font-black text-[#1A1A18] tracking-tighter uppercase mb-4">L'Emploi du Temps <span className="text-[#D4480A]">Antenne</span></h1>
                <p className="text-slate-400 font-bold italic">Découvrez la programmation musicale et les directs de vos chaînes</p>
            </header>

            <div className="space-y-12">
                {Object.keys(groupedPlanning).length > 0 ? (
                    Object.keys(groupedPlanning).map(date => (
                        <div key={date} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <h2 className="text-sm font-black text-[#1A1A18] uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
                                <span className="bg-[#1A1A18] text-white px-4 py-1 rounded-lg shadow-md">{formatDate(groupedPlanning[date][0].start_time)}</span>
                                <span className="h-px bg-slate-200 flex-1"></span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {groupedPlanning[date].map(slot => (
                                    <div key={slot.id} className="group bg-white p-8 rounded-[2.5rem] border border-orange-50 shadow-xl hover:shadow-2xl hover:border-[#D4480A]/20 transition-all flex flex-col justify-between relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4480A]/5 rounded-full -mr-10 -mt-10 group-hover:bg-[#D4480A]/10 transition-colors"></div>
                                        
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-12 h-12 bg-[#F5F2EE] rounded-2xl flex items-center justify-center text-[#D4480A] group-hover:bg-[#D4480A] group-hover:text-white transition-all shadow-sm">
                                                    <Clock size={22} strokeWidth={2.5} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Horaire de passage</p>
                                                    <p className="text-sm font-black text-[#1A1A18]">{formatTime(slot.start_time)} — {formatTime(slot.end_time)}</p>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <h3 className="text-2xl font-black text-[#1A1A18] uppercase tracking-tight group-hover:text-[#D4480A] transition-colors mb-1">{slot.channel_name}</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-[#D4480A] rounded-full"></span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">Canal Officiel</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-6 border-t border-slate-50 relative z-10">
                                            <p className="text-[9px] font-black text-[#D4480A] uppercase tracking-[0.2em] mb-2">Au Programme :</p>
                                            <div className="flex items-center gap-3 bg-[#F5F2EE]/50 p-4 rounded-2xl group-hover:bg-white transition-all border border-transparent group-hover:border-orange-50">
                                                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-[#D4480A] shadow-sm">
                                                    <Music size={16} />
                                                </div>
                                                <p className="font-bold text-sm text-slate-700 group-hover:text-[#1A1A18] transition-colors">{slot.track_info || "Contenu varié"}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-inner">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300 shadow-sm">
                            <Calendar size={48} />
                        </div>
                        <h2 className="text-2xl font-black text-[#1A1A18] uppercase mb-2">Antenne Libre</h2>
                        <p className="text-slate-400 font-bold italic">Aucune émission n'est programmée pour le moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlanningPublic;
