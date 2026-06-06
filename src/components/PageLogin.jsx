import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Corps } from "./Corps";

function PageLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (username === "" || password === "") {
      setErreur("Veuillez remplir tous les champs");
      return;
    }

    try {
      setErreur("");

      // 1. Envoi des identifiants au backend
      const response = await axios.post("http://127.0.0.1:8000/api/login", {
        username: username,
        password: password
      });

      // 2. SAUVEGARDE DU TOKEN (Le ticket d'accès)
      // On stocke le token et le nom d'utilisateur dans le navigateur
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("username", response.data.username);

      alert(`Ravi de vous revoir, ${response.data.username} !`);
      
      // 3. Redirection vers la page Emission
      navigate("/Corps");

    } catch (error) {
      // Si le mot de passe ou le login est faux, on affiche l'erreur du backend
      const messageErreur = error.response?.data?.detail || "Impossible de se connecter.";
      setErreur(messageErreur);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-200">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
          Connexion
        </h1>

        {erreur && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {erreur}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="username (Login)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border p-3 rounded-lg"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-3 rounded-lg"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}

export default PageLogin;
