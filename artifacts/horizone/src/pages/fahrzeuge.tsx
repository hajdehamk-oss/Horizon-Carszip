import { useState } from "react";
import { useListVehicles } from "@workspace/api-client-react";
import { VehicleCard } from "@/components/vehicle-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, LayoutGrid, List as ListIcon, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Filters {
  brand: string;
  minPrice: string;
  maxPrice: string;
  minYear: string;
  maxYear: string;
  maxKm: string;
  fuelType: string;
}

const emptyFilters: Filters = {
  brand: "", minPrice: "", maxPrice: "",
  minYear: "", maxYear: "", maxKm: "", fuelType: "",
};

export default function Fahrzeuge() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("neueste");
  const [pending, setPending] = useState<Filters>(emptyFilters);
  const [applied, setApplied] = useState<Filters>(emptyFilters);

  const sortParam = sortBy === "preis_asc" ? { sortBy: "price", sortOrder: "asc" }
    : sortBy === "preis_desc" ? { sortBy: "price", sortOrder: "desc" }
    : sortBy === "km_asc" ? { sortBy: "km", sortOrder: "asc" }
    : sortBy === "baujahr_desc" ? { sortBy: "year", sortOrder: "desc" }
    : { sortBy: "createdAt", sortOrder: "desc" };

  const queryParams = {
    ...(search ? { q: search } : {}),
    ...(applied.brand ? { brand: applied.brand } : {}),
    ...(applied.minPrice ? { minPrice: parseInt(applied.minPrice) } : {}),
    ...(applied.maxPrice ? { maxPrice: parseInt(applied.maxPrice) } : {}),
    ...(applied.minYear ? { minYear: parseInt(applied.minYear) } : {}),
    ...(applied.maxYear ? { maxYear: parseInt(applied.maxYear) } : {}),
    ...(applied.maxKm ? { maxKm: parseInt(applied.maxKm) } : {}),
    ...(applied.fuelType ? { fuelType: applied.fuelType } : {}),
    ...sortParam,
  };

  const { data, isLoading } = useListVehicles(queryParams);

  const hasActiveFilters = Object.values(applied).some(Boolean) || search;

  function applyFilters() {
    setApplied({ ...pending });
  }

  function resetFilters() {
    setPending(emptyFilters);
    setApplied(emptyFilters);
    setSearch("");
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fahrzeugbörse</h1>
          <p className="text-muted-foreground mt-1">
            {isLoading ? "Lade Fahrzeuge..." : `${data?.total || 0} Fahrzeuge gefunden`}
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suchen..."
              className="pl-9 bg-background"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setSearch("")}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex border rounded-md">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-none rounded-l-md"
              onClick={() => setView("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-none rounded-r-md border-l"
              onClick={() => setView("list")}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sortieren nach" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="neueste">Neueste Inserate</SelectItem>
              <SelectItem value="preis_asc">Preis: Aufsteigend</SelectItem>
              <SelectItem value="preis_desc">Preis: Absteigend</SelectItem>
              <SelectItem value="km_asc">Kilometer: Aufsteigend</SelectItem>
              <SelectItem value="baujahr_desc">Baujahr: Neu zu Alt</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-64 shrink-0 space-y-6">
          <div className="bg-card border border-border rounded-lg p-5 sticky top-24">
            <div className="flex items-center justify-between font-bold text-lg mb-6 pb-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-primary" />
                Filter
              </div>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors font-normal flex items-center gap-1"
                >
                  <X className="h-3 w-3" /> Zurücksetzen
                </button>
              )}
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Marke</Label>
                <Select
                  value={pending.brand || "all"}
                  onValueChange={v => setPending(p => ({ ...p, brand: v === "all" ? "" : v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Beliebig" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Beliebig</SelectItem>
                    <SelectItem value="Porsche">Porsche</SelectItem>
                    <SelectItem value="BMW">BMW</SelectItem>
                    <SelectItem value="Mercedes-Benz">Mercedes-Benz</SelectItem>
                    <SelectItem value="Audi">Audi</SelectItem>
                    <SelectItem value="Lamborghini">Lamborghini</SelectItem>
                    <SelectItem value="Ferrari">Ferrari</SelectItem>
                    <SelectItem value="Bentley">Bentley</SelectItem>
                    <SelectItem value="Rolls-Royce">Rolls-Royce</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Preis (€)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Von"
                    className="h-9"
                    value={pending.minPrice}
                    onChange={e => setPending(p => ({ ...p, minPrice: e.target.value }))}
                  />
                  <Input
                    type="number"
                    placeholder="Bis"
                    className="h-9"
                    value={pending.maxPrice}
                    onChange={e => setPending(p => ({ ...p, maxPrice: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Baujahr</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Von"
                    className="h-9"
                    value={pending.minYear}
                    onChange={e => setPending(p => ({ ...p, minYear: e.target.value }))}
                  />
                  <Input
                    type="number"
                    placeholder="Bis"
                    className="h-9"
                    value={pending.maxYear}
                    onChange={e => setPending(p => ({ ...p, maxYear: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Kilometerstand</Label>
                <Select
                  value={pending.maxKm || "all"}
                  onValueChange={v => setPending(p => ({ ...p, maxKm: v === "all" ? "" : v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Beliebig" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Beliebig</SelectItem>
                    <SelectItem value="10000">Bis 10.000 km</SelectItem>
                    <SelectItem value="50000">Bis 50.000 km</SelectItem>
                    <SelectItem value="100000">Bis 100.000 km</SelectItem>
                    <SelectItem value="150000">Bis 150.000 km</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Kraftstoffart</Label>
                <Select
                  value={pending.fuelType || "all"}
                  onValueChange={v => setPending(p => ({ ...p, fuelType: v === "all" ? "" : v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Beliebig" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Beliebig</SelectItem>
                    <SelectItem value="Benzin">Benzin</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Elektro">Elektro</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="Plug-in Hybrid">Plug-in Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full mt-2 bg-primary text-primary-foreground font-bold"
                onClick={applyFilters}
              >
                Ergebnisse anzeigen
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1">
          {isLoading ? (
            <div className={`grid gap-6 ${view === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-[200px] w-full rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : data?.vehicles?.length ? (
            <div className={`grid gap-6 ${view === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
              {data.vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <SlidersHorizontal className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-xl font-semibold mb-1">Keine Fahrzeuge gefunden</p>
              <p className="text-muted-foreground text-sm mb-6">Passen Sie Ihre Filterkriterien an.</p>
              <Button variant="outline" onClick={resetFilters}>Filter zurücksetzen</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
