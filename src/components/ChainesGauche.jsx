// ChainesGauche.jsx — Liste des chaînes (colonne gauche)
// Chaque chaîne est un lien React Router vers /chaines/:id
// La colonne droite (ChainesDroite) lit l'id dans l'URL via useParams()

import { Link, useParams } from "react-router-dom";
import { CHAINES } from "./chaines.data";
import { Search } from "@boxicons/react";

export default function ChainesGauche() {
  const { id } = useParams(); // id de la chaîne active dans l'URL

  return (
    <div className="flex flex-col h-full border-r border-gray-200 bg-white">

      {/* Titre */}
      <h2 className="px-4 py-3 text-sm font-bold text-gray-800 border-b border-gray-100 flex m-auto">
        <div className="m-auto">
              <svg  xmlns="http://www.w3.org/2000/svg" width="24" height="24"  
fill="currentColor" viewBox="0 0 24 24" >
<path d="m20.39 2.21-3.01 2.34c-1.55-1.54-3.56-2.44-5.66-2.54-2.15-.09-4.14.65-5.6 2.1-1.46 1.46-2.21 3.45-2.1 5.6.1 2.12 1.02 4.14 2.58 5.7.44.44.91.82 1.42 1.15v3.43h-3v2h8v-2h-3v-2.45c.74.25 1.5.4 2.29.44h.39c2 0 3.84-.74 5.21-2.11 1.46-1.46 2.21-3.45 2.1-5.6-.07-1.48-.55-2.91-1.36-4.18l2.98-2.32-1.23-1.58ZM18 10.38c.08 1.58-.46 3.04-1.52 4.09s-2.5 1.59-4.09 1.52c-1.62-.08-3.17-.78-4.38-1.99S6.1 11.24 6.02 9.62c-.08-1.58.46-3.04 1.52-4.09C8.53 4.54 9.87 4 11.34 4h.29c1.52.07 2.99.71 4.16 1.79L11.4 9.21l1.23 1.58 4.43-3.45c.56.93.89 1.97.94 3.04"></path>
</svg>
          </div> Toutes les chaînes
      </h2>

      {/* Barre de recherche → connecter à GET /api/chaines?q=... */}
      <div className="px-3 py-2 flex relative">
        <span className="top-4 left-2 absolute "><Search /></span>
        <input
          placeholder="  Rechercher une chaîne..."
          className="w-full px-3 py-2 text-sm bg-gray-100 rounded-lg outline-none focus:ring-2 focus:ring-red-400"
        />
      </div>

      {/* Liste des chaînes — chaque item est un <Link> React Router */}
      <ul className="flex-1 overflow-y-auto px-2 space-y-1">
        {CHAINES.map((c) => {
          const estActif = String(c.id) === id; // chaîne sélectionnée ?

          return (
            // Link vers /chaines/:id → React Router met à jour l'URL
            // ChainesDroite lit cet id avec useParams() et affiche les détails
            <Link to={`/Chaines/${c.id}`} key={c.id}>
              <li className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition
                ${estActif
                  ? "bg-red-50 border-2 border-red-400"       // style actif
                  : "border border-gray-100 hover:bg-gray-50"  // style normal
                }`}>

                {/* Avatar coloré */}
                <div className={`${c.couleur} w-10 h-10 rounded-full flex items-center
                  justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {c.initials}
                </div>

                {/* Nom + genre */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{c.nom}</p>
                  <p className="text-xs text-gray-400">{c.genre}</p>
                </div>

                {/* Auditeurs + icône play */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-400">👥 {c.auditeurs}</span>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs
                    ${estActif ? "bg-red-500 text-white" : "bg-gray-100 text-gray-400"}`}>
                    ▶
                  </div>
                </div>
              </li>
            </Link>
          );
        })}
      </ul>
    </div>
  );
}
