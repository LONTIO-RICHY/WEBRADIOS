import ChainesGauche from "./ChainesGauche";
import ChainesDroite from "./ChainesDroite";


export const Chaines = ()=>{
    return(
        <div className="flex">
            <div className="w-1/3 h-screen border-2 border-black bg-gray-500 m-2 text-center"> 
                <div>
                    <ChainesGauche />
                </div>
            </div>
            <div className="w-2/3 h-screen bg-gray-500 border-2 border-black m-2" >
            <div> <ChainesDroite/> </div>
            </div>
        </div>
        
    );
}