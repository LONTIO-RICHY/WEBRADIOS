import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../Api";
import { Users, Radio, Trash2, UserPlus, UserMinus, BarChart3, Settings, Play, Eraser, Eye, X, Calendar, Clock, Music, Search, MapPin } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AdminDashboard = () => {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ users: 0, channels: 0, chart_data: [] });
    const [users, setUsers] = useState([]);
    const [channels, setChannels] = useState([]);
    const [emissions, setEmissions] = useState([]);
    const [tracks, setTracks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [planning, setPlanning] = useState([]);
    const [newSlot, setNewSlot] = useState({ channel_id: "", date: "", start: "", end: "", track_info: "" });
    const [newCat, setNewCat] = useState({ name: "", description: "", icon: "bx-radio" });
    const [activeTab, setActiveTab] = useState("stats");
    const [isSyncing, setIsSyncing] = useState(false);
    const [showUnclassifiedOnly, setShowUnclassifiedOnly] = useState(false);

    // États pour la recherche
    const [searchUser, setSearchUser] = useState("");
    const [searchChannel, setSearchChannel] = useState("");
    const [searchTrack, setSearchTrack] = useState("");

    // État pour la gestion du contenu d'une chaîne spécifique
    const [viewChannelContent, setViewChannelContent] = useState(null);
    const [channelEmissions, setChannelEmissions] = useState([]);
    const [isManualTrack, setIsManualTrack] = useState(false);

    const CAMEROON_REGIONS = [
        "Adamaoua", "Centre", "Est", "Extrême-Nord", "Littoral", "Nord", "Nord-Ouest", "Ouest", "Sud", "Sud-Ouest"
    ];

    useEffect(() => {
        if (!currentUser?.is_admin) {
            navigate("/");
            return;
        }
        fetchStats();
        fetchUsers();
        fetchChannels();
        fetchEmissions();
        fetchTracks();
        fetchCategories();
        fetchPlanning();
    }, [currentUser, navigate, activeTab]);

    if (!currentUser || !currentUser.is_admin) {
        return null;
    }

    const fetchPlanning = async () => {
        if (!currentUser?.token) return;
        try {
            const res = await api.get("/api/admin/planning", { headers: { Authorization: `Bearer ${currentUser.token}` } });
            setPlanning(res.data);
        } catch (err) { console.error(err); }
    };

    const addSlot = async (e) => {
        e.preventDefault();
        try {
            const start_time = `${newSlot.date}T${newSlot.start}:00`;
            const end_time = `${newSlot.date}T${newSlot.end}:00`;
            await api.post("/api/admin/planning", {
                channel_id: parseInt(newSlot.channel_id),
                start_time,
                end_time,
                track_info: newSlot.track_info
            }, { headers: { Authorization: `Bearer ${currentUser.token}` } });
            setNewSlot({ channel_id: "", date: "", start: "", end: "", track_info: "" });
            setIsManualTrack(false);
            fetchPlanning();
            toast.success("Créneau ajouté au planning");
        } catch (err) { toast.error("Erreur lors de l'ajout du créneau"); }
    };

    const deleteSlot = async (id) => {
        if (!window.confirm("Supprimer ce créneau ?")) return;
        try {
            await api.delete(`/api/admin/planning/${id}`, { headers: { Authorization: `Bearer ${currentUser.token}` } });
            fetchPlanning();
            toast.success("Créneau supprimé");
        } catch (err) { toast.error("Erreur suppression"); }
    };

    const fetchCategories = async () => {
        if (!currentUser?.token) return;
        try {
            const res = await api.get("/api/categories", { headers: { Authorization: `Bearer ${currentUser.token}` } });
            setCategories(res.data);
        } catch (err) { console.error(err); }
    };

    const addCategory = async (e) => {
        e.preventDefault();
        try {
            await api.post("/api/categories", newCat, { headers: { Authorization: `Bearer ${currentUser.token}` } });
            setNewCat({ name: "", description: "", icon: "bx-radio" });
            fetchCategories();
            toast.success("Catégorie ajoutée");
        } catch (err) { toast.error("Erreur ajout catégorie"); }
    };

    const deleteCategory = async (id) => {
        if (!window.confirm("Supprimer cette catégorie ?")) return;
        try {
            await api.delete(`/api/categories/${id}`, { headers: { Authorization: `Bearer ${currentUser.token}` } });
            fetchCategories();
            toast.success("Catégorie supprimée");
        } catch (err) { toast.error("Erreur suppression catégorie"); }
    };

    const clearCategory = async (id) => {
        if (!window.confirm("VOULEZ-VOUS VIDER TOUT LE CONTENU (Chaînes et Émissions) DE CETTE CATÉGORIE ? La catégorie elle-même restera.")) return;
        try {
            await api.delete(`/api/admin/categories/${id}/clear`, { headers: { Authorization: `Bearer ${currentUser.token}` } });
            fetchChannels();
            fetchEmissions();
            fetchStats();
            toast.success("Contenu de la catégorie vidé");
        } catch (err) { toast.error("Erreur lors du vidage"); }
    };

    const fetchStats = async () => {
        if (!currentUser?.token) return;
        try {
            const res = await api.get("/api/admin/stats", { headers: { Authorization: `Bearer ${currentUser.token}` } });
            setStats(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchUsers = async () => {
        if (!currentUser?.token) return;
        try {
            const res = await api.get("/api/admin/users", { headers: { Authorization: `Bearer ${currentUser.token}` } });
            setUsers(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchChannels = async () => {
        if (!currentUser?.token) return;
        try {
            const res = await api.get("/api/admin/channels", { headers: { Authorization: `Bearer ${currentUser.token}` } });
            setChannels(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchEmissions = async () => {
        if (!currentUser?.token) return;
        try {
            const res = await api.get("/api/admin/emissions", { headers: { Authorization: `Bearer ${currentUser.token}` } });
            setEmissions(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchTracks = async () => {
        if (!currentUser?.token) return;
        try {
            const res = await api.get("/api/admin/tracks", { headers: { Authorization: `Bearer ${currentUser.token}` } });
            setTracks(res.data);
        } catch (err) { console.error(err); }
    };

    const deleteTrack = async (id) => {
        if (!window.confirm("Supprimer définitivement ce fichier audio ?")) return;
        try {
            await api.delete(`/api/admin/tracks/${id}`, { headers: { Authorization: `Bearer ${currentUser.token}` } });
            fetchTracks();
            toast.success("Fichier supprimé");
        } catch (err) { toast.error("Erreur suppression audio"); }
    };

    const handlePromote = async (id) => {
        try {
            await api.post(`/api/admin/promote/${id}`, {}, { headers: { Authorization: `Bearer ${currentUser.token}` } });
            fetchUsers();
            toast.success("Utilisateur promu Admin");
        } catch (err) { toast.error("Erreur promotion"); }
    };

    const handleDemote = async (id) => {
        try {
            await api.post(`/api/admin/demote/${id}`, {}, { headers: { Authorization: `Bearer ${currentUser.token}` } });
            fetchUsers();
            toast.success("Droits Admin révoqués");
        } catch (err) { toast.error("Erreur rétrogradation"); }
    };

    const handlePromoteCreator = async (id) => {
        try {
            await api.post(`/api/admin/promote-creator/${id}`, {}, { headers: { Authorization: `Bearer ${currentUser.token}` } });
            fetchUsers();
            fetchChannels();
            fetchStats();
            toast.success("Utilisateur promu Créateur de chaîne");
        } catch (err) {
            toast.error(err.response?.data?.detail || "Erreur promotion créateur");
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm("Supprimer cet utilisateur ?")) return;
        try {
            await api.delete(`/api/admin/users/${id}`, { headers: { Authorization: `Bearer ${currentUser.token}` } });
            fetchUsers();
            fetchStats();
            toast.success("Utilisateur supprimé");
        } catch (err) { toast.error("Erreur suppression"); }
    };

    const deleteChannel = async (id) => {
        if (!window.confirm("Supprimer cette chaîne ?")) return;
        try {
            await api.delete(`/api/admin/channels/${id}`, { headers: { Authorization: `Bearer ${currentUser.token}` } });
            fetchChannels();
            fetchStats();
            toast.success("Chaîne supprimée");
        } catch (err) { toast.error("Erreur suppression"); }
    };

    const handleSyncRadioBrowser = async () => {
        setIsSyncing(true);
        const loadToast = toast.loading("Synchronisation avec Radio-Browser en cours...");
        try {
            const res = await api.post("/api/admin/sync-radiobrowser", {}, { 
                headers: { Authorization: `Bearer ${currentUser.token}` } 
            });
            toast.dismiss(loadToast);
            toast.success(`${res.data.message} : ${res.data.imported} importées, ${res.data.updated} déjà présentes.`);
            fetchChannels();
            fetchStats();
        } catch (err) {
            toast.dismiss(loadToast);
            toast.error("Erreur lors de la synchronisation");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleAutoAssignRegions = async () => {
        setIsSyncing(true);
        const loadToast = toast.loading("Auto-assignation des régions en cours...");
        try {
            const res = await api.post("/api/admin/auto-assigner-regions", {}, { 
                headers: { Authorization: `Bearer ${currentUser.token}` } 
            });
            toast.dismiss(loadToast);
            toast.success(`${res.data.message} : ${res.data.assigned} régions assignées.`);
            fetchChannels();
        } catch (err) {
            toast.dismiss(loadToast);
            toast.error("Erreur lors de l'auto-assignation");
        } finally {
            setIsSyncing(false);
        }
    };

    const updateChannelField = async (channelId, field, value) => {
        try {
            await api.patch(`/api/admin/channels/${channelId}`, { [field]: value || null }, {
                headers: { Authorization: `Bearer ${currentUser.token}` }
            });
            setChannels(prev => prev.map(c => c.id === channelId ? { ...c, [field]: value } : c));
            toast.success("Mise à jour effectuée", { duration: 1000 });
        } catch (err) {
            toast.error("Erreur mise à jour");
        }
    };

    const deleteEmission = async (id, fromChannelView = false) => {
        if (!window.confirm("Supprimer cette émission/archive ?")) return;
        try {
            await api.delete(`/api/admin/emissions/${id}`, { headers: { Authorization: `Bearer ${currentUser.token}` } });
            if (fromChannelView) {
                setChannelEmissions(prev => prev.filter(em => em.id !== id));
            } else {
                fetchEmissions();
            }
            toast.success("Émission supprimée");
        } catch (err) { toast.error("Erreur suppression"); }
    };

    const openChannelContent = async (channel) => {
        setViewChannelContent(channel);
        try {
            const res = await api.get(`/api/channels/${channel.id}/emissions`);
            setChannelEmissions(res.data);
        } catch (err) {
            toast.error("Erreur chargement contenu");
        }
    };

    const sidebarItems = [
        { id: "stats", label: "Statistiques", icon: <BarChart3 size={20} /> },
        { id: "users", label: "Utilisateurs", icon: <Users size={20} /> },
        { id: "channels", label: "Chaînes Radio", icon: <Radio size={20} /> },
        { id: "planning", label: "Planning d'Antenne", icon: <Calendar size={20} /> },
        { id: "emissions", label: "Surveillance Live", icon: <Play size={20} /> },
        { id: "tracks", label: "Gestion Audio", icon: <Trash2 size={20} /> },
        { id: "settings", label: "Paramètres Globaux", icon: <Settings size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-[#F5F2EE]">
            {/* Sidebar Admin */}
            <div className="w-80 bg-white p-8 flex flex-col border-r border-slate-100 shadow-2xl z-20">
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-12 h-12 bg-[#D4480A] rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-orange-200">L</div>
                    <div>
                        <h2 className="font-black text-lg text-[#1A1A18] tracking-tight leading-tight">LUKO<span className="text-[#D4480A]">ADMIN</span></h2>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Contrôle Antenne</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-3">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setViewChannelContent(null); }}
                            className={`w-full flex items-center gap-4 p-5 rounded-[1.25rem] font-black text-xs uppercase tracking-widest transition-all ${
                                activeTab === item.id && !viewChannelContent
                                ? "bg-[#D4480A] text-white shadow-xl shadow-orange-200" 
                                : "text-slate-400 hover:bg-[#F5F2EE] hover:text-[#1A1A18]"
                            }`}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-10 overflow-y-auto pb-32">
                <div className="mb-10 animate-in fade-in slide-in-from-left-4 duration-300">
                    <h1 className="text-4xl font-black text-[#1A1A18] tracking-tighter uppercase">
                        {viewChannelContent ? `Contenu : ${viewChannelContent.name}` : sidebarItems.find(i => i.id === activeTab)?.label}
                    </h1>
                    <p className="text-slate-400 font-bold text-sm italic mt-1">
                        {viewChannelContent ? "Gestion individuelle des émissions et archives de cette chaîne" : "Interface de modération avancée"}
                    </p>
                </div>

                {/* VUE CONTENU CHAÎNE (MODAL-LIKE) */}
                {viewChannelContent && (
                    <div className="bg-white rounded-[2.5rem] border border-orange-50 shadow-2xl p-8 animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-50">
                            <h2 className="text-xl font-black text-[#1A1A18] uppercase">Émissions & Archives</h2>
                            <button onClick={() => setViewChannelContent(null)} className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {channelEmissions.map(e => (
                                <div key={e.id} className="flex items-center justify-between p-6 bg-[#F5F2EE]/50 rounded-2xl hover:bg-white border border-transparent hover:border-orange-100 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${e.is_live ? "bg-[#2D7A3A] text-white animate-pulse" : "bg-white text-slate-400 shadow-sm"}`}>
                                            <Play size={18} fill="currentColor" />
                                        </div>
                                        <div>
                                            <p className="font-black text-[#1A1A18] uppercase text-sm">{e.title || "Sans titre"}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {e.audio_path ? "Archive MP3" : "Direct / Flux"} • ID: {e.id}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => deleteEmission(e.id, true)} className="p-3 bg-red-50 text-[#C0392B] rounded-xl hover:bg-[#C0392B] hover:text-white transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            {channelEmissions.length === 0 && (
                                <p className="text-center py-10 text-slate-400 font-bold italic">Aucun contenu trouvé sur cette chaîne.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* VUES STANDARDS */}
                {!viewChannelContent && activeTab === "stats" && (
                    <div className="space-y-10 animate-in zoom-in duration-300">
                        {/* Résumé rapide */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white p-8 rounded-[2rem] border border-orange-50 shadow-xl group">
                                <p className="text-[#D4480A] font-black uppercase text-[10px] tracking-widest mb-2">Inscriptions</p>
                                <p className="text-5xl font-black text-[#1A1A18] tracking-tighter">{stats.users}</p>
                                <p className="text-slate-400 text-xs font-bold mt-2 italic">Total utilisateurs</p>
                            </div>
                            <div className="bg-[#1A1A18] p-8 rounded-[2rem] shadow-xl group">
                                <p className="text-orange-400 font-black uppercase text-[10px] tracking-widest mb-2">Diffusion</p>
                                <p className="text-5xl font-black text-white tracking-tighter">{stats.channels}</p>
                                <p className="text-slate-500 text-xs font-bold mt-2 italic">Chaînes créées</p>
                            </div>
                            <div className="bg-[#FFF3EC] p-8 rounded-[2rem] border border-orange-100 shadow-xl group">
                                <p className="text-[#D4480A] font-black uppercase text-[10px] tracking-widest mb-2">Engagement</p>
                                <p className="text-5xl font-black text-[#1A1A18] tracking-tighter">{stats.chart_data?.reduce((acc, curr) => acc + (curr.creators || 0), 0) || 0}</p>
                                <p className="text-[#D4480A]/60 text-xs font-bold mt-2 italic">Nouveaux créateurs (28j)</p>
                            </div>
                        </div>

                        {/* Graphiques */}
                        <div className="grid grid-cols-1 gap-8">
                            <div className="bg-white p-8 rounded-[2.5rem] border border-orange-50 shadow-2xl">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-lg font-black text-[#1A1A18] uppercase tracking-tighter">Courbe de croissance des Utilisateurs</h3>
                                    <span className="text-[10px] font-black bg-[#F5F2EE] px-3 py-1 rounded-full text-slate-400 uppercase">28 derniers jours</span>
                                </div>
                                <div className="h-[300px] min-h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={stats.chart_data}>
                                            <defs>
                                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#D4480A" stopOpacity={0.1}/>
                                                    <stop offset="95%" stopColor="#D4480A" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F2EE" />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} />
                                            <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}} />
                                            <Area type="monotone" dataKey="users" name="Utilisateurs" stroke="#D4480A" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-white p-8 rounded-[2.5rem] border border-orange-50 shadow-2xl">
                                    <div className="flex justify-between items-center mb-8">
                                        <h3 className="text-lg font-black text-[#1A1A18] uppercase tracking-tighter">Création de Chaînes</h3>
                                        <Radio size={16} className="text-[#D4480A]" />
                                    </div>
                                    <div className="h-[250px] min-h-[250px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={stats.chart_data}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F2EE" />
                                                <XAxis dataKey="date" hide />
                                                <Tooltip />
                                                <Area type="stepAfter" dataKey="channels" name="Chaînes" stroke="#1A1A18" strokeWidth={2} fill="#F5F2EE" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white p-8 rounded-[2.5rem] border border-orange-50 shadow-2xl">
                                    <div className="flex justify-between items-center mb-8">
                                        <h3 className="text-lg font-black text-[#1A1A18] uppercase tracking-tighter">Nouveaux Créateurs</h3>
                                        <Users size={16} className="text-[#D4480A]" />
                                    </div>
                                    <div className="h-[250px] min-h-[250px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={stats.chart_data}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F2EE" />
                                                <XAxis dataKey="date" hide />
                                                <Tooltip />
                                                <Area type="monotone" dataKey="creators" name="Créateurs" stroke="#D4480A" strokeWidth={2} fill="#FFF3EC" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!viewChannelContent && activeTab === "users" && (
                    <div className="space-y-6">
                        <div className="flex bg-white p-4 rounded-3xl border border-orange-50 shadow-sm items-center gap-4">
                            <Search className="text-slate-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="Rechercher un utilisateur par nom ou email..." 
                                className="flex-1 bg-transparent outline-none font-bold text-sm"
                                value={searchUser}
                                onChange={(e) => setSearchUser(e.target.value)}
                            />
                        </div>
                        <div className="bg-white rounded-[2.5rem] overflow-hidden border border-orange-50 shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
                            <table className="w-full text-left">
                                <thead className="bg-[#F5F2EE] text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-orange-50">
                                    <tr>
                                        <th className="p-6">Utilisateur</th>
                                        <th className="p-6">Email</th>
                                        <th className="p-6">Rôle</th>
                                        <th className="p-6">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {users.filter(u => 
                                        u.username.toLowerCase().includes(searchUser.toLowerCase()) || 
                                        u.email.toLowerCase().includes(searchUser.toLowerCase())
                                    ).length > 0 ? (
                                        users.filter(u => 
                                            u.username.toLowerCase().includes(searchUser.toLowerCase()) || 
                                            u.email.toLowerCase().includes(searchUser.toLowerCase())
                                        ).map(u => (
                                            <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="p-6"><p className="font-black text-[#1A1A18] uppercase tracking-tight">{u.username}</p></td>
                                                <td className="p-6 text-sm font-medium text-slate-500">{u.email}</td>
                                                <td className="p-6">
                                                    <div className="flex flex-wrap gap-2">
                                                        {u.is_admin ? <span className="bg-[#FFF3EC] text-[#D4480A] px-3 py-1 rounded-full text-[10px] font-black border border-orange-100">ADMIN</span> : <span className="bg-slate-100 text-slate-400 px-3 py-1 rounded-full text-[10px] font-black">USER</span>}
                                                        {u.is_creator && <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black border border-emerald-100">CRÉATEUR</span>}
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <div className="flex gap-2">
                                                        {u.username !== currentUser.username && (
                                                            <>
                                                                {u.is_admin ? <button onClick={() => handleDemote(u.id)} className="p-3 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-600 hover:text-white transition-all" title="Révoquer droits Admin"><UserMinus size={16} /></button> : <button onClick={() => handlePromote(u.id)} className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all" title="Promouvoir Admin"><UserPlus size={16} /></button>}
                                                                {!u.is_creator && (
                                                                    <button onClick={() => handlePromoteCreator(u.id)} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all" title="Nommer Créateur de chaîne"><Radio size={16} /></button>
                                                                )}
                                                                <button onClick={() => deleteUser(u.id)} className="p-3 bg-red-50 text-[#C0392B] rounded-xl hover:bg-[#C0392B] hover:text-white transition-all" title="Supprimer l'utilisateur"><Trash2 size={16} /></button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="p-20 text-center">
                                                <Search size={48} className="mx-auto mb-4 text-slate-200" />
                                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Aucun utilisateur ne correspond à votre recherche</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {!viewChannelContent && activeTab === "channels" && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="flex bg-white p-4 rounded-3xl border border-orange-50 shadow-sm items-center gap-4 flex-1 w-full">
                                <Search className="text-slate-400" size={20} />
                                <input 
                                    type="text" 
                                    placeholder="Rechercher une chaîne ou un créateur..." 
                                    className="flex-1 bg-transparent outline-none font-bold text-sm"
                                    value={searchChannel}
                                    onChange={(e) => setSearchChannel(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-4 w-full md:w-auto">
                                <button
                                    onClick={handleAutoAssignRegions}
                                    disabled={isSyncing}
                                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                                        isSyncing ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-[#FFF3EC] text-[#D4480A] hover:bg-[#D4480A] hover:text-white shadow-lg shadow-orange-100 border border-orange-100"
                                    }`}
                                    title="Tente de deviner la région via le nom de la chaîne"
                                >
                                    <MapPin size={16} />
                                    Auto-Régions
                                </button>
                                <button
                                    onClick={handleSyncRadioBrowser}
                                    disabled={isSyncing}
                                    className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                                        isSyncing ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-[#1A1A18] text-white hover:bg-[#D4480A] shadow-lg shadow-orange-100"
                                    }`}
                                >
                                    <Radio size={16} className={isSyncing ? "animate-spin" : ""} />
                                    {isSyncing ? "Sync en cours..." : "Sync Radio-Browser"}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-white/50 p-4 rounded-2xl border border-dashed border-orange-200">
                            <input 
                                type="checkbox" 
                                id="unclassified"
                                className="w-5 h-5 accent-[#D4480A]"
                                checked={showUnclassifiedOnly}
                                onChange={(e) => setShowUnclassifiedOnly(e.target.checked)}
                            />
                            <label htmlFor="unclassified" className="text-xs font-black text-slate-500 uppercase tracking-widest cursor-pointer select-none">
                                Afficher uniquement les chaînes non classées
                            </label>
                        </div>

                        <div className="bg-white rounded-[2.5rem] border border-orange-50 shadow-2xl animate-in slide-in-from-bottom-4 duration-500 overflow-x-auto">
                            <table className="w-full text-left min-w-[1000px]">
                                <thead className="bg-[#F5F2EE] text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-orange-50">
                                    <tr>
                                        <th className="p-6">Chaîne</th>
                                        <th className="p-6">Propriétaire</th>
                                        <th className="p-6">Catégorie</th>
                                        <th className="p-6">Statut</th>
                                        <th className="p-6">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {channels.filter(c => {
                                        const matchesSearch = (c.name || "").toLowerCase().includes(searchChannel.toLowerCase()) || 
                                                            (c.owner_name || "").toLowerCase().includes(searchChannel.toLowerCase());
                                        const isUnclassified = !c.category_id || !c.region;
                                        return matchesSearch && (!showUnclassifiedOnly || isUnclassified);
                                    }).length > 0 ? (
                                        channels.filter(c => {
                                            const matchesSearch = (c.name || "").toLowerCase().includes(searchChannel.toLowerCase()) || 
                                                                (c.owner_name || "").toLowerCase().includes(searchChannel.toLowerCase());
                                            const isUnclassified = !c.category_id || !c.region;
                                            return matchesSearch && (!showUnclassifiedOnly || isUnclassified);
                                        }).map(c => (
                                            <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="p-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-[#FFF3EC] rounded-xl flex items-center justify-center text-[#D4480A] font-black">
                                                            {(c.name || "R").charAt(0).toUpperCase()}
                                                        </div>
                                                        <p className="font-black text-[#1A1A18] uppercase tracking-tight text-sm">{c.name}</p>
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <p className="text-xs font-bold text-slate-500">{c.owner_name}</p>
                                                    <p className="text-[10px] text-slate-400 italic">{c.payment_method}</p>
                                                </td>
                                                <td className="p-6">
                                                    <select 
                                                        className={`p-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 outline-none transition-all w-full
                                                            ${!c.category_id ? "border-orange-200 bg-orange-50 text-[#D4480A]" : "border-slate-100 bg-white text-slate-700 focus:border-[#D4480A]"}`}
                                                        value={c.category_id || ""}
                                                        onChange={(e) => updateChannelField(c.id, "category_id", e.target.value)}
                                                    >
                                                        <option value="">— Non classée —</option>
                                                        {categories.map(cat => (
                                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="p-6">
                                                    {(!c.category_id || !c.region) ? (
                                                        <span className="flex items-center gap-1 text-[9px] font-black text-orange-600 bg-orange-100 px-2 py-1 rounded-full uppercase animate-pulse">
                                                            ⚠ Incomplet
                                                        </span>
                                                    ) : (
                                                        <span className="text-[9px] font-black text-green-600 bg-green-100 px-2 py-1 rounded-full uppercase">
                                                            ✓ Classée
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-6">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => openChannelContent(c)} title="Gérer et Classer" className="p-2 bg-[#1A1A18] text-white rounded-xl transition-all shadow-md hover:scale-105">
                                                            <Eye size={16} />
                                                        </button>
                                                        <button onClick={() => deleteChannel(c.id)} className="p-2 text-slate-300 hover:text-[#C0392B] transition-colors">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="p-20 text-center">
                                                <Radio size={48} className="mx-auto mb-4 text-slate-200" />
                                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Aucune chaîne ne correspond à votre recherche</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {!viewChannelContent && activeTab === "planning" && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                        <div className="bg-white p-10 rounded-[2.5rem] border border-orange-50 shadow-2xl">
                            <h2 className="text-2xl font-black text-[#1A1A18] mb-8 uppercase tracking-tighter">Attribuer un créneau d'antenne</h2>
                            <form onSubmit={addSlot} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8 bg-[#F5F2EE] rounded-3xl border border-slate-100 items-end">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Chaîne</label>
                                    <select className="w-full p-4 rounded-2xl outline-none font-bold text-sm bg-white border border-slate-200" value={newSlot.channel_id} onChange={(e) => {
                                        setNewSlot({...newSlot, channel_id: e.target.value, track_info: ""});
                                        setIsManualTrack(false);
                                    }} required>
                                        <option value="">Sélectionner une chaîne...</option>
                                        {[...channels]
                                            .filter(c => (c.payment_method || "").toLowerCase().trim() !== "import")
                                            .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
                                            .map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                                        }
                                    </select>
                                </div>
                                {newSlot.channel_id && emissions.filter(em => em.channel_id === parseInt(newSlot.channel_id)).length > 0 && !isManualTrack ? (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center ml-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase">Émission de la chaîne</label>
                                            <button type="button" onClick={() => { setIsManualTrack(true); setNewSlot({...newSlot, track_info: ""}); }} className="text-[9px] font-black text-[#D4480A] uppercase hover:underline">Saisir manuellement</button>
                                        </div>
                                        <select className="w-full p-4 rounded-2xl outline-none font-bold text-sm bg-white border border-slate-200" value={newSlot.track_info} onChange={(e) => setNewSlot({...newSlot, track_info: e.target.value})} required>
                                            <option value="">Sélectionner une émission...</option>
                                            {emissions.filter(em => em.channel_id === parseInt(newSlot.channel_id)).map(em => (
                                                <option key={em.id} value={em.title}>{em.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center ml-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase">Titre de l'Audio / Émission</label>
                                            {newSlot.channel_id && emissions.filter(em => em.channel_id === parseInt(newSlot.channel_id)).length > 0 && (
                                                <button type="button" onClick={() => { setIsManualTrack(false); setNewSlot({...newSlot, track_info: ""}); }} className="text-[9px] font-black text-[#D4480A] uppercase hover:underline">Sélectionner une émission</button>
                                            )}
                                        </div>
                                        <input type="text" placeholder="Ex: Playlist Zouk" className="w-full p-4 rounded-2xl outline-none font-bold text-sm bg-white" value={newSlot.track_info} onChange={(e) => setNewSlot({...newSlot, track_info: e.target.value})} required />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Date</label>
                                    <input type="date" className="w-full p-4 rounded-2xl outline-none font-bold text-sm bg-white" value={newSlot.date} onChange={(e) => setNewSlot({...newSlot, date: e.target.value})} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Début</label>
                                    <input type="time" className="w-full p-4 rounded-2xl outline-none font-bold text-sm bg-white" value={newSlot.start} onChange={(e) => setNewSlot({...newSlot, start: e.target.value})} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Fin</label>
                                    <input type="time" className="w-full p-4 rounded-2xl outline-none font-bold text-sm bg-white" value={newSlot.end} onChange={(e) => setNewSlot({...newSlot, end: e.target.value})} required />
                                </div>
                                <button type="submit" className="bg-[#D4480A] text-white h-[52px] rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-[#B83A08] transition-all">Valider le créneau</button>
                            </form>

                            <div className="mt-12 space-y-4">
                                {planning.map(slot => (
                                    <div key={slot.id} className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-3xl hover:shadow-xl hover:border-orange-100 transition-all group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 bg-[#FFF3EC] text-[#D4480A] rounded-2xl flex items-center justify-center shadow-sm">
                                                <Clock size={24} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-black text-[#1A1A18] uppercase tracking-tight">{slot.channel_name}</p>
                                                    <span className="text-[9px] font-black bg-[#1A1A18] text-white px-2 py-0.5 rounded-full uppercase">Prog</span>
                                                </div>
                                                <p className="text-sm font-bold text-[#D4480A] mb-1 flex items-center gap-2">
                                                    <Music size={14} /> {slot.track_info || "Musique indéfinie"}
                                                </p>
                                                <div className="flex items-center gap-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                                                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(slot.start_time).toLocaleDateString()}</span>
                                                    <span>•</span>
                                                    <span>{new Date(slot.start_time).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} - {new Date(slot.end_time).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => deleteSlot(slot.id)} className="p-4 bg-red-50 text-[#C0392B] rounded-2xl hover:bg-[#C0392B] hover:text-white transition-all"><Trash2 size={20} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {!viewChannelContent && activeTab === "emissions" && (
                    <div className="bg-white rounded-[2.5rem] border border-orange-50 shadow-2xl p-6">
                        <h2 className="text-xl font-black text-[#1A1A18] mb-8 uppercase tracking-widest border-b border-slate-50 pb-4 flex justify-between items-center">Surveillance Live</h2>
                        <div className="space-y-4">
                            {emissions.map((e) => (
                                <div key={e.id} className="flex items-center justify-between p-6 bg-[#F5F2EE]/50 rounded-[2rem] hover:bg-white border border-transparent hover:border-orange-100 transition-all group">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition-all ${e.is_live ? "bg-[#2D7A3A] text-white animate-pulse" : "bg-slate-900 text-orange-500"}`}>
                                            <Play size={24} fill="currentColor" />
                                        </div>
                                        <div>
                                            <p className="font-black text-[#1A1A18] uppercase tracking-tight">{e.title}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chaîne ID: {e.channel_id} • User #{e.creator_id}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => deleteEmission(e.id)} className="py-3 px-6 bg-red-50 text-[#C0392B] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#C0392B] hover:text-white transition-all">Supprimer</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!viewChannelContent && activeTab === "tracks" && (
                    <div className="space-y-6">
                        <div className="flex bg-white p-4 rounded-3xl border border-orange-50 shadow-sm items-center gap-4">
                            <Search className="text-slate-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="Rechercher un audio par titre..." 
                                className="flex-1 bg-transparent outline-none font-bold text-sm"
                                value={searchTrack}
                                onChange={(e) => setSearchTrack(e.target.value)}
                            />
                        </div>
                        <div className="bg-white rounded-[2.5rem] border border-orange-50 shadow-2xl p-6">
                            <h2 className="text-xl font-black text-[#1A1A18] mb-8 uppercase tracking-widest border-b border-slate-50 pb-4 flex justify-between items-center">Gestion Bibliothèque Globale</h2>
                            <div className="space-y-4">
                                {tracks.filter(t => 
                                    t.title.toLowerCase().includes(searchTrack.toLowerCase())
                                ).length > 0 ? (
                                    tracks.filter(t => 
                                        t.title.toLowerCase().includes(searchTrack.toLowerCase())
                                    ).map((t) => (
                                        <div key={t.id} className="flex items-center justify-between p-6 bg-[#F5F2EE]/30 rounded-[2rem] hover:bg-white border border-transparent hover:border-orange-100 transition-all group">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#D4480A] shadow-md group-hover:bg-[#D4480A] group-hover:text-white transition-all">
                                                    <Music size={24} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-[#1A1A18] uppercase tracking-tight">{t.title}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fichier: {t.file_path.split('\\').pop()} • User #{t.owner_id}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => deleteTrack(t.id)} className="p-4 bg-red-50 text-[#C0392B] rounded-2xl hover:bg-[#C0392B] hover:text-white transition-all"><Trash2 size={20} /></button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center">
                                        <Music size={48} className="mx-auto mb-4 text-slate-200" />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Aucun fichier audio ne correspond à votre recherche</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {!viewChannelContent && activeTab === "settings" && (
                    <div className="space-y-8 animate-in zoom-in duration-300">
                        <div className="bg-white p-10 rounded-[2.5rem] border border-orange-50 shadow-2xl">
                            <h2 className="text-2xl font-black text-[#1A1A18] mb-8 uppercase tracking-tighter">Gestion des Catégories</h2>
                            <form onSubmit={addCategory} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 p-6 bg-[#F5F2EE] rounded-3xl border border-slate-100">
                                <input type="text" placeholder="Nom" className="p-4 rounded-2xl outline-none font-bold text-sm" value={newCat.name} onChange={(e) => setNewCat({...newCat, name: e.target.value})} required />
                                <input type="text" placeholder="Description" className="p-4 rounded-2xl outline-none font-bold text-sm" value={newCat.description} onChange={(e) => setNewCat({...newCat, description: e.target.value})} />
                                <button type="submit" className="bg-[#D4480A] text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-lg">Ajouter</button>
                            </form>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {categories.map(cat => (
                                    <div key={cat.id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:shadow-xl transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-[#FFF3EC] text-[#D4480A] rounded-xl flex items-center justify-center"><i className={`bx ${cat.icon || 'bx-radio'} text-xl`}></i></div>
                                            <div>
                                                <p className="font-black text-[#1A1A18] uppercase text-xs">{cat.name}</p>
                                                <p className="text-[10px] text-slate-400 w-24 truncate">{cat.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => clearCategory(cat.id)} title="Vider le contenu de la catégorie" className="p-2 text-orange-400 hover:bg-orange-50 rounded-lg transition-all">
                                                <Eraser size={16} />
                                            </button>
                                            <button onClick={() => deleteCategory(cat.id)} title="Supprimer la catégorie" className="p-2 text-slate-200 hover:text-[#C0392B] transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
