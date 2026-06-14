import { Phone, Mail, MapPin, Radio, Heart } from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-[#1A1A18] text-white pt-16 pb-8 px-6 mt-auto">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-slate-800 pb-12">
                {/* Branding & Mission */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-[#D4480A] rounded-xl flex items-center justify-center shadow-lg shadow-orange-900/20 group-hover:rotate-12 transition-transform">
                            <Radio className="text-white" size={24} />
                        </div>
                        <span className="text-2xl font-black tracking-tighter uppercase italic">Mon Projet Radio</span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-xs italic">
                        La plateforme de streaming audio qui connecte les voix du Cameroun au reste du monde.
                    </p>
                </div>

                {/* Contact Information */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black text-[#D4480A] uppercase tracking-widest">Coordonnées</h3>
                    <ul className="space-y-4">
                        <li className="flex items-center gap-3 group">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-[#D4480A] transition-colors">
                                <Phone size={16} className="text-slate-400 group-hover:text-white" />
                            </div>
                            <span className="text-sm font-medium text-slate-300">650196250</span>
                        </li>
                        <li className="flex items-center gap-3 group">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-[#D4480A] transition-colors">
                                <Mail size={16} className="text-slate-400 group-hover:text-white" />
                            </div>
                            <span className="text-sm font-medium text-slate-300">lontiokessel@gmail.com</span>
                        </li>
                        <li className="flex items-center gap-3 group">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-[#D4480A] transition-colors">
                                <MapPin size={16} className="text-slate-400 group-hover:text-white" />
                            </div>
                            <span className="text-sm font-medium text-slate-300">OUEST CAMEROUN</span>
                        </li>
                    </ul>
                </div>

                {/* Developer Credit */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black text-[#D4480A] uppercase tracking-widest">Développeur</h3>
                    <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                        <p className="text-lg font-black tracking-tight text-white mb-1 uppercase">LONTIO KESSEL</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            Fait avec <Heart size={10} className="text-[#D4480A] fill-[#D4480A]" /> au Cameroun
                        </p>
                    </div>
                </div>
            </div>

            {/* Copyright Section */}
            <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">
                    © {new Date().getFullYear()} Mon Projet Radio. Tous droits réservés.
                </p>
                <div className="flex gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <a href="#" className="hover:text-white transition-colors underline decoration-[#D4480A] underline-offset-4">Confidentialité</a>
                    <a href="#" className="hover:text-white transition-colors underline decoration-[#D4480A] underline-offset-4">Conditions</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;