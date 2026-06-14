import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

function Listederoulante() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <div className="relative top-4 left-4 z-[100]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="block cursor-pointer p-2 hover:bg-orange-50 rounded-lg transition-colors"
      >
        {isOpen ? <X size={24} className="text-[#D4480A]" /> : <Menu size={24} className="text-[#1A1A18]" />}
      </button>

      <div className={`
        absolute left-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-orange-50 overflow-hidden
        transition-all duration-300 origin-top-left
        ${isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}
      `}>
        <div className="p-2 space-y-1">
          <Link to="/Studio" onClick={closeMenu} className="flex items-center gap-3 p-4 hover:bg-[#FFF3EC] rounded-xl transition-all group">
            <span className="text-sm font-black text-[#1A1A18] uppercase tracking-tight group-hover:text-[#D4480A]">Podcasts(streaming)</span>
          </Link>
          <Link to="/CommentairesPage" onClick={closeMenu} className="flex items-center gap-3 p-4 hover:bg-[#FFF3EC] rounded-xl transition-all group">
            <span className="text-sm font-black text-[#1A1A18] uppercase tracking-tight group-hover:text-[#D4480A]">Suggestion Rencontrée</span>
          </Link>
          <Link to="/Planning" onClick={closeMenu} className="flex items-center gap-3 p-4 hover:bg-[#FFF3EC] rounded-xl transition-all group">
            <span className="text-sm font-black text-[#1A1A18] uppercase tracking-tight group-hover:text-[#D4480A]">Planification des émissions</span>
          </Link>
          <div className="h-px bg-slate-100 my-2 mx-4" />
          <a href="#" className="flex items-center gap-3 p-4 hover:bg-[#F5F2EE] rounded-xl transition-all group opacity-50 cursor-not-allowed">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Historisation</span>
          </a>
          <a href="#" className="flex items-center gap-3 p-4 hover:bg-[#F5F2EE] rounded-xl transition-all group opacity-50 cursor-not-allowed">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Actualité</span>
          </a>
          <a href="#" className="flex items-center gap-3 p-4 hover:bg-[#F5F2EE] rounded-xl transition-all group opacity-50 cursor-not-allowed">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Liste music</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Listederoulante;