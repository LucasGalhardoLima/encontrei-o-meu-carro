export function Footer() {
    return (
        <footer className="py-8 px-4 md:px-8 border-t border-gray-100 mt-auto">
            <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Encontre o meu carro. Dados meramente ilustrativos.
            </div>
        </footer>
    );
}
