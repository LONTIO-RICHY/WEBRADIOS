// ChainesDroite.jsx — Détail de la chaîne sélectionnée (colonne droite)
// Lit l'id dans l'URL via useParams() → affiche les infos de la chaîne cliquée
// Backend plus tard : remplacer la recherche dans CHAINES par fetch("GET /api/chaines/:id")

import { useParams } from "react-router-dom";
import { CHAINES } from "./chaines.data";

export default function ChainesDroite() {
  const { id } = useParams(); // récupère l'id depuis l'URL (/chaines/1, /chaines/2...)

  // Cherche la chaîne correspondante dans les données
  // Backend : remplacer par → const chaine = await fetch(`/api/chaines/${id}`)
  const chaine = CHAINES.find((c) => String(c.id) === id);

  // Aucune chaîne sélectionnée → message d'invitation
  if (!chaine) return (
    <div className="flex items-center justify-center h-full text-gray-400">
      <p>← Sélectionnez une chaîne pour voir ses détails</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">

      {/* ── Bannière hero ── */}
      <div className="bg-gray-900 p-6 flex items-center gap-5">
        <div className={`${chaine.couleur} w-20 h-20 rounded-full flex items-center
          justify-center text-white text-xl font-bold flex-shrink-0`}>
          {chaine.initials}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{chaine.nom}</h1>
          <p className="text-gray-400 text-sm mt-1">{chaine.description}</p>
          <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-red-500
            text-white text-xs font-bold rounded-full">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            EN DIRECT
          </span>
        </div>
      </div>

      {/* ── Statistiques ── */}
      <div className="flex gap-3 p-4">
        {chaine.stats.map((s) => (
          <div key={s.label} className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-red-500">{s.val}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Boutons action ── */}
      {/* Backend : POST /api/chaines/:id/ecouter | POST /api/favoris */}
      <div className="flex gap-3 px-4 pb-4">
        <button className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white
          text-sm font-bold rounded-xl transition">
          ▶ Écouter
        </button>
        <button className="px-5 py-2 border border-gray-200 hover:bg-gray-50
          text-sm font-semibold rounded-xl transition">
          ♥ Favori
        </button>
      </div>

      {/* ── Programme en cours ── */}
      <div className="px-4">
        <h3 className="text-sm font-bold text-gray-800 mb-2">Programme en cours</h3>
        <div className="space-y-2">
          {chaine.programme.map((p, i) => (
            <div key={i} className={`flex items-center gap-4 p-3 rounded-xl border
              ${p.maintenant ? "bg-red-50 border-red-300" : "border-gray-100"}`}>
              <span className={`text-sm font-bold w-12 flex-shrink-0
                ${p.maintenant ? "text-red-500" : "text-gray-400"}`}>
                {p.heure}
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{p.nom}</p>
                <p className="text-xs text-gray-400">{p.desc}</p>
              </div>
              {p.maintenant && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
                  Maintenant
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
