import { Button } from "./components/Button";
import { react } from "react";
//uvicorn main:app --reload

// import { BrowserRouter, Routes, Route } from "react-router-dom";
import {  Routes,Route,BrowserRouter} from "react-router-dom";
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
import CommentairesPage from "./components/CommentairesPage";





import { AuthProvider } from "./context/AuthContext";
import { AudioProvider } from "./context/AudioContext";
import { Toaster } from "react-hot-toast";
import AdminDashboard from "./components/AdminDashboard";
import ChannelDashboard from "./components/ChannelDashboard";
import MyLibrary from "./components/MyLibrary";
import Footer from "./components/Footer";
import PlanningPublic from "./components/PlanningPublic";

function App() {
  return (
    <AuthProvider>
      <AudioProvider>
        <Toaster position="top-right" />
        <div className="w-full min-h-screen flex flex-col bg-[#F5F2EE]">    
          <Button /> 

          <main className="flex-grow">
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
              <Route path="/CommentairesPage"  element={<CommentairesPage />}/>
              <Route path="/AdminDashboard" element={<AdminDashboard />} />
              <Route path="/ChannelDashboard/:id" element={<ChannelDashboard />} />
              <Route path="/MaBibliotheque" element={<MyLibrary />} />
              <Route path="/Planning" element={<PlanningPublic />} />
              <Route path="*" element={<Corps />} />
            </Routes>
          </main>
          
          <Footer />
          
          <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
            <div className="max-w-4xl mx-auto pointer-events-auto">
              <Player/>
            </div>
          </div>
        </div>
      </AudioProvider>
    </AuthProvider>
  );
}

export default App;
