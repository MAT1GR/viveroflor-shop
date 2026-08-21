import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, User, X, Leaf } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/", label: "Inicio" },
  { to: "/tienda", label: "Tienda" },
  { to: "/plantas", label: "Plantas" },
  { to: "/macetas", label: "Macetas" },
  { to: "/accesorios", label: "Accesorios" },
  { to: "/nosotros", label: "Nosotros" },
] as const;

export function Header() {
  const { count, openCart } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [bump, setBump] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (count === 0) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 350);
    return () => clearTimeout(t);
  }, [count]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchOpen(false);
    setMenuOpen(false);
    navigate({ to: "/tienda", search: { q: query || undefined } });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2" aria-label="ViveroFlor - inicio">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Leaf className="size-5" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">ViveroFlor</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground data-[status=active]:bg-secondary data-[status=active]:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Buscar productos"
            onClick={() => setSearchOpen((v) => !v)}
          >
            {searchOpen ? <X className="size-5" /> : <Search className="size-5" />}
          </Button>
          <Button variant="ghost" size="icon" aria-label="Mi cuenta" asChild className="hidden sm:inline-flex">
            <Link to="/contacto">
              <User className="size-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Abrir carrito" onClick={openCart} className="relative">
            <ShoppingBag className="size-5" />
            {count > 0 && (
              <span
                className={cn(
                  "absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground",
                  bump && "animate-pop",
                )}
              >
                {count}
              </span>
            )}
          </Button>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menú" className="lg:hidden">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86vw] max-w-sm p-6">
              <p className="font-display text-lg font-semibold">Menú</p>
              <nav className="mt-6 flex flex-col gap-1">
                {navLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-3 text-base font-medium transition-colors hover:bg-secondary data-[status=active]:text-primary"
                  >
                    {l.label}
                  </Link>
                ))}
                <div className="my-3 h-px bg-border" />
                <Link
                  to="/preguntas-frecuentes"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-3 text-base text-muted-foreground hover:bg-secondary"
                >
                  Preguntas frecuentes
                </Link>
                <Link
                  to="/contacto"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-3 text-base text-muted-foreground hover:bg-secondary"
                >
                  Contacto
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-border/70 bg-background">
          <form onSubmit={submitSearch} className="container-page flex gap-2 py-3">
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar plantas, macetas, accesorios…"
              className="h-11"
            />
            <Button type="submit" className="h-11">
              Buscar
            </Button>
          </form>
        </div>
      )}
    </header>
  );
}
