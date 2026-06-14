import { useState } from "react";
import CategoriesDroite from "./CategoriesDroite";
import CategoriesGauche from "./CategoriesGauche";

export const Categorie = () => {
  const [activeId, setActiveId] = useState(null);
  const [activeRegion, setActiveRegion] = useState(null);

  const handleSelectGenre = (id) => {
    setActiveId(prev => prev === id ? null : id);
    // On ne reset plus la région, pour permettre le filtrage combiné
  };

  const handleSelectRegion = (region) => {
    setActiveRegion(prev => prev === region ? null : region);
    // On ne reset plus le genre
  };

  return (
    <div className="flex h-screen bg-[#F5F2EE] overflow-hidden">
      <div className="w-full md:w-80 lg:w-96 flex-shrink-0 shadow-xl z-20">
        <CategoriesGauche
          activeId={activeId}
          activeRegion={activeRegion}
          onSelectGenre={handleSelectGenre}
          onSelectRegion={handleSelectRegion}
        />
      </div>
      <div className="flex-1 overflow-hidden relative z-10">
        <CategoriesDroite genreId={activeId} region={activeRegion} />
      </div>
    </div>
  );
};