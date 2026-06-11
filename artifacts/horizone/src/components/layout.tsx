import { Link } from "wouter";
import { useTheme } from "next-themes";
import { Moon, Sun, Car } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen w-full flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Car className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight uppercase">HORIZONE</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Startseite</Link>
            <Link href="/fahrzeuge" className="text-sm font-medium hover:text-primary transition-colors">Fahrzeuge</Link>
            <Link href="/haendler" className="text-sm font-medium hover:text-primary transition-colors">Händler</Link>
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Profil</Link>
            <Link href="/admin" className="text-sm font-medium hover:text-primary transition-colors">Admin</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Thema umschalten</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <footer className="border-t border-border/40 bg-card py-12">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Car className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight uppercase">HORIZONE</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} HORIZONE. Deutschlands Premium-Marktplatz.
          </p>
        </div>
      </footer>
    </div>
  );
}
