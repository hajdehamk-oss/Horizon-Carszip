import { useState } from "react";
import { useSearch } from "wouter";
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
import { Search, SlidersHorizontal, LayoutGrid, List as ListIcon, X, ChevronDown, ChevronUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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
  const searchString = useSearch();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState(() => {
    const p = new URLSearchParams(searchString);
    return p.get("q") || "";
  });
  const [sortBy, setSortBy] = useState("neueste");
  const [pending, setPending] = useState<Filters>(() => {
    const p = new URLSearchParams(searchString);
    return {
      brand: p.get("brand") || "",
      minPrice: p.get("minPrice") || "",
      maxPrice: p.get("maxPrice") || "",
      minYear: p.get("minYear") || "",
      maxYear: p.get("maxYear") || "",
      maxKm: p.get("maxKm") || "",
      fuelType: p.get("fuelType") || "",
    };
  });
  const [applied, setApplied] = useState<Filters>(() => {
    const p = new URLSearchParams(searchString);
    return {
      brand: p.get("brand") || "",
      minPrice: p.get("minPrice") || "",
      maxPrice: p.get("maxPrice") || "",
      minYear: p.get("minYear") || "",
      maxYear: p.get("maxYear") || "",
      maxKm: p.get("maxKm") || "",
      fuelType: p.get("fuelType") || "",
    };
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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

  const hasActiveFilters = Object.values(applied).some(Boolean) || !!search;
  const activeFilterCount = Object.values(applied).filter(Boolean).length;

  function applyFilters() {
    setApplied({ ...pending });
    setMobileFiltersOpen(false);
  }

  function resetFilters() {
    setPending(emptyFilters);
    setApplied(emptyFilters);
    setSearch("");
  }

  const FilterPanel = () => (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Marke</Label>
        <Select
          value={pending.brand || "all"}
          onValueChange={v => setPending(p => ({ ...p, brand: v === "all" ? "" : v }))}
        >
          <SelectTrigger className="h-10">
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
            <SelectItem value="Tesla">Tesla</SelectItem>
            <SelectItem value="Land Rover">Land Rover</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Preis (€)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input type="number" placeholder="Von" className="h-10"
            value={pending.minPrice}
            onChange={e => setPending(p => ({ ...p, minPrice: e.target.value }))} />
          <Input type="number" placeholder="Bis" className="h-10"
            value={pending.maxPrice}
            onChange={e => setPending(p => ({ ...p, maxPrice: e.target.value }))} />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Baujahr</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input type="number" placeholder="Von" className="h-10"
            value={pending.minYear}
            onChange={e => setPending(p => ({ ...p, minYear: e.target.value }))} />
          <Input type="number" placeholder="Bis" className="h-10"
            value={pending.maxYear}
            onChange={e => setPending(p => ({ ...p, maxYear: e.target.value }))} />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Kilometerstand</Label>
        <Select
          value={pending.maxKm || "all"}
          onValueChange={v => setPending(p => ({ ...p, maxKm: v === "all" ? "" : v }))}
        >
          <SelectTrigger className="h-10">
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

      <div className="space-y-2">
        <Label className="text-sm font-semibold">Kraftstoffart</Label>
        <Select
          value={pending.fuelType || "all"}
          onValueChange={v => setPending(p => ({ ...p, fuelType: v === "all" ? "" : v }))}
        >
          <SelectTrigger className="h-10">
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

      <Button className="w-full h-11 bg-primary text-primary-foreground font-bold" onClick={applyFilters}>
        Ergebnisse anzeigen
      </Button>

      {hasActiveFilters && (
        <Button variant="ghost" className="w-full h-9 text-muted-foreground text-sm gap-1" onClick={resetFilters}>
          <X className="h-3.5 w-3.5" /> Alle Filter zurücksetzen
        </Button>
      )}
    </div>
  );

  return (
    <div className="container py-6 md:py-8">
      {/* Header row */}
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Fahrzeugbörse</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {isLoading ? "Lade Fahrzeuge…" : `${data?.total || 0} Fahrzeuge gefunden`}
          </p>
        </div>

        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Suchen…" className="pl-9 h-10 bg-background"
              value={search} onChange={e => setSearch(e.target.value)} />
            {search && (
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setSearch("")}>
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Mobile filter toggle */}
          <Button
            variant="outline"
            className="lg:hidden h-10 gap-2 shrink-0"
            onClick={() => setMobileFiltersOpen(v => !v)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
            {activeFilterCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 ml-0.5">
                {activeFilterCount}
              </span>
            )}
            {mobileFiltersOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px] md:w-[180px] h-10 shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="neueste">Neueste</SelectItem>
              <SelectItem value="preis_asc">Preis ↑</SelectItem>
              <SelectItem value="preis_desc">Preis ↓</SelectItem>
              <SelectItem value="km_asc">Kilometer ↑</SelectItem>
              <SelectItem value="baujahr_desc">Baujahr ↓</SelectItem>
            </SelectContent>
          </Select>

          {/* View toggle */}
          <div className="flex border rounded-md h-10 shrink-0">
            <Button variant={view === "grid" ? "secondary" : "ghost"} size="icon"
              className="rounded-none rounded-l-md h-full w-10" onClick={() => setView("grid")}>
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant={view === "list" ? "secondary" : "ghost"} size="icon"
              className="rounded-none rounded-r-md border-l h-full w-10" onClick={() => setView("list")}>
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile filter panel — collapsible */}
        {mobileFiltersOpen && (
          <div className="lg:hidden bg-card border border-border rounded-xl p-5 animate-in slide-in-from-top-2 duration-150">
            <FilterPanel />
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-64 shrink-0">
          <div className="bg-card border border-border rounded-xl p-5 sticky top-24">
            <div className={cn(
              "flex items-center gap-2 font-bold text-base mb-5 pb-4 border-b border-border/50",
              hasActiveFilters ? "justify-between" : ""
            )}>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                Filter
                {activeFilterCount > 0 && (
                  <span className="text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">
                    {activeFilterCount}
                  </span>
                )}
              </div>
            </div>
            <FilterPanel />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className={cn("grid gap-5", view === "grid"
              ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
              : "grid-cols-1")}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="flex flex-col space-y-3">
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : data?.vehicles?.length ? (
            <div className={cn("grid gap-5", view === "grid"
              ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
              : "grid-cols-1")}>
              {data.vehicles.map(vehicle => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
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
