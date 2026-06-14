
export default function Icorn() {
  return (
    <div className="flex items-center gap-3">
      {/* Icône */}
      <div className="relative flex items-center justify-center w-14 h-14">
        <div className="absolute w-14 h-14 rounded-[1.25rem] bg-gradient-to-br from-[#D4480A] via-[#F07A3A] to-[#D4480A] shadow-xl shadow-orange-200/50 transform rotate-45 group-hover:rotate-90 transition-transform duration-500"></div>

        <div className="absolute w-9 h-9 rounded-full bg-white flex items-center justify-center z-10">
          <div className="w-5 h-5 rounded-full bg-[#D4480A] animate-pulse"></div>
        </div>
      </div>

      {/* Texte */}
      <div className="flex flex-col ml-1">
        <span className="text-3xl font-black tracking-tighter leading-none text-[#1A1A18]">
          LUKO<span className="text-[#D4480A]">.</span>
        </span>
        <span className="text-[10px] font-black text-slate-400 tracking-[0.4em] uppercase leading-none mt-1 ml-1">
          Live
        </span>
      </div>
    </div>
  );
}