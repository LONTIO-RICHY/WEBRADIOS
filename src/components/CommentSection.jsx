import { useState, useEffect } from "react";
import api from "../Api";
import { useAuth } from "../context/AuthContext";
import { MessageSquare, Send, User } from "lucide-react";
import toast from "react-hot-toast";

export default function CommentSection({ channelId = null, emissionId = null }) {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchComments = async () => {
        try {
            let url = "/api/comments?";
            if (channelId) url += `channel_id=${channelId}`;
            if (emissionId) url += `emission_id=${emissionId}`;
            
            const res = await api.get(url);
            setComments(res.data);
        } catch (err) {
            console.error("Erreur chargement commentaires", err);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [channelId, emissionId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error("Connectez-vous pour commenter !");
            return;
        }
        if (!newComment.trim()) return;

        setLoading(true);
        try {
            await api.post("/api/comments", {
                content: newComment,
                channel_id: channelId,
                emission_id: emissionId
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setNewComment("");
            toast.success("Commentaire publié !");
            fetchComments();
        } catch (err) {
            toast.error("Erreur lors de l'envoi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 md:p-8 mt-8 animate-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-xl font-black text-[#1A1A18] mb-8 flex items-center gap-3">
                <div className="p-2 bg-[#D4480A] rounded-lg shadow-lg shadow-orange-200/30">
                    <MessageSquare className="text-white" size={20} strokeWidth={2.5} />
                </div>
                Espace Discussion
            </h3>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="mb-10 relative group">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={user ? "Partagez votre avis..." : "Connectez-vous pour participer à la discussion"}
                    disabled={!user || loading}
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#D4480A]/10 focus:border-[#D4480A] focus:bg-white transition-all text-sm min-h-[120px] resize-none pr-16"
                />
                <button
                    type="submit"
                    disabled={!user || loading || !newComment.trim()}
                    className="absolute bottom-4 right-4 p-3 bg-[#D4480A] text-white rounded-xl shadow-lg shadow-orange-200 hover:bg-[#B83A08] transition-all disabled:opacity-30 disabled:shadow-none active:scale-90"
                >
                    <Send size={20} strokeWidth={2.5} />
                </button>
            </form>

            {/* Liste des commentaires */}
            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                {comments.length > 0 ? (
                    comments.map((c) => (
                        <div key={c.id} className="flex gap-4 group">
                            <div className="w-10 h-10 bg-[#FFF3EC] rounded-full flex items-center justify-center text-[#D4480A] shrink-0 border border-orange-50">
                                <User size={20} strokeWidth={2.5} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-black text-[#1A1A18] uppercase tracking-tight">{c.username}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                                        {new Date(c.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl rounded-tl-none border border-slate-100 text-sm text-slate-600 leading-relaxed group-hover:bg-white group-hover:border-orange-100 transition-all">
                                    {c.content}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 opacity-40">
                        <MessageSquare size={48} className="mx-auto mb-4 text-slate-200" />
                        <p className="text-sm font-bold italic">Soyez le premier à commenter !</p>
                    </div>
                )}
            </div>
        </div>
    );
}
