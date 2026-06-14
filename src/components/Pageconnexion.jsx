import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // 1. On importe axios
import { Corps } from "./Corps";
import { Emission } from "./Emission";

function Pageconnexion() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [Password, setPassword] = useState(""); // Garde ta majuscule à Password
  const [email, setEmail] = useState("");
  const [erreur, setErreur] = useState("");

  // 2. On rend la fonction asynchrone pour attendre la réponse du serveur
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 3. Correction de la syntaxe de la condition (ajout des ||)
    if (username === "" || Password === "" || email === "") {
      setErreur("Veuillez remplir tous les champs");
      return; // On arrête la fonction ici si un champ est vide
    }

    try {
      setErreur(""); // On vide l'erreur précédente s'il y en avait une

      // 4. Envoi de la requête POST à FastAPI
      const response = await axios.post("http://127.0.0.1:8000/api/register", {
        username: username,
        email: email,
        password: Password // On envoie 'Password' (React) vers 'password' (Backend)
      });

      // 5. Si l'inscription réussit
      alert(`Compte créé avec succès ! Bienvenue ${response.data.username}`);
      navigate("/"); // Redirection vers la page d'accueil

    } catch (error) {
      // 6. Si le backend renvoie une erreur (ex: email déjà pris)
      // On récupère le message d'erreur envoyé par FastAPI
      const messageErreur = error.response?.data?.detail || "Une erreur est survenue lors de l'inscription.";
      setErreur(messageErreur);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF3EC]">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-orange-100/50 w-96 animate-in fade-in zoom-in duration-300">
        <h1 className="text-3xl font-black text-center mb-8 text-[#1A1A18] tracking-tight">
          LUKO<span className="text-[#D4480A]">JOIN</span>
        </h1>

        {erreur && (
          <div className="bg-red-50 text-[#C0392B] p-4 rounded-xl mb-6 text-sm font-bold border border-red-100">
            {erreur}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Identifiant</label>
            <input 
              type="text" 
              placeholder="choisissez un pseudo" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="w-full border border-gray-100 bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-[#D4480A]/20 focus:border-[#D4480A] transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Adresse Email</label>
            <input 
              type="email" 
              placeholder="votre@email.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full border border-gray-100 bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-[#D4480A]/20 focus:border-[#D4480A] transition-all" 
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Mot de passe</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={Password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full border border-gray-100 bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-[#D4480A]/20 focus:border-[#D4480A] transition-all" 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#D4480A] hover:bg-[#B83A08] text-white p-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-orange-200/50 transform active:scale-95 transition-all mt-4"
          >
            Créer mon compte
          </button> 
        </form>
      </div>   
    </div>
  );
}

export default Pageconnexion;
