import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Api";
import { ArrowLeft, MessageSquare, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";

function CommentairesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await api.get("/api/comments");
      setComments(response.data);
    } catch (err) {
      console.error("Impossible de charger les messages", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");

    if (!user) {
      setErreur("Vous devez être connecté pour participer à la discussion.");
      return;
    }

    if (newComment.trim() === "") {
      return;
    }

    try {
      await api.post(
        "/api/comments",
        { content: newComment },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setNewComment("");
      fetchComments(); 
    } catch (err) {
      setErreur(err.response?.data?.detail || "Une erreur est survenue.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2EE] p-8 flex flex-col items-center pb-32">
      
      <button 
        onClick={() => navigate(-1)} 
        className="self-start mb-10 bg-white text-[#D4480A] px-6 py-3 rounded-2xl shadow-sm border border-orange-50 hover:shadow-xl transition-all font-black text-xs uppercase tracking-widest flex items-center gap-2"
      >
        <ArrowLeft size={16} strokeWidth={2.5} /> Retour à l'Antenne
      </button>

      <div className="w-full max-w-3xl bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-orange-100/20 border border-orange-50 flex flex-col h-[75vh] animate-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl font-black text-[#1A1A18] text-center border-b border-slate-50 pb-8 tracking-tighter uppercase flex items-center justify-center gap-3">
          Espace <span className="text-[#D4480A]">Auditeurs</span> <MessageSquare size={32} strokeWidth={2} className="text-[#D4480A]" />
        </h1>

        {erreur && <div className="bg-red-50 text-[#C0392B] p-4 rounded-xl text-xs font-black uppercase tracking-widest mt-6 border border-red-100">{erreur}</div>}

        {/* LISTE DES DISCUSSIONS */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-4 py-8 custom-scrollbar">
          {comments.map((comment) => (
            <div key={comment.id} className="group p-5 bg-[#F5F2EE]/50 rounded-[2rem] border border-transparent hover:border-orange-100 hover:bg-white hover:shadow-lg transition-all animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-2">
                <span className="font-black text-[#D4480A] text-xs uppercase tracking-wider bg-[#FFF3EC] px-3 py-1 rounded-full">@{comment.username}</span>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  {new Date(comment.created_at).toLocaleDateString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </div>
              <p className="text-slate-600 text-sm font-medium leading-relaxed italic">"{comment.content}"</p>
            </div>
          ))}

          {comments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 opacity-30">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 italic">...</div>
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">
                Aucun message. Soyez le premier !
                </p>
            </div>
          )}
        </div>

        {/* CHAMP DE SAISIE EN BAS */}
        <form onSubmit={handleSubmit} className="flex space-x-3 border-t border-slate-50 pt-8 mt-4">
          <input
            type="text"
            placeholder="Réagissez en direct..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 p-5 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-[#D4480A]/10 focus:border-[#D4480A] focus:bg-white text-sm bg-slate-50 font-medium transition-all"
          />
          <button 
            type="submit" 
            className="bg-[#1A1A18] hover:bg-black text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 transition-all active:scale-95 flex items-center gap-2"
          >
            <Send size={16} strokeWidth={2.5} /> Poster
          </button>
        </form>

      </div>
    </div>
  );
}

export default CommentairesPage;
