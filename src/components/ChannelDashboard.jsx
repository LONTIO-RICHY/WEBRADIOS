import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../Api";
import { Radio, Edit, Globe, Trash2, History, LogOut, Upload, BarChart3, Play, Tv, Share2, Video, Smartphone, HelpCircle, Settings } from "lucide-react";
import toast from "react-hot-toast";

const ChannelDashboard = () => {
    // 1. Récupération de l'identifiant DEPUIS l'URL
    const { id: channelIdParam } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { setCurrentChannel } = useAudio();

    // 2. États globaux
    const [channel, setChannel] = useState(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [history, setHistory] = useState([]);
    const [settingsData, setSettingsData] = useState({ name: "", phone: "" });
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ broadcasts: 0, followers: 0, listeners: 0 });

    // 3. Chargement initial des données de la chaîne
    useEffect(() => {
        const fetchChannel = async () => {
            if (!channelIdParam) return;
            try {
                const response = await api.get("/api/my-channels", {
                    headers: { Authorization: `Bearer ${user?.token}` }
                });
                const myChannel = response.data.find(c => String(c.id) === String(channelIdParam));
                if (!myChannel) {
                    navigate("/");
                } else {
                    setChannel(myChannel);
                    // On informe le player global
                    setCurrentChannel(myChannel);
                    
                    setSettingsData({ name: myChannel.name, phone: myChannel.phone });
                    fetchChannelStats();
                }
            } catch (err) {
                console.error("Erreur chargement chaîne", err);
                navigate("/");
            }
        };
        if (user) fetchChannel();
    }, [channelIdParam, user, navigate]);

    const fetchChannelStats = async () => {
        try {
            const res = await api.get(`/api/channels/${channelIdParam}/stats`);
            setStats(res.data);
        } catch (err) {
            console.error("Erreur stats", err);
        }
    };

    useEffect(() => {
        if (activeTab === "overview") {
            fetchChannelStats();
            const interval = setInterval(fetchChannelStats, 5000); 
            return () => clearInterval(interval);
        }
    }, [activeTab, channelIdParam]);

    useEffect(() => {
        if (activeTab === "history" && channelIdParam) {
            fetchHistory();
        }
    }, [activeTab, channelIdParam]);

    const fetchHistory = async () => {
        try {
            const res = await api.get(`/api/channels/${channelIdParam}/history`);
            setHistory(res.data);
        } catch (err) {
            console.error("Erreur chargement historique", err);
        }
    };

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.patch(`/api/channels/${channelIdParam}`, settingsData, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            setChannel(res.data);
            toast.success("Paramètres mis à jour !");
        } catch (err) {
            toast.error("Erreur lors de la mise à jour");
        } finally {
            setLoading(false);
        }
    };

    const [uploadFile, setUploadFile] = useState(null);
    const [uploadTitle, setUploadTitle] = useState("");
    const [uploadProgress, setUploadProgress] = useState(false);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadFile || !uploadTitle) {
            toast.error("Veuillez choisir un fichier et donner un titre");
            return;
        }
        setUploadProgress(true);
        const formData = new FormData();
        formData.append("file", uploadFile);

        try {
            const uploadRes = await api.post(`/api/upload?title=${encodeURIComponent(uploadTitle)}`, formData, {
                headers: { 
                    Authorization: `Bearer ${user?.token}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            
            const newTrack = uploadRes.data;

            // ARCHIVAGE AUTOMATIQUE : Création immédiate de l'émission pour cette chaîne
            await api.post(
                "/api/emissions",
                { 
                  title: uploadTitle, 
                  description: "Archive automatique (Dashboard)", 
                  channel_id: parseInt(channelIdParam),
                  audio_path: newTrack.file_path
                },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );

            toast.success("Audio envoyé et archivé sur votre chaîne !");
            setUploadTitle("");
            setUploadFile(null);
        } catch (err) {
            toast.error("Erreur d'export");
        } finally {
            setUploadProgress(false);
        }
    };

    const startStudio = () => {
        navigate(`/Studio?channel_id=${channelIdParam}`);
    };

    if (!channel) return <div className="p-10 text-center font-black text-[#D4480A]">CHARGEMENT DU STUDIO...</div>;

    const sidebarItems = [
        { id: "overview", label: "Vue d'ensemble", icon: <BarChart3 size={20} strokeWidth={2} /> },
        { id: "live", label: "Streaming Direct", icon: <Radio size={20} strokeWidth={2} /> },
        { id: "multistream", label: "OBS & Multistream", icon: <Tv size={20} strokeWidth={2} /> },
        { id: "upload", label: "Exporter Audio (PC)", icon: <Upload size={20} strokeWidth={2} /> },
        { id: "history", label: "Historique", icon: <History size={20} strokeWidth={2} /> },
        { id: "settings", label: "Paramètres", icon: <Edit size={20} strokeWidth={2} /> },
    ];

    return (
        <div className="flex h-screen bg-[#F5F2EE]">
            <div className="flex-1 p-8 overflow-y-auto pb-32">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-[#D4480A] rounded-xl shadow-lg shadow-orange-200/30">
                                <Radio className="text-white" size={20} strokeWidth={2} />
                            </div>
                            <span className="text-[10px] font-black text-[#D4480A] uppercase tracking-[0.2em]">Studio de Gestion</span>
                        </div>
                        <h1 className="text-4xl font-black text-[#1A1A18] tracking-tight">{channel.name}</h1>
                        <p className="text-slate-400 font-bold text-sm italic mt-1">Gérez vos diffusions et paramétrez votre antenne</p>
                    </div>
                    <button 
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 bg-white px-6 py-3 rounded-2xl shadow-sm hover:shadow-xl hover:text-[#C0392B] transition-all text-slate-400 font-black text-xs uppercase tracking-widest border border-slate-100"
                    >
                        <LogOut size={18} strokeWidth={2} /> Quitter
                    </button>
                </header>

                <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-orange-100/20 border border-orange-50 min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === "overview" && (
                        <div className="space-y-10">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black text-[#1A1A18] tracking-tight">Tableau de bord</h2>
                                <span className="px-4 py-1.5 bg-[#FFF3EC] text-[#D4480A] text-[10px] font-black rounded-full uppercase tracking-widest border border-orange-100">
                                    Statistiques Réelles
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="bg-[#F5F2EE] p-8 rounded-[2rem] border border-slate-100 group hover:border-[#D4480A]/20 transition-all">
                                    <p className="text-[#D4480A] font-black uppercase text-[10px] tracking-widest mb-2">Abonnés</p>
                                    <p className="text-5xl font-black text-[#1A1A18] tracking-tighter group-hover:scale-110 transition-transform origin-left">{stats.followers}</p>
                                </div>
                                <div className="bg-[#F5F2EE] p-8 rounded-[2rem] border border-slate-100 group hover:border-[#D4480A]/20 transition-all">
                                    <p className="text-[#2D7A3A] font-black uppercase text-[10px] tracking-widest mb-2">Diffusions</p>
                                    <p className="text-5xl font-black text-[#1A1A18] tracking-tighter group-hover:scale-110 transition-transform origin-left">{stats.broadcasts}</p>
                                </div>
                                <div className="bg-[#1A1A18] p-8 rounded-[2rem] shadow-xl shadow-slate-900/20 group">
                                    <p className="text-orange-400 font-black uppercase text-[10px] tracking-widest mb-2">Auditeurs Actuels</p>
                                    <p className="text-5xl font-black text-white tracking-tighter group-hover:scale-110 transition-transform origin-left">{stats.listeners}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "live" && (
                        <div className="text-center py-24 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 animate-in zoom-in duration-300">
                            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl text-[#C0392B] animate-pulse">
                                <Radio size={48} strokeWidth={1.5} />
                            </div>
                            <h2 className="text-3xl font-black text-[#1A1A18] mb-4 tracking-tight uppercase">Streaming Direct</h2>
                            <button 
                                onClick={startStudio}
                                className="bg-[#D4480A] hover:bg-[#B83A08] text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl"
                            >
                                Ouvrir la console Luko
                            </button>
                        </div>
                    )}

                    {activeTab === "multistream" && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center justify-between">
                                <h2 className="text-3xl font-black text-[#1A1A18] tracking-tight uppercase">Régie Vidéo & Multidiffusion</h2>
                                <span className="px-4 py-2 bg-[#1A1A18] text-orange-400 text-[10px] font-black rounded-xl uppercase tracking-widest">
                                    Hub Central
                                </span>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                {/* Configuration OBS */}
                                <div className="bg-white p-8 rounded-[2rem] border border-orange-100 shadow-xl flex flex-col">
                                    <div className="w-12 h-12 bg-[#D4480A] text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-200">
                                        <Settings size={24} />
                                    </div>
                                    <h3 className="text-xl font-black text-[#1A1A18] mb-4">1. Liaison OBS</h3>
                                    <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                                        Utilisez ce lien dans une <b>"Source Navigateur"</b> sur OBS pour intégrer votre radio directement.
                                    </p>
                                    <div className="mt-auto bg-[#F5F2EE] p-4 rounded-xl flex items-center justify-between gap-3">
                                        <code className="text-[#D4480A] text-[10px] font-bold truncate">Studio_Link_Active</code>
                                        <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/Studio?channel_id=${channelIdParam}`); toast.success("Lien copié !"); }} className="p-2 bg-white text-[#D4480A] rounded-lg shadow-sm hover:scale-110 transition-transform"><Share2 size={16} /></button>
                                    </div>
                                </div>

                                {/* Youtube & Facebook Keys */}
                                <div className="xl:col-span-2 bg-[#1A1A18] p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4480A]/10 rounded-full blur-[80px]"></div>
                                    <h3 className="text-xl font-black text-orange-400 mb-6 flex items-center gap-3 relative z-10">
                                        <Globe size={20} /> 2. Vos Clés de Diffusion
                                    </h3>
                                    
                                    <div className="space-y-4 relative z-10">
                                        <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-all">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">YouTube Live</p>
                                                <p className="text-sm font-bold text-white">rtmp://a.rtmp.youtube.com/live2</p>
                                            </div>
                                            <button className="px-4 py-2 bg-orange-400 text-[#1A1A18] rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all">Copier l'URL</button>
                                        </div>

                                        <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-all">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Facebook Live</p>
                                                <p className="text-sm font-bold text-white">rtmps://live-api-s.facebook.com:443/rtmp/</p>
                                            </div>
                                            <button className="px-4 py-2 bg-orange-400 text-[#1A1A18] rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all">Copier l'URL</button>
                                        </div>
                                    </div>

                                    <p className="mt-8 text-[10px] text-slate-400 italic font-medium leading-relaxed border-t border-white/5 pt-6">
                                        * Ces URLs sont fixes. Vos clés de flux (Stream Keys) personnelles doivent être collées dans le plugin <b>Multiple RTMP</b> de votre OBS.
                                    </p>
                                </div>
                            </div>

                            {/* Section Guide Visuel */}
                            <div className="bg-[#FFF3EC] p-10 rounded-[2.5rem] border border-orange-100">
                                <h3 className="text-2xl font-black text-[#1A1A18] mb-8 uppercase flex items-center gap-3">
                                    <Play size={24} className="text-[#D4480A]" fill="currentColor" /> 
                                    Procédure de Lancement Professionnel
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {[
                                        { step: "A", title: "Luko Studio", desc: "Lancez votre antenne sur cette plateforme." },
                                        { step: "B", title: "Ouvrir OBS", desc: "Votre radio est déjà chargée en fond." },
                                        { step: "C", title: "Streaming", desc: "Cliquez sur 'Start' vers YouTube." },
                                        { step: "D", title: "Multi-RTMP", desc: "Activez TikTok et Facebook en 1 clic." }
                                    ].map((item, idx) => (
                                        <div key={idx} className="bg-white/60 p-6 rounded-3xl border border-orange-50 relative">
                                            <span className="absolute -top-3 -left-3 w-8 h-8 bg-[#1A1A18] text-white rounded-xl flex items-center justify-center font-black text-xs shadow-lg">{item.step}</span>
                                            <p className="font-black text-[#D4480A] uppercase text-xs mb-2 tracking-widest">{item.title}</p>
                                            <p className="text-slate-500 text-[11px] font-bold leading-tight">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "upload" && (
                        <div className="text-center py-24 bg-[#F5F2EE] rounded-[2rem] border-2 border-dashed border-[#D4480A]/20">
                            <h2 className="text-3xl font-black text-[#1A1A18] mb-8 uppercase">Exporter Audio</h2>
                            <form onSubmit={handleUpload} className="max-w-md mx-auto space-y-4">
                                <input type="text" placeholder="Titre du média" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} className="w-full p-4 rounded-2xl outline-none font-bold" />
                                <input type="file" id="audio-upload" className="hidden" accept="audio/*" onChange={(e) => setUploadFile(e.target.files[0])} />
                                <label htmlFor="audio-upload" className="w-full p-4 rounded-2xl bg-white flex items-center justify-center gap-3 cursor-pointer">Choisir un MP3</label>
                                <button type="submit" disabled={uploadProgress} className="w-full bg-[#1A1A18] text-white py-5 rounded-2xl font-black uppercase shadow-xl">{uploadProgress ? "Envoi..." : "Lancer l'export"}</button>
                            </form>
                        </div>
                    )}

                    {activeTab === "history" && (
                        <div className="space-y-8">
                            <h2 className="text-2xl font-black text-[#1A1A18] uppercase">Historique</h2>
                            <div className="grid grid-cols-1 gap-4">
                                {history.map((h) => (
                                    <div key={h.id} className="p-6 bg-[#F5F2EE]/50 rounded-2xl flex items-center justify-between">
                                        <p className="font-black text-[#1A1A18] uppercase text-sm">{h.title}</p>
                                        <span className="text-[10px] font-black text-slate-400 uppercase">Diffusé</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "settings" && (
                        <div className="max-w-xl space-y-10">
                            <h2 className="text-3xl font-black text-[#1A1A18] uppercase">Paramètres</h2>
                            <form onSubmit={handleUpdateSettings} className="space-y-6">
                                <input type="text" value={settingsData.name} onChange={(e) => setSettingsData({ ...settingsData, name: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" />
                                <input type="text" value={settingsData.phone} onChange={(e) => setSettingsData({ ...settingsData, phone: e.target.value })} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" />
                                <button type="submit" disabled={loading} className="bg-[#D4480A] text-white px-10 py-5 rounded-[2rem] font-black uppercase shadow-xl">{loading ? "Mise à jour..." : "Mettre à jour"}</button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            <div className="w-80 bg-white border-l border-slate-100 shadow-2xl p-8 flex flex-col z-20">
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-12 h-12 bg-[#D4480A] rounded-2xl flex items-center justify-center text-white text-xl font-black">
                        {channel.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-xs font-black text-[#1A1A18]">{channel.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dashboard</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-3">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 p-5 rounded-[1.25rem] font-black text-xs uppercase tracking-widest transition-all ${
                                activeTab === item.id 
                                ? "bg-[#D4480A] text-white shadow-xl" 
                                : "text-slate-400 hover:bg-[#F5F2EE]"
                            }`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
};

export default ChannelDashboard;