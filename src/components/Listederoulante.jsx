import { List, Menu, X } from "@boxicons/react";


function Listederoulante() {
  return (
<div className="relative top-4 left-4">
  <input type="checkbox" id="toggle-list" className="peer hidden" />
  <label htmlFor="toggle-list" className="peer-checked:hidden block cursor-pointer"><span className="w-8 h-8 scale-150"><Menu/></span></label>
  <label htmlFor="toggle-list" className="hidden peer-checked:block cursor-pointer"><X/></label>
  <ul className="opacity-0 scale-95 transition-all duration-1000 ease-out peer-checked:opacity-100 peer-checked:scale-100 absolute shadow-md p-2 mt-2">
        <a href="#" className="block hover:bg-gray-500 text-black p-3 ">Commentaire</a>
        <a href="#" className="block hover:bg-gray-500 text-black  p-3 ">Podcasts</a>
        <a href="#" className="block hover:bg-gray-500 text-black p-3 ">Historisation</a>
        <a href="#" className="block hover:bg-gray-500 text-black p-3 ">Actualite</a>
        <a href="#" className="block hover:bg-gray-500 text-black p-3 ">Liste music</a>
  </ul>
</div>
  );
 
};

export default Listederoulante;