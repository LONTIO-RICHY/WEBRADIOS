// App.jsx — Comment utiliser les deux composants ensemble
// Installe react-router-dom : npm install react-router-dom

import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChainesGauche from "./components/ChainesGauche";
import ChainesDroite from "./components/ChainesDroite";

export default function App() {
  return (
    <BrowserRouter>
      {/* Layout split 50/50 */}
      <div className="flex h-screen">

        {/* Colonne GAUCHE — toujours visible, contient les Links */}
        <div className="w-1/2">
          {/*
            ChainesGauche affiche la liste.
            Chaque clic sur une chaîne change l'URL → /chaines/1, /chaines/2...
            React Router met à jour la colonne droite automatiquement.
          */}
          <Routes>
            <Route path="/chaines/*" element={<ChainesGauche />} />
            <Route path="*"          element={<ChainesGauche />} />
          </Routes>
        </div>

        {/* Colonne DROITE — change selon l'URL */}
        <div className="w-1/2">
          {/*
            ChainesDroite lit l'id dans l'URL avec useParams().
            Quand l'URL passe à /chaines/2, elle affiche NRJ.
            Aucun prop à passer → la communication se fait via l'URL.
          */}
          <Routes>
            <Route path="/chaines/:id" element={<ChainesDroite />} />
            <Route path="*"            element={<ChainesDroite />} />
          </Routes>
        </div>

      </div>
    </BrowserRouter>
  );
}
