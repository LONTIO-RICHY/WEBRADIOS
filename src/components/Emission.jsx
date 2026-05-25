
import EmissionsGauche from "./EmissionsGauche";
import EmissionsDroite from "./EmissionsDroite";


export const Emission = ()=>{
    return(
        <div className=" flex">
            <div className="w-1/3 h-screen border-2 border-black bg-gray-500 m-2 text-center">
                 <h1 className="text-center">BIENVENUE SUR NOS EMISSION</h1>
                 <EmissionsGauche />
            </div>   
            <div className="w-2/3 h-screen bg-gray-500 border-2 border-black m-2">
                    <EmissionsDroite />
            </div>
        
        </div>
    );
}