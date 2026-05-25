 import { Search, SparklesAlt } from "@boxicons/react";

 export const Corps =  ()=>{
    return(
        <p>
      <div className="h-screen flex flex-col justify-center items-center">
        <h2 className="bg-pink-500 flex p-1 rounded-lg m-3"><span className="  mr-2"><SparklesAlt /></span> plus de 200 chaines disponibles </h2>
        <h1 className="  text-4xl font-semibold m-3 ">Ecouter vos emissions favorites en direct</h1>
        <p className="text-2xl text-gray-700 m-5 w-1/2">Decouvrez des centaines des webradios thématiques et ne manquez plus jamais vos programes préférés </p>
      <div className="relative hidden md:flex items-center justify-center gap-3">
                <i className=" absolute left-3 text-2xl text-gray-500 "> <Search /> </i>
               
                <input type="text" placeholder="Recherche une emission une chaine ou un animateur" className="m-2 mr-6 py-2 pl-8 w-96 rounded-xl border-2 border-blue-300 focus:bg-slate-100 focus:outline-sky-500"/>
      </div>          
      </div>
      </p>
    );
 }