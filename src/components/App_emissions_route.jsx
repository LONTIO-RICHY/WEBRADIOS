// Dans ton App.jsx — ajoute ces routes pour les émissions
// Même principe que les chaînes : UNE SEULE route affiche les deux colonnes

import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChainesGauche    from "./components/ChainesGauche";
import ChainesDroite    from "./components/ChainesDroite";
import EmissionsGauche  from "./components/EmissionsGauche";
import EmissionsDroite  from "./components/EmissionsDroite";

// Page Chaînes : deux colonnes côte à côte
function PageChaines() {
  return (
    <div className="flex h-screen">
      <div className="w-1/2 border-r border-gray-200"><ChainesGauche /></div>
      <div className="w-1/2"><ChainesDroite /></div>
    </div>
  );
}

// Page Émissions : deux colonnes côte à côte — même principe
function PageEmissions() {
  return (
    <div className="flex h-screen">
      <div className="w-1/2 border-r border-gray-200"><EmissionsGauche /></div>
      <div className="w-1/2"><EmissionsDroite /></div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes Chaînes */}
        <Route path="/chaines/:id" element={<PageChaines />} />
        <Route path="/chaines"     element={<PageChaines />} />

        {/* Routes Émissions — même logique */}
        <Route path="/emissions/:id" element={<PageEmissions />} />
        <Route path="/emissions"     element={<PageEmissions />} />

        <Route path="/" element={<PageChaines />} />
      </Routes>
    </BrowserRouter>
  );
}
