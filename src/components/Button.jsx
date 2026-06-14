import { useState } from "react";
import { Menu, Search, LogOut, X } from "lucide-react";
import Icorn from "./Icorn";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Button = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <>
            <header className="flex justify-between items-center text-[#1A1A18] py-4 px-8 md:px-20 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-[100] transition-all">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#D4480A] rounded-xl shadow-lg shadow-orange-200/50">
                        <Icorn />
                    </div>
                    <h2 className="font-black text-xl tracking-tight text-[#1A1A18]">
                        LUKO<span className="text-[#D4480A]">LIVE</span>
                    </h2>
                </div>

                <ul className="hidden xl:flex items-center gap-8 font-medium text-sm uppercase tracking-wide">
                    <li className="text-[#1A1A18] hover:text-[#D4480A] transition-colors cursor-pointer">
                        <Link to="/">Accueil</Link>
                    </li>
                    <li className="text-[#1A1A18] hover:text-[#D4480A] transition-colors cursor-pointer">
                        <Link to="Chaines">Chaines</Link>
                    </li>
                    <li className="text-[#1A1A18] hover:text-[#D4480A] transition-colors cursor-pointer">
                        <Link to="Emission">Emission Mondiale</Link>
                    </li>
                    <li className="text-[#1A1A18] hover:text-[#D4480A] transition-colors cursor-pointer">
                        <Link to="Categorie">Catégories Mondiale</Link>
                    </li>
                    <li className="text-[#D4480A] font-black tracking-widest hover:scale-105 transition-all cursor-pointer bg-orange-50 px-4 py-1 rounded-full border border-orange-100">
                        <Link to="/Planning">Programme TV/Radio</Link>
                    </li>
                    {user?.is_admin && (
                        <li className="bg-[#FFF3EC] text-[#D4480A] px-3 py-1 rounded-full text-xs font-black border border-[#D4480A]/20 animate-pulse">
                            <Link to="/AdminDashboard">ADMIN</Link>
                        </li>
                    )}
                </ul>

                <div className="relative hidden md:flex items-center justify-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#D4480A] transition-colors" size={18} strokeWidth={2} />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className="py-2 pl-10 pr-4 rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-[#D4480A]/20 focus:bg-white w-48 focus:w-64 transition-all outline-none text-sm"
                        />
                    </div>

                    {user ? (
                        <div className="flex items-center gap-3 relative">
                            <div 
                                className="flex items-center gap-2 bg-[#FFF3EC] pl-2 pr-4 py-1.5 rounded-full border border-[#D4480A]/10 cursor-pointer hover:bg-[#FFEBE0] transition shadow-sm"
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            >
                                <div className="w-8 h-8 rounded-full bg-[#D4480A] text-white flex items-center justify-center font-bold text-sm shadow-inner">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-bold text-[#1A1A18] text-sm">{user.username}</span>
                            </div>

                            {isUserMenuOpen && (
                                <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                        <p className="text-xs text-gray-400 font-medium">Connecté en tant que</p>
                                        <p className="text-sm font-bold text-[#1A1A18] truncate">{user.email || user.username}</p>
                                    </div>
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[#C0392B] hover:bg-red-50 transition font-bold text-sm"
                                    >
                                        <LogOut size={18} strokeWidth={2} /> Se déconnecter
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            <Link to="PageLogin" className="border border-[#D4480A] text-[#D4480A] rounded-full px-6 py-2 text-sm font-medium hover:bg-[#FFF3EC] transition-all">
                                Connexion
                            </Link>
                            <Link to="Pageconnexion" className="bg-[#D4480A] hover:bg-[#B83A08] text-white rounded-full px-6 py-2.5 font-medium text-sm shadow-md shadow-orange-200/50 active:scale-95 transition-all">
                                Rejoindre
                            </Link>
                        </div>
                    )}
                </div>

                <div className="xl:hidden block cursor-pointer text-[#1A1A18]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X size={28} strokeWidth={2} /> : <Menu size={28} strokeWidth={2} />}
                </div>

                {isMenuOpen && (
                    <div className="absolute xl:hidden top-20 left-0 w-full bg-white flex flex-col items-center font-bold text-base shadow-2xl border-b border-gray-100 py-4 animate-in slide-in-from-top-4 duration-300">
                        <li className="list-none w-full text-center p-4 text-[#1A1A18] hover:bg-[#FFF3EC] hover:text-[#D4480A] transition-all cursor-pointer">
                            <Link to="/" onClick={() => setIsMenuOpen(false)}>Accueil</Link>
                        </li>
                        <li className="list-none w-full text-center p-4 text-[#1A1A18] hover:bg-[#FFF3EC] hover:text-[#D4480A] transition-all cursor-pointer">
                            <Link to="Chaines" onClick={() => setIsMenuOpen(false)}>Chaines</Link>
                        </li>
                        <li className="list-none w-full text-center p-4 text-[#1A1A18] hover:bg-[#FFF3EC] hover:text-[#D4480A] transition-all cursor-pointer">
                            <Link to="Emission" onClick={() => setIsMenuOpen(false)}>Emission</Link>
                        </li>
                        <li className="list-none w-full text-center p-4 text-[#1A1A18] hover:bg-[#FFF3EC] hover:text-[#D4480A] transition-all cursor-pointer">
                            <Link to="Categorie" onClick={() => setIsMenuOpen(false)}>Catégories</Link>
                        </li>
                        <div className="w-full px-8 pt-4 mt-4 border-t border-gray-50 space-y-3">
                            {user ? (
                                <button 
                                    className="w-full py-4 text-[#C0392B] bg-red-50 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                                    onClick={handleLogout}
                                >
                                    <LogOut size={18} strokeWidth={2} /> Se déconnecter
                                </button>
                            ) : (
                                <>
                                    <Link 
                                        to="PageLogin" 
                                        className="block w-full text-center py-4 border border-[#D4480A] text-[#D4480A] rounded-2xl font-black text-sm uppercase tracking-widest"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Connexion
                                    </Link>
                                    <Link 
                                        to="Pageconnexion" 
                                        className="block w-full text-center py-4 bg-[#D4480A] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-orange-200"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Rejoindre
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>
        </>
    );
};