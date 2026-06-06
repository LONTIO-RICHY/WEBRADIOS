import { Button } from "./components/Button";
import { react } from "react";

// import { BrowserRouter, Routes, Route } from "react-router-dom";
import {  Routes,Route,BrowserRouter} from "react-router-dom";
import { Search, SparklesAlt } from "@boxicons/react";
import { Chaines } from "./components/Chaines";
import { Corps } from "./components/Corps";
import { Emission } from "./components/Emission";
import ChainesGauche from "./components/ChainesGauche";
import ChainesDroite from "./components/ChainesDroite";
import { Categorie } from "./components/Categorie";
import Pageconnexion from "./components/Pageconnexion";
import CategoriesDroite from "./components/CategoriesDroite";
import CategoriesGauche from "./components/CategoriesGauche";
import Api from "./Api";
import PageLogin from "./components/PageLogin";
import Studio from "./components/Studio";
import Player from "./components/Player";






function App() {
  <Api />
  return (
    <div className="w-full h-screen   from-red-300">    
         
        <Button /> 

      {/* <Liens /> */}
    
       <Routes>
      
        <Route path="/" element={<Corps />} />
        <Route path="/Pageconnexion" element={<Pageconnexion />} />
        <Route path="/PageLogin" element={<PageLogin />} />
        <Route path="/Chaines" element={<Chaines />} />
        <Route path="/chaines/:id" element={<Chaines />} />
        <Route path="/Emission" element={<Emission />} />
        <Route path="/emissions/:id" element={<Emission />} />
        <Route path="/Categorie" element={<Categorie />} />
        <Route path="/categorie/:id" element={<Categorie />} />
        <Route path="/Studio"  element={<Studio />}/>
        <Route path="/Player"  element={<Player />}/>

      
        <Route path="*" element={<Corps />} />
      </Routes>
    <div className="fixed bottom-0 left-0 right-0 w-full z-50  bg-red-400 h-24">
      <Player/>
    </div>
       
    </div>

  
  
  );
}

export default App;
