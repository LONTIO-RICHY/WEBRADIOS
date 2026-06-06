// Plus besoin de Link ni useParams — on appelle onSelect() au clic
import { CATEGORIES } from "./categories.data";

export default function CategoriesGauche({ activeId, onSelect }) {

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">

      <h2 className="px-4 py-3 text-sm font-bold text-gray-800 border-b border-gray-100">
         Catégories
      </h2>

      <div className="px-4 py-3">
        <p className="text-sm font-semibold text-gray-700">Toutes les catégories</p>
        <p className="text-xs text-gray-400 mt-1">
          Sélectionnez un genre pour filtrer les chaînes
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => {
            const estActif = String(cat.id) === String(activeId);

            return (
              // onClick au lieu de Link — pas de navigation, juste mise à jour du state
              <div
                key={cat.id}
                onClick={() => onSelect(cat.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition
                  ${estActif
                    ? `${cat.bg} ${cat.bordure}`
                    : "bg-gray-50 border-gray-200 hover:border-gray-300"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-2xl ${cat.couleur}`}>{cat.emoji}</span>
                  {estActif && <span className="text-red-500 font-bold text-sm">✓</span>}
                </div>
                <p className={`text-sm font-bold ${estActif ? cat.couleur : "text-gray-800"}`}>
                  {cat.nom}
                </p>
                <p className="text-xs text-gray-400 mt-1">{cat.stats}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}