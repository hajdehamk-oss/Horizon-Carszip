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
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, Filter, SlidersHorizontal, LayoutGrid, List as ListIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Fahrzeuge() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const { data, isLoading } = useListVehicles();
  
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
            <Input placeholder="Suchen..." className="pl-9 bg-background" />
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
          
          <Select defaultValue="neueste">
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
            <div className="flex items-center gap-2 font-bold text-lg mb-6 pb-4 border-b border-border/50">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              Filter
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Marke</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Beliebig" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="porsche">Porsche</SelectItem>
                    <SelectItem value="bmw">BMW</SelectItem>
                    <SelectItem value="mercedes">Mercedes-Benz</SelectItem>
                    <SelectItem value="audi">Audi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label>Modell</Label>
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Zuerst Marke wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Beliebig</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Preis (€)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" placeholder="Von" className="h-9" />
                  <Input type="number" placeholder="Bis" className="h-9" />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Baujahr</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" placeholder="Von" className="h-9" />
                  <Input type="number" placeholder="Bis" className="h-9" />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label>Kilometerstand</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Beliebig" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10000">Bis 10.000 km</SelectItem>
                    <SelectItem value="50000">Bis 50.000 km</SelectItem>
                    <SelectItem value="100000">Bis 100.000 km</SelectItem>
                    <SelectItem value="150000">Bis 150.000 km</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Kraftstoffart</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Beliebig" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="benzin">Benzin</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="elektro">Elektro</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full mt-4 bg-primary text-primary-foreground font-bold">
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
          ) : (
            <div className={`grid gap-6 ${view === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
              {data?.vehicles?.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
