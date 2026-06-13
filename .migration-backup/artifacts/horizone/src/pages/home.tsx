import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetFeaturedVehicles, useGetRecentVehicles } from "@workspace/api-client-react";
import heroCarUrl from "@/assets/hero-car.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ShieldCheck, Zap, Star, ArrowRight } from "lucide-react";
import { VehicleCard } from "@/components/vehicle-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [, navigate] = useLocation();
  const { data: featured, isLoading: isLoadingFeatured } = useGetFeaturedVehicles({ limit: 6 });
  const { data: recent, isLoading: isLoadingRecent } = useGetRecentVehicles({ limit: 6 });

  const [brand, setBrand] = useState("");
  const [minYear, setMinYear] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  function handleSearch() {
    const params = new URLSearchParams();
    if (brand) params.set("brand", brand);
    if (minYear) params.set("minYear", minYear);
    if (maxPrice) params.set("maxPrice", maxPrice);
    const qs = params.toString();
    navigate("/fahrzeuge" + (qs ? "?" + qs : ""));
  }

  return (
    <div className="flex flex-col w-full">
      {/* Hero */}
      <section className="relative min-h-[85vh] w-full flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img
            src={heroCarUrl}
            alt="Premium Fahrzeug"
            className="w-full h-full object-cover brightness-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        </div>

        <div className="relative z-10 container flex flex-col items-center text-center gap-5 px-4 py-16 md:py-24">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1.5 text-sm font-medium mb-2">
            <Star className="h-3.5 w-3.5" /> Der Schweizer Premium Automarkt
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter text-white drop-shadow-lg max-w-4xl">
            Ihr nächstes<br />
            <span className="text-primary">Traumfahrzeug</span>
          </h1>
          <p className="text-base md:text-xl text-gray-300 max-w-lg drop-shadow">
            Finden, vergleichen und kaufen Sie Ihr nächstes Fahrzeug sicher und transparent.
          </p>

          {/* Search box */}
          <div className="mt-4 w-full max-w-3xl bg-background/85 backdrop-blur-md p-4 md:p-6 rounded-xl border border-border/50 shadow-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Marke wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Porsche">Porsche</SelectItem>
                  <SelectItem value="BMW">BMW</SelectItem>
                  <SelectItem value="Mercedes-Benz">Mercedes-Benz</SelectItem>
                  <SelectItem value="Audi">Audi</SelectItem>
                  <SelectItem value="Ferrari">Ferrari</SelectItem>
                  <SelectItem value="Lamborghini">Lamborghini</SelectItem>
                  <SelectItem value="Tesla">Tesla</SelectItem>
                  <SelectItem value="Bentley">Bentley</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Baujahr ab"
                className="bg-background/70 h-11"
                value={minYear}
                onChange={e => setMinYear(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Preis bis (€)"
                className="bg-background/70 h-11"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
              />
            </div>
            <Button
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-base h-12"
              onClick={handleSearch}
            >
              <Search className="mr-2 h-5 w-5" />
              Fahrzeuge suchen
            </Button>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-y border-border/30 bg-card/50">
        <div className="container py-6 md:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <p className="font-bold text-sm">Geprüfte Händler</p>
              <p className="text-xs text-muted-foreground">Alle Partner sind verifiziert</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Zap className="h-8 w-8 text-primary" />
              <p className="font-bold text-sm">Schnelle Abwicklung</p>
              <p className="text-xs text-muted-foreground">Direktkontakt zum Verkäufer</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Star className="h-8 w-8 text-primary" />
              <p className="font-bold text-sm">Premium Auswahl</p>
              <p className="text-xs text-muted-foreground">Exklusive Fahrzeuge aller Klassen</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-12 md:py-20 container px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Top Inserate</h2>
          <Link href="/fahrzeuge">
            <Button variant="ghost" className="text-primary gap-1 hidden sm:flex">
              Alle anzeigen <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        {isLoadingFeatured ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-80 w-full rounded-xl" />)}
          </div>
        ) : featured && featured.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map(vehicle => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link href="/fahrzeuge">
                <Button variant="outline" className="gap-2">Alle anzeigen <ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-12">Keine Top Inserate gefunden.</div>
        )}
      </section>

      {/* Recent */}
      <section className="py-12 md:py-20 bg-card/40 border-t border-border/30">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Neueste Inserate</h2>
            <Link href="/fahrzeuge">
              <Button variant="ghost" className="text-primary gap-1 hidden sm:flex">
                Alle anzeigen <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          {isLoadingRecent ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-80 w-full rounded-xl" />)}
            </div>
          ) : recent && recent.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {recent.map(vehicle => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
              <div className="mt-8 text-center sm:hidden">
                <Link href="/fahrzeuge">
                  <Button variant="outline" className="gap-2">Alle anzeigen <ArrowRight className="h-4 w-4" /></Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center text-muted-foreground py-12">Keine neuesten Inserate gefunden.</div>
          )}
        </div>
      </section>
    </div>
  );
}
