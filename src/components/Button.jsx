import { useState } from "react";
import { List, Search, UserPlus } from "@boxicons/react";
import Icorn from "./Icorn"; //ici on a un fichier qui prwesente le logo de notre plate forme
import { Link } from "react-router-dom";
// import { Chaines } from "./Chaines";
 import api from "../Api";


// import {logo} from "./assets/logo.png";
export const Button = ()=>{
const tester = async () => {
  const res = await api.get("/");
  console.log(res.data); // { message: "OK" }
};

        const [isMenuOpen, setIsMenuOpen] = useState(false)
    return (   
        <>
           <header className="flex justify-between items-center text-black py-6 px-8 md:px-32 bg-orange-100 drop-shadow-md">
                <div className="flex">
                         <h2 className="flex font-extrabold text-2xl"><span className="absolute top-6 left-0 animate-bounce"><Icorn /></span> </h2>
                </div>
                
              
                <ul className="hidden xl:flex items-center gap-10 font-semibold text-base">
                   <li className="p-0 hover:bg-sky-400 hover:text-white rounded-md transition-all cursor-pointer"><Link to="/"> Accueil</Link></li>    
                   <li className="p-0 hover:bg-sky-400 hover:text-white rounded-md transition-all cursor-pointer"><Link to="Chaines"> Chaines</Link></li>
                   <li className="p-0 hover:bg-sky-400 hover:text-white rounded-md transition-all cursor-pointer"><Link to="Emission">Emission</Link></li>
                   <li className="p-0 hover:bg-sky-400 hover:text-white rounded-md transition-all cursor-pointer"><Link to="Categorie">Catégories</Link></li>      
                </ul>

                <div className="relative hidden md:flex items-center justify-center gap-3">
                <i className=" absolute left-3 text-2xl text-gray-500 "> <Search /> </i>
               
                <input type="text" placeholder="search..." className="mr-6 py-2 pl-8 rounded-xl border-2 border-blue-300 focus:bg-slate-100 focus:outline-sky-500"/>
                <div className="flex gap-10">
                <span className="mr-0"><UserPlus /> </span>       
                 <button className="bg-red-600 rounded-xl border-2 mr-4 p-1"><Link to="PageLogin">connexion</Link></button>     
                 <button className="fixed right-0  bg-red-600 rounded-xl border-2 p-1 mr-2"><Link to="Pageconnexion">creer un compte</Link></button>  
                 </div>
                
                </div>
                <i className="bx bx-menu xl:hidden block text-2xl cursor-pointer" onClick={()=> setIsMenuOpen(!isMenuOpen)}> <List/></i>

                { isMenuOpen && ( 
                        <div className={'absolute xl:hidden top-24 left-0  w-full bg-white flex flex-col items-center grap-6 font-semibold text-lg transform transition-transform ${isMenuOpen ? "opacity-100" : "opacity-0"}'} style={{transition: "transform 0.3s ease, opacity 0,3s ease"}}>

                        <li className="list-none w-full text-center p-4 hover:bg-sky-400 hover:text-white transition-all cursor-pointer"><Link to="/">Accueil</Link> </li>
                        <li className="list-none w-full text-center p-4 hover:bg-sky-400 hover:text-white transition-all cursor-pointer"><Link to="Chaines">Chaines</Link></li>
                        <li className="list-none w-full text-center p-4 hover:bg-sky-400 hover:text-white transition-all cursor-pointer"><Link to="Emission">Emission</Link></li>
                        <li className="list-none w-full text-center p-4 hover:bg-sky-400 hover:text-white transition-all cursor-pointer"><Link to="Categorie">Catégories</Link></li> 
                </div>
                )}
                
           </header> 
           </>
        );
}