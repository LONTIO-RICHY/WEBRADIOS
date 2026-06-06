import { useState } from "react";
import CategoriesDroite from "./CategoriesDroite";
import CategoriesGauche from "./CategoriesGauche";

export const Categorie = () => {
  const [categorieActiveId, setCategorieActiveId] = useState(null);

  return (
    <div className="flex">
      <div className="w-1/3 h-screen border-2 border-black bg-gray-500 m-2 text-center">
        <CategoriesGauche
          activeId={categorieActiveId}
          onSelect={setCategorieActiveId}
        />
      </div>
      <div className="w-2/3 h-screen bg-gray-500 border-2 border-black m-2">
        <CategoriesDroite id={categorieActiveId} />
      </div>
    </div>
  );
};