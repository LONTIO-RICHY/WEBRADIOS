import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAudio } from "../context/AudioContext";
import api from "../Api";
import { Radio, Edit, Globe, Trash2, History, LogOut, Upload, BarChart3, Play, Tv, Share2, Video, Smartphone, HelpCircle, Settings, Moon, Sun } from "lucide-react";
import toast from "react-hot-toast";

const translations = {
    fr: {
        studio: "Studio de Gestion",
        subtitle: "Gerez vos diffusions et parametrez votre antenne",
        exit: "Quitter",
        overview: "Vue d'ensemble",
        live: "Streaming Direct",
        multistream: "OBS & Multistream",
        upload: "Exporter Audio (PC)",
        history: "Historique",
        settings: "Parametres",
        dashboard: "Tableau de bord",
        realtime_stats: "Statistiques Reelles",
        followers: "Abonnes",
        broadcasts: "Diffusions",
        listeners: "Auditeurs Actuels",
        open_console: "Ouvrir la console Luko",
        video_regie: "Regie Video & Multidiffusion",
        hub_central: "Hub Central",
        obs_liaison: "1. Liaison OBS",
        obs_desc: "Utilisez ce lien dans une \"Source Navigateur\" sur OBS pour integrer votre radio directement.",
        stream_keys: "2. Vos Cles de Diffusion",
        copy_url: "Copier l'URL",
        obs_warning: "* Ces URLs sont fixes. Vos cles de flux (Stream Keys) personnelles doivent etre collees dans le plugin Multiple RTMP de votre OBS.",
        launch_procedure: "Procedure de Lancement Professionnel",
        steps: [
            { step: "A", title: "Luko Studio", desc: "Lancez votre antenne sur cette plateforme." },
            { step: "B", title: "Ouvrir OBS", desc: "Votre radio est deja chargee en fond." },
            { step: "C", title: "Streaming", desc: "Cliquez sur 'Start' vers YouTube." },
            { step: "D", title: "Multi-RTMP", desc: "Activez TikTok et Facebook en 1 clic." }
        ],
        export_audio: "Exporter Audio",
        media_title: "Titre du media",
        choose_file: "Choisir un MP3",
        launch_export: "Lancer l'export",
        sending: "Envoi...",
        theme: "Theme de l'interface",
        light: "Clair",
        dark: "Sombre",
        lang: "Langue de l'interface",
        updating: "Mise a jour...",
        update: "Mettre a jour",
        radio_name: "Nom de la webradio",
        phone: "Telephone de contact",
        owner_name: "Nom du proprietaire (Nom Personnel)",
        success_update: "Parametres mis a jour !",
        error_update: "Erreur lors de la mise a jour",
        choose_file_error: "Veuillez choisir un fichier et donner un titre",
        success_upload: "Audio envoye et archive sur votre chaine !",
        error_upload: "Erreur d'export",
        loading_studio: "CHARGEMENT DU STUDIO...",
        broadcasted: "Diffuse",
        copied: "Lien copie !",
    },
    en: {
        studio: "Management Studio",
        subtitle: "Manage your broadcasts and configure your antenna",
        exit: "Exit",
        overview: "Overview",
        live: "Live Streaming",
        multistream: "OBS & Multistream",
        upload: "Export Audio (PC)",
        history: "History",
        settings: "Settings",
        dashboard: "Dashboard",
        realtime_stats: "Real-time Stats",
        followers: "Followers",
        broadcasts: "Broadcasts",
        listeners: "Current Listeners",
        open_console: "Open Luko Console",
        video_regie: "Video Control & Multidiffusing",
        hub_central: "Central Hub",
        obs_liaison: "1. OBS Connection",
        obs_desc: "Use this link as a \"Browser Source\" in OBS to integrate your radio directly.",
        stream_keys: "2. Your Broadcast Keys",
        copy_url: "Copy URL",
        obs_warning: "* These URLs are fixed. Your personal Stream Keys must be pasted into the Multiple RTMP plugin of your OBS.",
        launch_procedure: "Professional Launch Procedure",
        steps: [
            { step: "A", title: "Luko Studio", desc: "Launch your antenna on this platform." },
            { step: "B", title: "Open OBS", desc: "Your radio is already loaded in the background." },
            { step: "C", title: "Streaming", desc: "Click 'Start' to stream to YouTube." },
            { step: "D", title: "Multi-RTMP", desc: "Activate TikTok and Facebook in 1 click." }
        ],
        export_audio: "Export Audio",
        media_title: "Media Title",
        choose_file: "Choose a MP3",
        launch_export: "Launch Export",
        sending: "Sending...",
        theme: "Interface Theme",
        light: "Light",
        dark: "Dark",
        lang: "Interface Language",
        updating: "Updating...",
        update: "Update",
        radio_name: "Webradio Name",
        phone: "Contact Phone",
        owner_name: "Owner Name (Personal Name)",
        success_update: "Settings updated successfully!",
        error_update: "Error during update",
        choose_file_error: "Please select a file and provide a title",
        success_upload: "Audio sent and archived to your channel!",
        error_upload: "Export error",
        loading_studio: "LOADING THE STUDIO...",
        broadcasted: "Broadcasted",
        copied: "Link copied!",
    }
};

