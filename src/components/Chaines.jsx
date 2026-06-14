import ChainesGauche from "./ChainesGauche";
import ChainesDroite from "./ChainesDroite";

export const Chaines = () => {
    return (
        <div className="flex h-screen bg-[#F5F2EE] overflow-hidden">
            {/* Colonne de gauche - Liste des chaînes */}
            <div className="w-full md:w-80 lg:w-96 flex-shrink-0 shadow-xl z-20"> 
                <ChainesGauche />
            </div>

            {/* Colonne de droite - Détails et Emissions */}
            <div className="flex-1 overflow-hidden relative z-10">
                <ChainesDroite />
            </div>
        </div>
    );
}