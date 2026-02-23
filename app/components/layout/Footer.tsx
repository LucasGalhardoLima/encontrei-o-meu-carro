import { Link, useLocation } from "react-router";
import { cn } from "~/lib/utils";

export function Footer() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <footer className={cn(isHome ? "bg-transparent" : "border-t", "py-6")}>
      <div
        className={cn(
          "container mx-auto flex flex-col items-center gap-2 px-4 text-center text-sm",
          isHome ? "text-white/60" : "text-muted-foreground"
        )}
      >
        <p>
          &copy; {new Date().getFullYear()} Encontre o Meu Carro. Todos os
          direitos reservados.
        </p>
        <nav className="flex gap-4">
          <Link
            to="/"
            className={cn(
              "transition-colors",
              isHome
                ? "hover:text-white/90"
                : "hover:text-foreground"
            )}
          >
            Início
          </Link>
          <Link
            to="/quiz"
            className={cn(
              "transition-colors",
              isHome
                ? "hover:text-white/90"
                : "hover:text-foreground"
            )}
          >
            Quiz
          </Link>
        </nav>
      </div>
    </footer>
  );
}
