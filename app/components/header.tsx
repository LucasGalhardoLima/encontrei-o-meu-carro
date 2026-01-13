import { Link } from "react-router";

export function Header() {
    return (
        <header className="py-6 px-4 md:px-8 border-b border-gray-100">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link to="/" className="text-xl font-bold tracking-tight text-gray-900">
                    Encontre o meu carro
                </Link>
                <nav>
                    <ul className="flex gap-4">
                        <li>
                            <Link to="/" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                                Buscar
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}
