// EmissionsGauche.jsx — Liste des émissions (colonne gauche)
// Clic sur une émission → change l'URL → /emissions/:id
// EmissionsDroite lit useParams() et affiche le détail

import { Link, useParams } from "react-router-dom";
import { EMISSIONS } from "./emissions.data";
import { Search } from "@boxicons/react";

const ONGLETS = ["En direct", "À venir", "Replay"];

export default function EmissionsGauche() {
  const { id } = useParams(); // id de l'émission active dans l'URL

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">

      {/* Titre */}
      <h2 className="px-4 py-3 text-sm font-bold text-gray-800 border-b border-gray-100">
        🎙️ Émissions
      </h2>

      {/* Barre de recherche → GET /api/emissions?q=... */}
      <div className="px-3 py-2 flex relative">
              <span className="top-4 left-2 absolute "><Search /></span>
        <input
          placeholder=" Rechercher une émission..."
          className="w-full px-3 py-2 text-sm top-0 left-0 bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-red-400"
        />
      </div>

      {/* Onglets filtre → GET /api/emissions?statut=live|a-venir|replay */}
      <div className="flex gap-2 px-3 pb-2">
        {ONGLETS.map((o, i) => (
          <button key={o}
            className={`px-3 py-1 text-xs rounded-full font-medium transition
              ${i === 0
                ? "bg-red-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {o}
          </button>
        ))}
      </div>

      {/* Liste des émissions */}
      <ul className="flex-1 overflow-y-auto px-2 space-y-1">
        {EMISSIONS.map((e) => {
          const estActif = String(e.id) === id;

          return (
            // Clic → URL change vers /emissions/:id
            // EmissionsDroite se met à jour automatiquement via useParams()
            <Link to={`/emissions/${e.id}`} key={e.id}>
              <li className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition
                ${estActif
                  ? "bg-red-50 border-2 border-red-400"
                  : "border border-gray-100 hover:bg-gray-50"}`}>

                {/* Avatar coloré */}
                <div className={`${e.couleur} w-10 h-10 rounded-full flex items-center
                  justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {e.initials}
                </div>

                {/* Nom + animateur + horaire */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{e.nom}</p>
                  <p className="text-xs text-gray-400">{e.animateur} · {e.horaire}</p>
                </div>

                {/* Badge LIVE ou genre */}
                {e.live
                  ? <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full flex-shrink-0">● LIVE</span>
                  : <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full flex-shrink-0">{e.genre}</span>
                }
              </li>
            </Link>
          );
        })}
      </ul>
    </div>
  );
}
