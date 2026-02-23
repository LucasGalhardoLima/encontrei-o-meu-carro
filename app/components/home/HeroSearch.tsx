import { useState } from "react";
import { useNavigate } from "react-router";
import { Search } from "lucide-react";
import { Button } from "~/components/ui/button";

export function HeroSearch() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/results?q=${encodeURIComponent(trimmed)}&mode=browse`);
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="relative w-full max-w-xl"
    >
      <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        enterKeyHint="search"
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar marca ou modelo..."
        aria-label="Buscar carros por marca ou modelo"
        className="h-14 w-full rounded-xl border border-white/20 bg-white/95 pl-12 pr-24 text-lg text-foreground shadow-lg shadow-black/20 transition-shadow placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 md:h-16 md:text-xl"
      />
      <Button
        type="submit"
        size="sm"
        className="absolute right-2 top-1/2 h-10 -translate-y-1/2 rounded-lg px-5 text-sm font-semibold md:h-12 md:px-6 md:text-base"
      >
        Buscar
      </Button>
    </form>
  );
}