const ChannelDashboard = () => {
    // 1. Recuperation de l'identifiant DEPUIS l'URL
    const { id: channelIdParam } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { setCurrentChannel } = useAudio();

    // 2. Etats pour le Theme & Langue
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("channel_dashboard_theme") === "dark";
    });
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem("channel_dashboard_lang") || "fr";
    });

    const t = translations[language];

    // 3. Etats globaux
    const [channel, setChannel] = useState(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [history, setHistory] = useState([]);
    const [settingsData, setSettingsData] = useState({ name: "", phone: "", owner_name: "" });
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ broadcasts: 0, followers: 0, listeners: 0 });

    // 4. Chargement initial des donnees de la chaine
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
                    
                    setSettingsData({ name: myChannel.name, phone: myChannel.phone, owner_name: myChannel.owner_name || "" });
                    fetchChannelStats();
                }
            } catch (err) {
                console.error("Erreur chargement chaine", err);
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
            const res = await api.patch(`/api/channels/${channelIdParam}`, {
                name: settingsData.name,
                phone: settingsData.phone,
                owner_name: settingsData.owner_name
            }, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            setChannel(res.data);
            toast.success(t.success_update);
        } catch (err) {
            toast.error(t.error_update);
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
            toast.error(t.choose_file_error);
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

            // ARCHIVAGE AUTOMATIQUE : Creation immediate de l'emission pour cette chaine
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

            toast.success(t.success_upload);
            setUploadTitle("");
            setUploadFile(null);
        } catch (err) {
            toast.error(t.error_upload);
        } finally {
            setUploadProgress(false);
        }
    };

    const startStudio = () => {
        navigate(`/Studio?channel_id=${channelIdParam}`);
    };

    if (!channel) return <div className="p-10 text-center font-black text-[#D4480A]">{t.loading_studio}</div>;

    const sidebarItems = [
        { id: "overview", label: t.overview, icon: <BarChart3 size={20} strokeWidth={2} /> },
        { id: "live", label: t.live, icon: <Radio size={20} strokeWidth={2} /> },
        { id: "multistream", label: t.multistream, icon: <Tv size={20} strokeWidth={2} /> },
        { id: "upload", label: t.upload, icon: <Upload size={20} strokeWidth={2} /> },
        { id: "history", label: t.history, icon: <History size={20} strokeWidth={2} /> },
        { id: "settings", label: t.settings, icon: <Edit size={20} strokeWidth={2} /> },
    ];

    return (
        <div className={`flex h-screen transition-colors duration-300 ${darkMode ? "bg-zinc-950 text-zinc-100" : "bg-[#F5F2EE] text-[#1A1A18]"}`}>
            <div className="flex-1 p-8 overflow-y-auto pb-32">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-[#D4480A] rounded-xl shadow-lg shadow-orange-200/30">
                                <Radio className="text-white" size={20} strokeWidth={2} />
                            </div>
                            <span className="text-[10px] font-black text-[#D4480A] uppercase tracking-[0.2em]">{t.studio}</span>
                        </div>
                        <h1 className={`text-4xl font-black tracking-tight ${darkMode ? "text-white" : "text-[#1A1A18]"}`}>{channel.name}</h1>
                        <p className={`font-bold text-sm italic mt-1 ${darkMode ? "text-zinc-400" : "text-slate-400"}`}>{t.subtitle}</p>
                    </div>
                    <button 
                        onClick={() => navigate("/")}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl shadow-sm hover:shadow-xl transition-all font-black text-xs uppercase tracking-widest border ${
                            darkMode 
                            ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-red-405" 
                            : "bg-white border-slate-100 text-slate-400 hover:text-[#C0392B]"
                        }`}
                    >
                        <LogOut size={18} strokeWidth={2} /> {t.exit}
                    </button>
                </header>

                <div className={`rounded-[2.5rem] p-10 shadow-2xl transition-colors duration-300 min-h-[600px] animate-in fade-in slide-in-from-bottom-4 duration-500 ${
                    darkMode 
                    ? "bg-zinc-900 border border-zinc-800 shadow-zinc-950/50" 
                    : "bg-white border border-orange-50 shadow-orange-100/20"
                }`}>
                    {activeTab === "overview" && (
                        <div className="space-y-10">
                            <div className="flex items-center justify-between">
                                <h2 className={`text-2xl font-black tracking-tight ${darkMode ? "text-zinc-100" : "text-[#1A1A18]"}`}>{t.dashboard}</h2>
                                <span className={`px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-widest border ${
                                    darkMode 
                                    ? "bg-zinc-800 border-zinc-700 text-orange-400" 
                                    : "bg-[#FFF3EC] border-orange-100 text-[#D4480A]"
                                }`}>
                                    {t.realtime_stats}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className={`p-8 rounded-[2rem] border transition-all group ${
                                    darkMode 
                                    ? "bg-zinc-850 border-zinc-800 hover:border-[#D4480A]/40 text-zinc-100" 
                                    : "bg-[#F5F2EE] border-slate-100 hover:border-[#D4480A]/20"
                                }`}>
                                    <p className="text-[#D4480A] font-black uppercase text-[10px] tracking-widest mb-2">{t.followers}</p>
                                    <p className={`text-5xl font-black tracking-tighter group-hover:scale-110 transition-transform origin-left ${darkMode ? "text-white" : "text-[#1A1A18]"}`}>{stats.followers}</p>
                                </div>
                                <div className={`p-8 rounded-[2rem] border transition-all group ${
                                    darkMode 
                                    ? "bg-zinc-850 border-zinc-800 hover:border-[#D4480A]/40 text-zinc-100" 
                                    : "bg-[#F5F2EE] border-slate-100 hover:border-[#D4480A]/20"
                                }`}>
                                    <p className="text-[#2D7A3A] font-black uppercase text-[10px] tracking-widest mb-2">{t.broadcasts}</p>
                                    <p className={`text-5xl font-black tracking-tighter group-hover:scale-110 transition-transform origin-left ${darkMode ? "text-white" : "text-[#1A1A18]"}`}>{stats.broadcasts}</p>
                                </div>
                                <div className="bg-[#1A1A18] p-8 rounded-[2rem] shadow-xl shadow-slate-900/20 group">
                                    <p className="text-orange-400 font-black uppercase text-[10px] tracking-widest mb-2">{t.listeners}</p>
                                    <p className="text-5xl font-black text-white tracking-tighter group-hover:scale-110 transition-transform origin-left">{stats.listeners}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "live" && (
                        <div className={`text-center py-24 rounded-[2rem] border transition-colors duration-300 ${
                            darkMode ? "bg-zinc-800/50 border-zinc-750" : "bg-slate-50 border-slate-200"
                        } animate-in zoom-in duration-300`}>
                            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl animate-pulse ${
                                darkMode ? "bg-zinc-900 text-red-500 shadow-zinc-950/50" : "bg-white text-[#C0392B]"
                            }`}>
                                <Radio size={48} strokeWidth={1.5} />
                            </div>
                            <h2 className={`text-3xl font-black mb-4 tracking-tight uppercase ${darkMode ? "text-white" : "text-[#1A1A18]"}`}>{t.live}</h2>
                            <button 
                                onClick={startStudio}
                                className="bg-[#D4480A] hover:bg-[#B83A08] text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transform active:scale-95 transition-all"
                            >
                                {t.open_console}
                            </button>
                        </div>
                    )}

                    {activeTab === "multistream" && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="flex items-center justify-between">
                                <h2 className={`text-3xl font-black tracking-tight uppercase ${darkMode ? "text-white" : "text-[#1A1A18]"}`}>{t.video_regie}</h2>
                                <span className={`px-4 py-2 text-[10px] font-black rounded-xl uppercase tracking-widest ${
                                    darkMode ? "bg-zinc-805 text-orange-400" : "bg-[#1A1A18] text-orange-400"
                                }`}>
                                    {t.hub_central}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                {/* Configuration OBS */}
                                <div className={`p-8 rounded-[2rem] border shadow-xl flex flex-col transition-colors ${
                                    darkMode ? "bg-zinc-850 border-zinc-800 shadow-zinc-950/50" : "bg-white border-orange-100 shadow-orange-100/10"
                                }`}>
                                    <div className="w-12 h-12 bg-[#D4480A] text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-200">
                                        <Settings size={24} />
                                    </div>
                                    <h3 className={`text-xl font-black mb-4 ${darkMode ? "text-white" : "text-[#1A1A18]"}`}>{t.obs_liaison}</h3>
                                    <p className={`text-sm mb-6 leading-relaxed ${darkMode ? "text-zinc-400" : "text-slate-500"}`}>
                                        {t.obs_desc}
                                    </p>
                                    <div className={`mt-auto p-4 rounded-xl flex items-center justify-between gap-3 ${darkMode ? "bg-zinc-900" : "bg-[#F5F2EE]"}`}>
                                        <code className="text-[#D4480A] text-[10px] font-bold truncate">Studio_Link_Active</code>
                                        <button 
                                            onClick={() => { 
                                                navigator.clipboard.writeText(`${window.location.origin}/Studio?channel_id=${channelIdParam}`); 
                                                toast.success(t.copied); 
                                            }} 
                                            className={`p-2 rounded-lg shadow-sm hover:scale-110 transition-transform ${darkMode ? "bg-zinc-800 text-orange-400" : "bg-white text-[#D4480A]"}`}
                                        >
                                            <Share2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Youtube & Facebook Keys */}
                                <div className="xl:col-span-2 bg-[#1A1A18] p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4480A]/10 rounded-full blur-[80px]"></div>
                                    <h3 className="text-xl font-black text-orange-400 mb-6 flex items-center gap-3 relative z-10">
                                        <Globe size={20} /> {t.stream_keys}
                                    </h3>
                                    
                                    <div className="space-y-4 relative z-10">
                                        <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-all">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">YouTube Live</p>
                                                <p className="text-sm font-bold text-white">rtmp://a.rtmp.youtube.com/live2</p>
                                            </div>
                                            <button 
                                                onClick={() => { navigator.clipboard.writeText("rtmp://a.rtmp.youtube.com/live2"); toast.success(t.copied); }}
                                                className="px-4 py-2 bg-orange-400 text-[#1A1A18] rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all"
                                            >
                                                {t.copy_url}
                                            </button>
                                        </div>

                                        <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-all">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Facebook Live</p>
                                                <p className="text-sm font-bold text-white">rtmps://live-api-s.facebook.com:443/rtmp/</p>
                                            </div>
                                            <button 
                                                onClick={() => { navigator.clipboard.writeText("rtmps://live-api-s.facebook.com:443/rtmp/"); toast.success(t.copied); }}
                                                className="px-4 py-2 bg-orange-400 text-[#1A1A18] rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all"
                                            >
                                                {t.copy_url}
                                            </button>
                                        </div>
                                    </div>

                                    <p className="mt-8 text-[10px] text-slate-400 italic font-medium leading-relaxed border-t border-white/5 pt-6">
                                        {t.obs_warning}
                                    </p>
                                </div>
                            </div>

                            {/* Section Guide Visuel */}
                            <div className={`p-10 rounded-[2.5rem] border transition-colors ${
                                darkMode ? "bg-zinc-800/40 border-zinc-700 text-white" : "bg-[#FFF3EC] border-orange-100 text-[#1A1A18]"
                            }`}>
                                <h3 className="text-2xl font-black mb-8 uppercase flex items-center gap-3">
                                    <Play size={24} className="text-[#D4480A]" fill="currentColor" /> 
                                    {t.launch_procedure}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {t.steps.map((item, idx) => (
                                        <div key={idx} className={`p-6 rounded-3xl relative border ${
                                            darkMode ? "bg-zinc-900 border-zinc-700" : "bg-white/60 border-orange-50"
                                        }`}>
                                            <span className="absolute -top-3 -left-3 w-8 h-8 bg-[#1A1A18] text-white rounded-xl flex items-center justify-center font-black text-xs shadow-lg">{item.step}</span>
                                            <p className="font-black text-[#D4480A] uppercase text-xs mb-2 tracking-widest">{item.title}</p>
                                            <p className={`text-[11px] font-bold leading-tight ${darkMode ? "text-zinc-400" : "text-slate-500"}`}>{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "upload" && (
                        <div className={`text-center py-24 rounded-[2rem] border-2 border-dashed transition-colors ${
                            darkMode ? "bg-zinc-850 border-zinc-700" : "bg-[#F5F2EE] border-[#D4480A]/20"
                        }`}>
                            <h2 className={`text-3xl font-black mb-8 uppercase ${darkMode ? "text-white" : "text-[#1A1A18]"}`}>{t.export_audio}</h2>
                            <form onSubmit={handleUpload} className="max-w-md mx-auto space-y-4">
                                <input 
                                    type="text" 
                                    placeholder={t.media_title} 
                                    value={uploadTitle} 
                                    onChange={(e) => setUploadTitle(e.target.value)} 
                                    className={`w-full p-4 rounded-2xl outline-none font-bold border transition-colors ${
                                        darkMode ? "bg-zinc-800 border-zinc-700 text-white focus:border-[#D4480A]" : "bg-white border-slate-200 text-[#1A1A18] focus:border-[#D4480A]"
                                    }`} 
                                />
                                <input type="file" id="audio-upload" className="hidden" accept="audio/*" onChange={(e) => setUploadFile(e.target.files[0])} />
                                <label 
                                    htmlFor="audio-upload" 
                                    className={`w-full p-4 rounded-2xl flex items-center justify-center gap-3 cursor-pointer border transition-colors ${
                                        darkMode ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-750" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                                    }`}
                                >
                                    {uploadFile ? uploadFile.name : t.choose_file}
                                </label>
                                <button 
                                    type="submit" 
                                    disabled={uploadProgress} 
                                    className="w-full bg-[#1A1A18] hover:bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl transform active:scale-95 transition-all"
                                >
                                    {uploadProgress ? t.sending : t.launch_export}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === "history" && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <h2 className={`text-2xl font-black uppercase ${darkMode ? "text-white" : "text-[#1A1A18]"}`}>{t.history}</h2>
                            <div className="grid grid-cols-1 gap-4">
                                {history.map((h) => (
                                    <div key={h.id} className={`p-6 rounded-2xl flex items-center justify-between transition-colors ${
                                        darkMode ? "bg-zinc-850 text-white border border-zinc-800" : "bg-[#F5F2EE]/50"
                                    }`}>
                                        <p className="font-black uppercase text-sm">{h.title}</p>
                                        <span className="text-[10px] font-black text-slate-400 uppercase">{t.broadcasted}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "settings" && (
                        <div className="max-w-xl space-y-10">
                            <h2 className={`text-3xl font-black uppercase ${darkMode ? "text-zinc-100" : "text-[#1A1A18]"}`}>
                                {t.settings}
                            </h2>
                            <form onSubmit={handleUpdateSettings} className="space-y-6">
                                <div className="space-y-2">
                                    <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? "text-zinc-400" : "text-slate-400"}`}>
                                        {t.radio_name}
                                    </label>
                                    <input 
                                        type="text" 
                                        value={settingsData.name} 
                                        onChange={(e) => setSettingsData({ ...settingsData, name: e.target.value })} 
                                        className={`w-full p-4 rounded-2xl outline-none font-bold border transition-all ${
                                            darkMode 
                                            ? "bg-zinc-800 border-zinc-700 text-white focus:border-[#D4480A]" 
                                            : "bg-slate-50 border-slate-100 text-[#1A1A18] focus:border-[#D4480A]"
                                        }`} 
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? "text-zinc-400" : "text-slate-400"}`}>
                                        {t.owner_name}
                                    </label>
                                    <input 
                                        type="text" 
                                        value={settingsData.owner_name} 
                                        onChange={(e) => setSettingsData({ ...settingsData, owner_name: e.target.value })} 
                                        className={`w-full p-4 rounded-2xl outline-none font-bold border transition-all ${
                                            darkMode 
                                            ? "bg-zinc-800 border-zinc-700 text-white focus:border-[#D4480A]" 
                                            : "bg-slate-50 border-slate-100 text-[#1A1A18] focus:border-[#D4480A]"
                                        }`} 
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? "text-zinc-400" : "text-slate-400"}`}>
                                        {t.phone}
                                    </label>
                                    <input 
                                        type="text" 
                                        value={settingsData.phone} 
                                        onChange={(e) => setSettingsData({ ...settingsData, phone: e.target.value })} 
                                        className={`w-full p-4 rounded-2xl outline-none font-bold border transition-all ${
                                            darkMode 
                                            ? "bg-zinc-800 border-zinc-700 text-white focus:border-[#D4480A]" 
                                            : "bg-slate-50 border-slate-100 text-[#1A1A18] focus:border-[#D4480A]"
                                        }`} 
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? "text-zinc-400" : "text-slate-400"}`}>
                                        {t.theme}
                                    </label>
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setDarkMode(false);
                                                localStorage.setItem("channel_dashboard_theme", "light");
                                            }}
                                            className={`flex-1 py-4 px-6 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${
                                                !darkMode
                                                ? "bg-[#D4480A] text-white border-[#D4480A] shadow-lg shadow-orange-200/50"
                                                : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white"
                                            }`}
                                        >
                                            <Sun size={14} /> {t.light}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setDarkMode(true);
                                                localStorage.setItem("channel_dashboard_theme", "dark");
                                            }}
                                            className={`flex-1 py-4 px-6 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${
                                                darkMode
                                                ? "bg-[#D4480A] text-white border-[#D4480A] shadow-lg shadow-orange-950/50"
                                                : "bg-white text-slate-400 border-slate-100 hover:text-slate-700"
                                            }`}
                                        >
                                            <Moon size={14} /> {t.dark}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? "text-zinc-400" : "text-slate-400"}`}>
                                        {t.lang}
                                    </label>
                                    <select 
                                        value={language}
                                        onChange={(e) => {
                                            setLanguage(e.target.value);
                                            localStorage.setItem("channel_dashboard_lang", e.target.value);
                                        }}
                                        className={`w-full p-4 rounded-2xl outline-none font-bold border transition-all ${
                                            darkMode 
                                            ? "bg-zinc-800 border-zinc-700 text-white focus:border-[#D4480A]" 
                                            : "bg-slate-50 border-slate-100 text-[#1A1A18] focus:border-[#D4480A]"
                                        }`}
                                    >
                                        <option value="fr">Français (French)</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading} 
                                    className="w-full bg-[#D4480A] text-white py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl hover:bg-[#B83A08] transition-all disabled:opacity-50 active:scale-95 mt-4"
                                >
                                    {loading ? t.updating : t.update}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            <div className={`w-80 border-l p-8 flex flex-col z-20 transition-colors duration-300 ${
                darkMode ? "bg-zinc-900 border-zinc-800 shadow-zinc-950/50" : "bg-white border-slate-100 shadow-2xl"
            }`}>
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-12 h-12 bg-[#D4480A] rounded-2xl flex items-center justify-center text-white text-xl font-black">
                        {channel.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className={`text-xs font-black ${darkMode ? "text-white" : "text-[#1A1A18]"}`}>{channel.name}</p>
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
                                : `text-slate-400 ${darkMode ? "hover:bg-zinc-800 hover:text-white" : "hover:bg-[#F5F2EE] hover:text-[#1A1A18]"}`
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