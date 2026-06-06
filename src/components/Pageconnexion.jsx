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
      navigate("/Corps"); // Redirection vers la page Emission (ajoute un "/" si nécessaire dans tes routes)

    } catch (error) {
      // 6. Si le backend renvoie une erreur (ex: email déjà pris)
      // On récupère le message d'erreur envoyé par FastAPI
      const messageErreur = error.response?.data?.detail || "Une erreur est survenue lors de l'inscription.";
      setErreur(messageErreur);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-200">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600 "> Creation du compte</h1>

        {/* Ton bloc d'erreur affichera maintenant les vraies erreurs du backend ! */}
        {erreur && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {erreur}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            placeholder="username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            className="w-full border p-3 rounded-lg"
          />

          <input 
            type="password" 
            placeholder="Password" 
            value={Password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full border p-3 rounded-lg" 
          />

          <input 
            type="email" 
            placeholder="Adresse email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full border p-3 rounded-lg" 
          />

          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg">
            Créer le compte
          </button> 
        </form>
      </div>   
    </div>
  );
}

export default Pageconnexion;
