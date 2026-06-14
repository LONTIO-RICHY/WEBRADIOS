import { useAudio } from "../context/AudioContext";
import { Radio, Headphones, Play, Pause } from "lucide-react";

function Player() {
  const { isPlaying, statusMessage, togglePlay, currentChannel, currentTrack, currentEmission } = useAudio();

  const title = currentEmission 
    ? currentEmission.title 
    : (currentChannel ? currentChannel.name : (currentTrack ? currentTrack.title : statusMessage));
    
  const subtitle = currentEmission
    ? currentEmission.channel_name || "Émission"
    : (currentChannel ? "Flux en direct" : (currentTrack ? "Bibliothèque" : "Prêt pour l'écoute"));

  return (
    <div className="flex items-center gap-6 p-4 bg-white/90 backdrop-blur-xl border border-orange-100 rounded-2xl shadow-2xl shadow-orange-200/50 w-full animate-in slide-in-from-bottom-4 duration-500 pointer-events-auto">
      <div className="flex-1 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg transition-all duration-500 ${
          isPlaying ? "bg-[#F07A3A] animate-pulse scale-105 shadow-orange-200" : "bg-[#D4480A] shadow-orange-200/50"
        }`}>
          {isPlaying ? <Radio size={24} strokeWidth={2} /> : <Headphones size={24} strokeWidth={2} />}
        </div>
        <div className="text-left overflow-hidden">
          <h2 className="text-sm font-black text-[#1A1A18] leading-tight uppercase tracking-wider truncate">{title}</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5 truncate">
            {isPlaying ? (currentChannel ? "● EN DIRECT" : (currentEmission ? `● ${subtitle}` : "Lecture en cours")) : subtitle}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4 border-l border-gray-100 pl-6">
        <button
          onClick={async () => {
            console.log("Player : Bouton cliqué");
            await togglePlay();
          }}
          className={`group relative w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white transition-all active:scale-90 ${
            isPlaying 
              ? "bg-[#F07A3A] hover:bg-[#D4480A]" 
              : "bg-[#D4480A] hover:bg-[#B83A08] shadow-lg shadow-orange-200/50"
          }`}
        >
          <span className="relative z-10 transition-transform group-hover:scale-110">
            {isPlaying ? <Pause size={24} strokeWidth={2.5} fill="currentColor" /> : <Play size={24} strokeWidth={2.5} fill="currentColor" />}
          </span>
          {isPlaying && (
            <span className="absolute inset-0 rounded-full bg-[#F07A3A] animate-ping opacity-25"></span>
          )}
        </button>
        
        <div className="hidden sm:block text-right min-w-[120px]">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
            {isPlaying ? "Cliquez pour arrêter" : "Lancer le direct"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Player;
