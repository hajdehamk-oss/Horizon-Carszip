import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "next-themes";
import { Moon, Sun, Car, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Startseite" },
  { href: "/fahrzeuge", label: "Fahrzeuge" },
  { href: "/dashboard", label: "Profil" },
  { href: "/admin", label: "Admin" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();

  return (
    <div className="min-h-screen w-full flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0" onClick={() => setMenuOpen(false)}>
            <Car className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight uppercase">HORIZON</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location === href ? "text-primary" : "text-foreground/80"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Thema umschalten</span>
            </Button>

            {/* Hamburger — mobile only */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Menü öffnen"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t border-border/40 bg-background/98 backdrop-blur animate-in slide-in-from-top-2 duration-150">
            <nav className="container flex flex-col py-4 gap-1">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "px-3 py-3 rounded-md text-base font-medium transition-colors hover:bg-muted hover:text-primary",
                    location === href ? "text-primary bg-primary/10" : "text-foreground/80"
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="border-t border-border/40 bg-card py-10">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold tracking-tight uppercase">HORIZON</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} HORIZON. Deutschlands Premium-Marktplatz.
          </p>
        </div>
      </footer>
    </div>
  );
}
