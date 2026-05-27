import { Button } from "./components/Button";
import { react } from "react";

// import { BrowserRouter, Routes, Route } from "react-router-dom";
import {  Routes,Route } from "react-router-dom";
import { Search, SparklesAlt } from "@boxicons/react";
import { Chaines } from "./components/Chaines";
import { Corps } from "./components/Corps";
import { Emission } from "./components/Emission";
import ChainesGauche from "./components/ChainesGauche";
import ChainesDroite from "./components/ChainesDroite";
import { Categorie } from "./components/Categorie";





function App() {
  return (
    <div className="w-full h-screen absolute bg-gradient-to-r from-red-200">    
          
        <Button />
      {/* <Liens /> */}
       <Routes>
           <Route path="/" element={<Corps />} />  
           <Route path="Chaines" element={<Chaines/>}/> 
           <Route path="Emission" element={<Emission />} />
           <Route path="chaines/*" element={<Chaines/>} />
            <Route path="*"          element={<ChainesGauche />} />
            <Route path="chaines/:id" element={<Chaines />} />
            <Route path="*"            element={<ChainesDroite />} />
            <Route path="/emissions/:id" element={<Emission />} />
            <Route path="Categorie"  element={<Categorie/>} />
            
      </Routes> 
      
    </div>

   
  
  );
}

export default App;
