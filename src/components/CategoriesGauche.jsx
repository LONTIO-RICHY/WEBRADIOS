// Plus besoin de Link ni useParams — on appelle onSelect() au clic
import { CATEGORIES } from "./categories.data";
import { Radio } from "lucide-react";

export default function CategoriesGauche({ activeId, onSelect }) {

  return (
    <div className="flex flex-col h-full bg-[#F5F2EE] border-r border-slate-200">

      <h2 className="px-6 py-4 text-xl font-black text-[#1A1A18] border-b border-slate-100 flex items-center gap-2">
         <div className="p-2 bg-[#D4480A] rounded-lg shadow-lg shadow-orange-200/30">
            <Radio className="text-white" size={18} strokeWidth={2} />
         </div>
         Catégories
      </h2>

      <div className="px-6 py-4">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Filtrer par genre</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar">
        <div className="grid grid-cols-1 gap-3">
          {CATEGORIES.map((cat) => {
            const estActif = String(cat.id) === String(activeId);

            return (
              <div
                key={cat.id}
                onClick={() => onSelect(cat.id)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center gap-4
                  ${estActif
                    ? "bg-white border-[#D4480A] shadow-xl shadow-orange-100"
                    : "bg-white border-transparent hover:border-orange-100 hover:shadow-md"}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm ${estActif ? "bg-[#FFF3EC]" : "bg-slate-50"}`}>
                  {cat.emoji}
                </div>
                <div className="flex-1">
                    <p className={`text-sm font-black uppercase tracking-tight ${estActif ? "text-[#D4480A]" : "text-[#1A1A18]"}`}>
                    {cat.nom}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cat.stats}</p>
                </div>
                {estActif && <div className="w-2 h-2 bg-[#D4480A] rounded-full animate-pulse"></div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}