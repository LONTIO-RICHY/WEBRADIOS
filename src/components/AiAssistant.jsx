import { useState, useEffect, useRef } from "react";
import { Brain, Send, Sparkles, Lightbulb, FileText, X, Loader2, MessageSquare, Check, HelpCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../Api";
import predefinedQuestions from "../data/predefinedQuestions.json";
import toast from "react-hot-toast";

export default function AiAssistant({ activeEmissionId, onSummaryGenerated }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Bonjour ! Je suis votre assistant IA LUKOLIVE. Comment puis-je vous aider aujourd'hui ? Vous pouvez me poser vos questions ou utiliser l'un des boutons de raccourci ci-dessous.",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Faire défiler vers le bas lors de l'ajout de messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);



  const handleSendMessage = async (text) => {
    if (!user) return;
    const queryText = text || inputText;
    if (!queryText.trim()) return;

    if (!text) {
      setInputText("");
    }

    // Ajouter le message de l'utilisateur à la conversation
    setMessages((prev) => [...prev, { sender: "user", text: queryText }]);
    setLoading(true);

    try {
      const response = await api.post(
        "/api/ai/chat",
        { question: queryText },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: response.data.response },
      ]);
    } catch (error) {
      console.error("Erreur IA Chat:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "⚠️ Désolé, je n'ai pas pu traiter votre demande pour le moment. Veuillez réessayer.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    if (!user) return;
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: "🔍 Recommande-moi des catégories et émissions basées sur mes préférences." },
    ]);
    setLoading(true);

    try {
      const response = await api.post(
        "/api/ai/recommendations",
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: response.data.response },
      ]);
    } catch (error) {
      console.error("Erreur IA Recs:", error);
      toast.error("Impossible de charger les recommandations");
    } finally {
      setLoading(false);
    }
  };

  const fetchInspiration = async () => {
    if (!user) return;
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: "💡 Donne-moi des idées d'émissions et des conseils d'animation." },
    ]);
    setLoading(true);

    try {
      const response = await api.post(
        "/api/ai/inspiration",
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: response.data.response },
      ]);
    } catch (error) {
      console.error("Erreur IA Inspiration:", error);
      toast.error("Impossible d'obtenir des conseils d'inspiration");
    } finally {
      setLoading(false);
    }
  };

  const summarizeEmission = async (emissionId) => {
    if (!user || !emissionId) return;
    setIsOpen(true);
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: `📝 Génère un résumé textuel pour l'émission #${emissionId}` },
    ]);
    setLoading(true);

    try {
      const response = await api.post(
        `/api/ai/summarize/${emissionId}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      const fileUrl = `http://localhost:8000${response.data.file_url}`;
      setMessages((prev) => [
        ...prev,
        { 
          sender: "ai", 
          text: response.data.summary,
          fileUrl: fileUrl
        },
      ]);
      
      if (onSummaryGenerated) {
        onSummaryGenerated(response.data);
      }
      toast.success("Résumé généré avec succès !");
    } catch (error) {
      console.error("Erreur IA résumé:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "⚠️ Une erreur s'est produite lors de la génération du résumé de l'émission. Veuillez vérifier si l'émission possède des commentaires et une description.",
        },
      ]);
      toast.error("Erreur de génération de résumé");
    } finally {
      setLoading(false);
    }
  };

  // Permet de déclencher un résumé depuis l'extérieur (via une prop ou un événement)
  useEffect(() => {
    if (activeEmissionId && user) {
      summarizeEmission(activeEmissionId);
    }
  }, [activeEmissionId, user]);

  useEffect(() => {
    const handleTriggerSummary = (e) => {
      if (e.detail && e.detail.emissionId && user) {
        summarizeEmission(e.detail.emissionId);
      }
    };
    window.addEventListener("trigger-ai-summary", handleTriggerSummary);
    return () => {
      window.removeEventListener("trigger-ai-summary", handleTriggerSummary);
    };
  }, [user]);

  // Si l'utilisateur n'est pas connecté, l'IA n'est pas accessible
  if (!user) return null;

  return (
    <>
      {/* Bouton flottant de l'IA */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-28 right-6 z-[90] p-4 bg-[#D4480A] text-white rounded-full shadow-lg shadow-orange-300/40 hover:shadow-orange-400/50 hover:bg-[#B83A08] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center border border-orange-400/20"
        title="Assistant IA LUKOLIVE"
      >
        <Sparkles size={28} className="animate-pulse" />
      </button>

      {/* Rideau sombre d'arrière-plan */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-[#1A1A18]/30 backdrop-blur-sm z-[98] transition-all duration-300"
        />
      )}

      {/* Panneau de l'assistant IA (Glassmorphic) */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-[460px] bg-white/90 backdrop-blur-xl border-l border-gray-200/50 shadow-2xl z-[99] flex flex-col transition-all duration-500 transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* En-tête */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-orange-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#FFF3EC] rounded-2xl text-[#D4480A] shadow-inner">
              <Brain size={24} />
            </div>
            <div>
              <h3 className="font-black text-[#1A1A18] tracking-tight uppercase text-base flex items-center gap-1.5">
                Assistant LUKO<span className="text-[#D4480A]">IA</span>
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Connecté en tant que {user.username}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-400 hover:text-[#1A1A18] hover:bg-slate-100 rounded-xl transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Zone de conversation */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-[1.5rem] p-4 text-sm shadow-sm transition-all duration-300 ${
                  msg.sender === "user"
                    ? "bg-[#D4480A] text-white rounded-br-none font-medium"
                    : "bg-white/80 backdrop-blur-sm text-slate-800 rounded-bl-none border border-slate-100"
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                {msg.fileUrl && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                      <Check size={12} className="text-[#2D7A3A]" /> Version Texte Générée
                    </span>
                    <a
                      href={msg.fileUrl}
                      download={`resume_emission.txt`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF3EC] hover:bg-[#FFEBE0] text-[#D4480A] text-xs font-bold rounded-xl transition shadow-sm"
                    >
                      <FileText size={14} /> Télécharger (.txt)
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/80 border border-slate-100 rounded-[1.5rem] rounded-bl-none p-4 flex items-center gap-2 text-slate-400 text-sm shadow-sm">
                <Loader2 className="animate-spin" size={16} />
                <span>L'IA réfléchit...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Outils et Raccourcis IA */}
        <div className="px-5 py-3 bg-slate-50/80 border-t border-gray-100 space-y-2">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
            <Sparkles size={12} className="text-[#D4480A]" /> Actions Rapides
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={fetchRecommendations}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#FFF3EC] border border-slate-100 hover:border-orange-200 text-slate-700 hover:text-[#D4480A] text-xs font-bold rounded-xl transition shadow-sm"
            >
              <Sparkles size={13} />
              Recommandations
            </button>
            <button
              onClick={fetchInspiration}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#FFF3EC] border border-slate-100 hover:border-orange-200 text-slate-700 hover:text-[#D4480A] text-xs font-bold rounded-xl transition shadow-sm"
            >
              <Lightbulb size={13} />
              Conseils & Inspirations
            </button>
          </div>
        </div>

        {/* Questions prédéfinies de l'utilisateur */}
        <div className="px-5 py-3 bg-white border-t border-gray-100 space-y-2">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <HelpCircle size={12} className="text-[#D4480A]" /> Questions Fréquentes
          </div>
          <div className="flex flex-col gap-1.5 max-h-[120px] overflow-y-auto pr-1">
            {predefinedQuestions.map((q) => (
              <button
                key={q.id}
                onClick={() => handleSendMessage(q.text)}
                disabled={loading}
                className="w-full text-left px-3 py-2 bg-slate-50 hover:bg-[#FFF3EC] hover:text-[#D4480A] text-slate-600 text-xs font-medium rounded-xl transition border border-transparent hover:border-orange-200 flex items-center justify-between group"
              >
                <span>{q.text}</span>
                <span className="text-[9px] font-bold text-slate-400 bg-slate-200/50 group-hover:bg-[#FFF3EC] group-hover:text-[#D4480A] px-1.5 py-0.5 rounded-md transition uppercase">
                  {q.category}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Zone de saisie */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 border-t border-gray-100 bg-white flex gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
            placeholder="Posez votre question à LukoIA..."
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 focus:border-[#D4480A]/30 focus:bg-white rounded-2xl outline-none text-sm transition focus:ring-2 focus:ring-[#D4480A]/10"
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="p-3 bg-[#D4480A] hover:bg-[#B83A08] text-white rounded-2xl transition disabled:opacity-50 disabled:hover:bg-[#D4480A] shadow-md shadow-orange-200/50 active:scale-95"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </>
  );
}
