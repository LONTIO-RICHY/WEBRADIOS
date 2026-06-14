
import EmissionsGauche from "./EmissionsGauche";
import EmissionsDroite from "./EmissionsDroite";


export const Emission = ()=>{
    return(
        <div className="flex h-screen bg-[#F5F2EE] overflow-hidden">
            <div className="w-full md:w-80 lg:w-96 flex-shrink-0 shadow-xl z-20">
                 <EmissionsGauche />
            </div>   
            <div className="flex-1 overflow-hidden relative z-10">
                    <EmissionsDroite />
            </div>
        </div>
    );
}