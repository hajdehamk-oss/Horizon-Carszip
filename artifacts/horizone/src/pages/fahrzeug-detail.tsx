import { useParams } from "wouter";
import { useGetVehicle, useGetSimilarVehicles, getGetVehicleQueryKey, getGetSimilarVehiclesQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Gauge, Fuel, Car, MapPin, Share2, Heart, ShieldCheck, Check } from "lucide-react";
import { VehicleCard } from "@/components/vehicle-card";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { useFavorites } from "@/hooks/use-favorites";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function FahrzeugDetail() {
  const params = useParams();
  const vehicleId = parseInt(params.id || "0", 10);
  const { toast } = useToast();

  const { data: vehicle, isLoading } = useGetVehicle(vehicleId, {
    query: {
      enabled: !!vehicleId,
      queryKey: getGetVehicleQueryKey(vehicleId)
    }
  });
  
  const { data: similarVehicles } = useGetSimilarVehicles(vehicleId, {
    query: {
      enabled: !!vehicleId,
      queryKey: getGetSimilarVehiclesQueryKey(vehicleId)
    }
  });

  const { isFavorited, toggleFavorite } = useFavorites();
  const [anzahlung, setAnzahlung] = useState(5000);
  const [laufzeit, setLaufzeit] = useState(48);
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;
    const title = vehicle?.title ?? "Fahrzeug";
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        /* user cancelled — ignore */
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ description: "Link in die Zwischenablage kopiert!" });
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8 space-y-8">
        <Skeleton className="w-full h-[50vh] rounded-lg" />
        <Skeleton className="w-2/3 h-12" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="col-span-2 h-[400px]" />
          <Skeleton className="col-span-1 h-[400px]" />
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return <div className="container py-24 text-center text-xl">Fahrzeug nicht gefunden.</div>;
  }

  const favorited = isFavorited(vehicle.id);
  const rate = Math.max(0, Math.round((vehicle.price - anzahlung) / laufzeit * 1.05));

  return (
    <div className="container py-8">
      {/* Image Gallery */}
      <div className="w-full h-[40vh] md:h-[60vh] bg-muted rounded-xl overflow-hidden mb-8 relative">
        <img 
          src={vehicle.images?.[0] || "/car-placeholder.png"} 
          alt={vehicle.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full bg-background/80 backdrop-blur"
            onClick={handleShare}
            title="Teilen"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full bg-background/80 backdrop-blur"
            onClick={() => toggleFavorite(vehicle.id)}
            title={favorited ? "Von Merkliste entfernen" : "Zur Merkliste hinzufügen"}
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-colors",
                favorited ? "fill-primary text-primary" : ""
              )}
            />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{vehicle.title}</h1>
                <p className="text-xl text-muted-foreground">{vehicle.brand} {vehicle.model}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  {new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(vehicle.price)}
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-6">
              <Badge variant="outline" className="text-sm px-3 py-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> {vehicle.year}
              </Badge>
              <Badge variant="outline" className="text-sm px-3 py-1 flex items-center gap-2">
                <Gauge className="w-4 h-4" /> {new Intl.NumberFormat("de-DE").format(vehicle.km)} km
              </Badge>
              <Badge variant="outline" className="text-sm px-3 py-1 flex items-center gap-2">
                <Fuel className="w-4 h-4" /> {vehicle.fuelType}
              </Badge>
              <Badge variant="outline" className="text-sm px-3 py-1 flex items-center gap-2">
                <Car className="w-4 h-4" /> {vehicle.transmission}
              </Badge>
              <Badge variant="outline" className="text-sm px-3 py-1 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {vehicle.location}
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold border-b border-border/50 pb-2">Beschreibung</h2>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {vehicle.description || "Keine Beschreibung verfügbar."}
            </p>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-bold border-b border-border/50 pb-2">Technische Daten</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Leistung</div>
                <div className="font-medium">{vehicle.power ? `${vehicle.power} PS` : "k.A."}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Karosserie</div>
                <div className="font-medium">{vehicle.vehicleType}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Außenfarbe</div>
                <div className="font-medium">{vehicle.color || "k.A."}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Türen</div>
                <div className="font-medium">{vehicle.doors || "k.A."}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Sitzplätze</div>
                <div className="font-medium">{vehicle.seats || "k.A."}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Zustand</div>
                <div className="font-medium">{vehicle.condition === 'used' ? 'Gebraucht' : vehicle.condition === 'new' ? 'Neu' : 'Klassiker'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-primary/20 bg-card">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Händler kontaktieren
              </h3>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Geprüfter Händler aus {vehicle.location}.
                </p>
                <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12">
                  Nachricht senden
                </Button>
                <Button variant="outline" className="w-full h-12">
                  Telefonnummer anzeigen
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-6">Finanzierung berechnen</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Kaufpreis</span>
                    <span className="font-bold">{new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(vehicle.price)}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Anzahlung</span>
                    <span className="font-bold">{new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(anzahlung)}</span>
                  </div>
                  <Slider 
                    value={[anzahlung]} 
                    min={0} 
                    max={Math.floor(vehicle.price * 0.8)} 
                    step={500}
                    onValueChange={(v) => setAnzahlung(v[0])}
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Laufzeit (Monate)</span>
                    <span className="font-bold">{laufzeit}</span>
                  </div>
                  <Slider 
                    value={[laufzeit]} 
                    min={12} 
                    max={84} 
                    step={12}
                    onValueChange={(v) => setLaufzeit(v[0])}
                  />
                </div>
                
                <div className="pt-4 border-t border-border flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Monatliche Rate ab*</span>
                  <span className="text-2xl font-bold text-primary">
                    {new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(rate)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  *Dies ist ein unverbindliches Berechnungsbeispiel.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Similar Vehicles */}
      {similarVehicles && similarVehicles.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Ähnliche Fahrzeuge</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {similarVehicles.slice(0, 4).map(v => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
