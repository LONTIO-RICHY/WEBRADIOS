import { Link } from "react-router-dom";


export const Liens = ()=>{
    return(
        <nav className="text-center">
            <Link to="/"  className="px-10 mx-10 ">Acceuil</Link>
            <Link to="Test1" className="px-10 mx-10 ">Service</Link>
        </nav>
    );
}