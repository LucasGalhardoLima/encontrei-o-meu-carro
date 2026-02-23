import { Link, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { Menu, X, Car } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "~/components/ui/sheet";
import { cn } from "~/lib/utils";

const navLinks = [
  { to: "/", label: "Início" },
  { to: "/quiz", label: "Quiz" },
  { to: "/compare", label: "Comparar" },
  { to: "/garagem", label: "Garagem" },
] as const;

export function Header() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const isHome = location.pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setScrolled(false);
      return;
    }

    function onScroll() {
      setScrolled(window.scrollY > 64);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-colors duration-300",
        isHome
          ? scrolled
            ? "border-b border-white/10 bg-[oklch(0.25_0.14_252_/_0.9)] backdrop-blur-md"
            : "bg-transparent"
          : "bg-background/95 supports-backdrop-filter:bg-background/60 border-b backdrop-blur"
      )}
    >
      <div className="container mx-auto flex h-14 items-center px-4">
        <Link to="/" className="mr-6 flex items-center gap-2">
          <Car
            className={cn("size-6", isHome ? "text-white" : "text-primary")}
          />
          <span
            className={cn(
              "text-lg font-bold",
              isHome ? "text-white" : "text-foreground"
            )}
          >
            Encontre o Meu Carro
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex md:flex-1 md:items-center md:gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isHome
                  ? location.pathname === link.to
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                  : location.pathname === link.to
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <div className="flex flex-1 justify-end md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "size-11",
                  isHome && "text-white hover:bg-white/10"
                )}
                aria-label="Abrir menu"
              >
                {open ? <X className="size-5" /> : <Menu className="size-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
              <nav className="mt-6 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex min-h-[44px] items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      location.pathname === link.to
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
