
export default function Icorn() {
  return (
    <div className="flex items-center gap-3">
      {/* Icône */}
      <div className="relative flex items-center justify-center w-14 h-14">
        <div className="absolute w-14 h-14 rounded-full bg-gradient-to-br from-red-700 via-red-500 to-pink-500 shadow-lg"></div>

        <div className="absolute w-9 h-9 rounded-full bg-white flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-700 via-red-500 to-pink-500"></div>
        </div>
      </div>

      {/* Texte */}
      <div className="flex flex-col">
        <span className="text-3xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-red-700 via-red-500 to-pink-500 bg-clip-text text-transparent">
            RADIO
          </span>
        </span>

        <span className="text-xl font-bold text-gray-900 tracking-widest">
          RICKESS
        </span>
      </div>
    </div>
  );
}