import { useState } from "react";
import CategoriesDroite from "./CategoriesDroite";
import CategoriesGauche from "./CategoriesGauche";

export const Categorie = () => {
  const [categorieActiveId, setCategorieActiveId] = useState(null);

  return (
    <div className="flex h-screen bg-[#F5F2EE] overflow-hidden">
      <div className="w-full md:w-80 lg:w-96 flex-shrink-0 shadow-xl z-20">
        <CategoriesGauche
          activeId={categorieActiveId}
          onSelect={setCategorieActiveId}
        />
      </div>
      <div className="flex-1 overflow-hidden relative z-10">
        <CategoriesDroite id={categorieActiveId} />
      </div>
    </div>
  );
};