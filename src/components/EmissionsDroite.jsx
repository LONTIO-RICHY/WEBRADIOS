// EmissionsDroite.jsx — Détail de l'émission sélectionnée (colonne droite)
// Lit l'id dans l'URL via useParams() → affiche les infos complètes
// Backend : remplacer EMISSIONS.find() par fetch("GET /api/emissions/:id")

import { useParams } from "react-router-dom";
import { EMISSIONS } from "./emissions.data";

export default function EmissionsDroite() {
  const { id } = useParams();

  // Cherche l'émission par id — Backend : fetch(`/api/emissions/${id}`)
  const e = EMISSIONS.find((em) => String(em.id) === id);

  // Aucune émission sélectionnée
  if (!e) return (
    <div className="flex items-center justify-center h-full text-gray-400">
      <p>← Sélectionnez une émission pour voir ses détails</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">

      {/* ── Bannière hero ── */}
      <div className="bg-gray-900 p-6 flex items-center gap-5">
        <div className={`${e.couleur} w-20 h-20 rounded-full flex items-center
          justify-center text-white text-xl font-bold flex-shrink-0`}>
          {e.initials}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{e.nom}</h1>
          <p className="text-gray-400 text-sm mt-1">{e.chaine} · {e.horaire}</p>
          {e.live && (
            <span className="inline-flex items-center gap-1 mt-2 px-3 py-1
              bg-red-500 text-white text-xs font-bold rounded-full">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              EN DIRECT
            </span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5">

        {/* ── Description ── */}
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-1">À propos de l'émission</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{e.description}</p>
        </div>

        {/* ── Animateurs ── */}
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-2">Animateurs</h3>
          <div className="flex gap-3 flex-wrap">
            {e.animateurs.map((a) => (
              <div key={a.nom} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 min-w-44">
                <div className={`${a.couleur} w-9 h-9 rounded-full flex items-center
                  justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {a.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{a.nom}</p>
                  <p className="text-xs text-gray-400">{a.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Prochaines diffusions ── */}
        <div>
          <h3 className="text-sm font-bold text-gray-800 mb-2">Prochaines diffusions</h3>
          <div className="border-t border-gray-100 divide-y divide-gray-100">
            {e.diffusions.map((d) => (
              <div key={d.jour} className="flex items-center py-2 gap-4">
                <span className={`text-sm w-28 flex-shrink-0 font-medium
                  ${d.today ? "text-red-500" : "text-gray-700"}`}>
                  📅 {d.jour}
                </span>
                <span className="text-sm text-gray-500 flex-1">{d.heure}</span>
                {/* Backend : POST /api/rappels { emissionId, userId } */}
                {d.today && (
                  <button className="px-3 py-1 text-xs border border-gray-200
                    rounded-lg hover:bg-gray-50 text-gray-600 transition">
                    Rappel
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Boutons action ── */}
        {/* Backend : POST /api/chaines/:id/ecouter | POST /api/favoris */}
        <div className="flex gap-3 pt-2">
          <button className="flex-1 py-2 bg-red-500 hover:bg-red-600
            text-white text-sm font-bold rounded-xl transition">
            ▶ Écouter
          </button>
          <button className="px-5 py-2 border border-gray-200 hover:bg-gray-50
            text-sm font-semibold rounded-xl transition">
            🔔 Rappel
          </button>
          <button className="px-5 py-2 border border-gray-200 hover:bg-gray-50
            text-sm font-semibold rounded-xl transition">
            ♥ Favori
          </button>
        </div>
      </div>
    </div>
  );
}
