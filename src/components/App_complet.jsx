// App.jsx COMPLET — Chaînes + Émissions + Catégories
// Chaque page = deux colonnes liées par React Router (useParams + Link)

import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChainesGauche    from "./components/ChainesGauche";
import ChainesDroite    from "./components/ChainesDroite";
import EmissionsGauche  from "./components/EmissionsGauche";
import EmissionsDroite  from "./components/EmissionsDroite";
import CategoriesGauche from "./components/CategoriesGauche";
import CategoriesDroite from "./components/CategoriesDroite";

// Mise en page split 50/50 — réutilisée par les 3 pages
function SplitLayout({ Gauche, Droite }) {
  return (
    <div className="flex h-screen">
      <div className="w-1/2 border-r border-gray-200"><Gauche /></div>
      <div className="w-1/2"><Droite /></div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Chaînes */}
        <Route path="/chaines/:id" element={<SplitLayout Gauche={ChainesGauche}    Droite={ChainesDroite}    />} />
        <Route path="/chaines"     element={<SplitLayout Gauche={ChainesGauche}    Droite={ChainesDroite}    />} />
        {/* Émissions */}
        <Route path="/emissions/:id" element={<SplitLayout Gauche={EmissionsGauche}  Droite={EmissionsDroite}  />} />
        <Route path="/emissions"     element={<SplitLayout Gauche={EmissionsGauche}  Droite={EmissionsDroite}  />} />
        {/* Catégories */}
        <Route path="/categories/:id" element={<SplitLayout Gauche={CategoriesGauche} Droite={CategoriesDroite} />} />
        <Route path="/categories"     element={<SplitLayout Gauche={CategoriesGauche} Droite={CategoriesDroite} />} />

        <Route path="/" element={<SplitLayout Gauche={ChainesGauche} Droite={ChainesDroite} />} />
      </Routes>
    </BrowserRouter>
  );
}
