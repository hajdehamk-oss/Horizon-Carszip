import { useState } from "react";
import { Link } from "wouter";
import { useGetFeaturedVehicles, useGetRecentVehicles } from "@workspace/api-client-react";
import heroCarUrl from "@/assets/hero-car.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { VehicleCard } from "@/components/vehicle-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: featured, isLoading: isLoadingFeatured } = useGetFeaturedVehicles({ limit: 6 });
  const { data: recent, isLoading: isLoadingRecent } = useGetRecentVehicles({ limit: 6 });

  return (
    <div className="flex flex-col w-full">
      <section className="relative h-[80vh] w-full flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroCarUrl} 
            alt="Premium Fahrzeug" 
            className="w-full h-full object-cover brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>
        <div className="relative z-10 container flex flex-col items-center text-center gap-6">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white drop-shadow-lg">
            Deutschlands <span className="text-primary">Premium-Marktplatz</span><br/> für Fahrzeuge
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-[600px] drop-shadow">
            Finden, vergleichen und kaufen Sie Ihr nächstes Fahrzeug sicher und transparent.
          </p>
          
          <div className="mt-8 w-full max-w-4xl bg-background/80 backdrop-blur-md p-6 rounded-lg border border-border/50 shadow-2xl flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Marke" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="porsche">Porsche</SelectItem>
                  <SelectItem value="bmw">BMW</SelectItem>
                  <SelectItem value="mercedes">Mercedes-Benz</SelectItem>
                  <SelectItem value="audi">Audi</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Modell" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Beliebig</SelectItem>
                </SelectContent>
              </Select>
              <Input type="number" placeholder="Baujahr ab" className="bg-background/50" />
              <Input type="number" placeholder="Preis bis (€)" className="bg-background/50" />
            </div>
            <Link href="/fahrzeuge" className="w-full">
              <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-lg h-14">
                <Search className="mr-2 h-5 w-5" />
                Fahrzeuge suchen
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 container">
        <h2 className="text-3xl font-bold mb-12 tracking-tight">Top Inserate</h2>
        {isLoadingFeatured ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-80 w-full rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured?.map(vehicle => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
            {!featured?.length && (
              <div className="col-span-3 text-center text-muted-foreground py-12">
                Keine Top Inserate gefunden.
              </div>
            )}
          </div>
        )}
      </section>
      
      <section className="py-24 bg-card container">
        <h2 className="text-3xl font-bold mb-12 tracking-tight">Neueste Fahrzeuge</h2>
        {isLoadingRecent ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-80 w-full rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recent?.map(vehicle => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
            {!recent?.length && (
              <div className="col-span-3 text-center text-muted-foreground py-12">
                Keine neuesten Inserate gefunden.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
