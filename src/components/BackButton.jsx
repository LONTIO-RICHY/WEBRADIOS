import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export const BackButton = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Ne pas afficher le bouton de retour sur la page d'accueil
    if (location.pathname === "/") {
        return null;
    }

    return (
        <button
            onClick={() => navigate(-1)}
            className="fixed top-24 left-4 z-[90] flex items-center gap-2 p-3 md:px-4 md:py-2.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 text-[#1A1A18] hover:text-[#D4480A] hover:bg-[#FFF3EC] hover:border-[#D4480A]/20 shadow-md hover:shadow-lg active:scale-95 transition-all duration-300 group cursor-pointer"
            title="Retour à la page précédente"
            aria-label="Retour"
        >
            <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" strokeWidth={2.5} />
            <span className="hidden md:inline font-bold text-xs uppercase tracking-wider">Retour</span>
        </button>
    );
};

export default BackButton;
