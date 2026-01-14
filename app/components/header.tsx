import { Link } from "react-router";
import { Heart } from "lucide-react";

export function Header() {
    return (
        <header className="py-6 px-4 md:px-8 border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-40">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link to="/" className="text-xl font-bold tracking-tight text-gray-900">
                    Encontre o meu carro
                </Link>
                <nav>
                    <ul className="flex gap-6 items-center">
                        <li>
                            <Link to="/" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                                Buscar
                            </Link>
                        </li>
                        <li>
                            <Link to="/garagem" className="text-sm font-medium text-gray-500 hover:text-red-500 flex items-center gap-2 group">
                                <Heart className="w-4 h-4 group-hover:fill-current transition-colors" />
                                <span className="hidden md:inline">Minha Garagem</span>
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}
