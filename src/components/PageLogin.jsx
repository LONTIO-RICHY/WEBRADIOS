import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Api";
import { useAuth } from "../context/AuthContext";

function PageLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

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

      const response = await api.post("/api/login", {
        username: username,
        password: password
      });

      login(response.data);

      alert(`Ravi de vous revoir, ${response.data.username} !`);
      
      if (response.data.is_admin) {
        navigate("/AdminDashboard");
      } else {
        navigate("/");
      }

    } catch (error) {
      const messageErreur = error.response?.data?.detail || "Impossible de se connecter.";
      setErreur(messageErreur);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF3EC]">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-orange-100/50 w-96 animate-in fade-in zoom-in duration-300">
        <h1 className="text-3xl font-black text-center mb-8 text-[#1A1A18] tracking-tight">
          LUKO<span className="text-[#D4480A]">LOGIN</span>
        </h1>

        {erreur && (
          <div className="bg-red-50 text-[#C0392B] p-4 rounded-xl mb-6 text-sm font-bold border border-red-100">
            {erreur}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Identifiant</label>
            <input
              type="text"
              placeholder="votre pseudo"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-100 bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-[#D4480A]/20 focus:border-[#D4480A] transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Mot de passe</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-100 bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-[#D4480A]/20 focus:border-[#D4480A] transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#D4480A] hover:bg-[#B83A08] text-white p-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-orange-200/50 transform active:scale-95 transition-all mt-4"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}

export default PageLogin;
