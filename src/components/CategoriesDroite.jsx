// Plus besoin de useParams — reçoit l'id directement via props
import { CATEGORIES } from "./categories.data";

export default function CategoriesDroite({ id }) {

  const cat = CATEGORIES.find((c) => String(c.id) === String(id));

  if (!cat) return (
    <div className="flex items-center justify-center h-full text-gray-400">
      <p>← Sélectionnez une catégorie pour voir ses chaînes</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">

      <div className={`mx-4 mt-4 p-4 rounded-xl border-2 ${cat.bg} ${cat.bordure}`}>
        <div className="flex items-center gap-3">
          <span className={`text-3xl ${cat.couleur}`}>{cat.emoji}</span>
          <div>
            <h1 className={`text-xl font-bold ${cat.couleur}`}>{cat.nom}</h1>
            <p className="text-xs text-gray-500 mt-1">{cat.meta}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-5">

        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-2">Chaînes disponibles</h3>
          <div className="border-t border-gray-100 divide-y divide-gray-100">
            {cat.chaines.map((c) => (
              <div key={c.nom} className="flex items-center gap-3 py-3">
                <div className={`${c.couleur} w-10 h-10 rounded-full flex items-center
                  justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {c.initials}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{c.nom}</p>
                  <p className="text-xs text-gray-400">{c.auditeurs} auditeurs</p>
                </div>
                <div className="flex items-center gap-2">
                  {c.top && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700
                      text-xs font-bold rounded-lg">⭐ Top</span>
                  )}
                  <button className="w-8 h-8 bg-red-500 hover:bg-red-600
                    rounded-full flex items-center justify-center text-white text-xs transition">
                    ▶
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-2">Émissions {cat.nom}</h3>
          <div className="space-y-2">
            {cat.emissions.map((e) => (
              <div key={e.nom}
                className={`flex items-center justify-between p-3 rounded-xl border
                  ${e.live ? "bg-red-50 border-red-200" : "border-gray-100"}`}>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{e.nom}</p>
                  <p className="text-xs text-gray-400">{e.info}</p>
                </div>
                {e.live && (
                  <span className="px-2 py-1 bg-red-500 text-white
                    text-xs font-bold rounded-full">● LIVE</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}