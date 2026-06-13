import { useParams } from "wouter";
import { useGetVehicle, useGetSimilarVehicles, getGetVehicleQueryKey, getGetSimilarVehiclesQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Gauge, Fuel, Car, MapPin, Share2, Heart, ShieldCheck, Check, Phone } from "lucide-react";
import { VehicleCard } from "@/components/vehicle-card";
import { ContactDialog } from "@/components/contact-dialog";
import { useState, useEffect, useRef, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { useFavorites } from "@/hooks/use-favorites";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function FahrzeugDetail() {
  const params = useParams();
  const vehicleId = parseInt(params.id || "0", 10);
  const { toast } = useToast();

  const { data: vehicle, isLoading } = useGetVehicle(vehicleId, {
    query: { enabled: !!vehicleId, queryKey: getGetVehicleQueryKey(vehicleId) }
  });
  const { data: similarVehicles } = useGetSimilarVehicles(vehicleId, {
    query: { enabled: !!vehicleId, queryKey: getGetSimilarVehiclesQueryKey(vehicleId) }
  });

  const { isFavorited, toggleFavorite } = useFavorites();
  const [anzahlung, setAnzahlung] = useState(5000);
  const [laufzeit, setLaufzeit] = useState(48);
  const [copied, setCopied] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [phoneVisible, setPhoneVisible] = useState(false);
  const [phoneContactOpen, setPhoneContactOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const images = vehicle?.images ?? [];

  const startSlideshow = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % images.length);
    }, 5000);
  }, [images.length]);

  useEffect(() => {
    startSlideshow();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startSlideshow]);

  function goToImage(index: number) {
    setCurrentImageIndex(index);
    startSlideshow();
  }

  async function handleShare() {
    const url = window.location.href;
    const title = vehicle?.title ?? "Fahrzeug";
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch { /* cancelled */ }
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
      {/* Contact dialogs */}
      <ContactDialog
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        vehicleTitle={vehicle.title}
        vehicleLocation={vehicle.location}
      />
      <ContactDialog
        open={phoneContactOpen}
        onClose={() => setPhoneContactOpen(false)}
        vehicleTitle={vehicle.title}
        vehicleLocation={vehicle.location}
      />

      {/* Image Gallery — auto-advancing slideshow */}
      <div className="mb-8 space-y-3">
        <div className="w-full h-[40vh] md:h-[60vh] bg-muted rounded-xl overflow-hidden relative group">
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`${vehicle.title} – Bild ${i + 1}`}
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-opacity duration-700",
                i === currentImageIndex ? "opacity-100" : "opacity-0"
              )}
            />
          ))}
          {images.length === 0 && (
            <img src="/car-placeholder.png" alt={vehicle.title} className="w-full h-full object-cover" />
          )}

          {/* Prev / Next arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => goToImage((currentImageIndex - 1 + images.length) % images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/70 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/90"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button
                onClick={() => goToImage((currentImageIndex + 1) % images.length)}
                className="absolute right-14 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/70 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/90"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}

          {/* Dot indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToImage(i)}
                  className={cn(
                    "rounded-full transition-all",
                    i === currentImageIndex
                      ? "w-6 h-2 bg-white"
                      : "w-2 h-2 bg-white/50 hover:bg-white/80"
                  )}
                />
              ))}
            </div>
          )}

          {/* Photo count badge */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-4 text-xs bg-background/70 backdrop-blur rounded-full px-2.5 py-1 text-foreground font-medium">
              {currentImageIndex + 1} / {images.length}
            </div>
          )}

          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button size="icon" variant="secondary" className="rounded-full bg-background/80 backdrop-blur"
              onClick={handleShare} title="Teilen">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
            </Button>
            <Button size="icon" variant="secondary" className="rounded-full bg-background/80 backdrop-blur"
              onClick={() => toggleFavorite(vehicle.id)}
              title={favorited ? "Von Merkliste entfernen" : "Zur Merkliste hinzufügen"}>
              <Heart className={cn("w-4 h-4 transition-colors", favorited ? "fill-primary text-primary" : "")} />
            </Button>
          </div>
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => goToImage(i)}
                className={cn(
                  "flex-shrink-0 w-20 h-14 md:w-28 md:h-18 rounded-lg overflow-hidden border-2 transition-all",
                  i === currentImageIndex
                    ? "border-primary opacity-100 scale-105"
                    : "border-transparent opacity-60 hover:opacity-90"
                )}
              >
                <img src={src} alt={`Vorschau ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
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
                  {new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF", maximumFractionDigits: 0 }).format(vehicle.price)}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-6">
              <Badge variant="outline" className="text-sm px-3 py-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> {vehicle.year}
              </Badge>
              <Badge variant="outline" className="text-sm px-3 py-1 flex items-center gap-2">
                <Gauge className="w-4 h-4" /> {new Intl.NumberFormat("de-CH").format(vehicle.km)} km
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
                <div className="font-medium">
                  {vehicle.condition === 'used' ? 'Gebraucht' : vehicle.condition === 'new' ? 'Neu' : 'Klassiker'}
                </div>
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
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Geprüfter Händler aus {vehicle.location}.</p>
                <Button
                  className="w-full font-bold h-12 bg-primary hover:bg-primary/90 text-white"
                  onClick={() => setContactOpen(true)}
                >
                  Nachricht senden
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12 gap-2"
                  onClick={() => {
                    if (phoneVisible) {
                      setPhoneVisible(false);
                    } else {
                      setPhoneContactOpen(true);
                      setPhoneVisible(true);
                    }
                  }}
                >
                  <Phone className="w-4 h-4" />
                  {phoneVisible ? "+41 44 456 789 00" : "Telefonnummer anzeigen"}
                </Button>
                {phoneVisible && (
                  <p className="text-xs text-muted-foreground text-center">
                    Bitte nennen Sie beim Anruf Ihren Namen und das Inserat.
                  </p>
                )}
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
                    <span className="font-bold">
                      {new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF", maximumFractionDigits: 0 }).format(vehicle.price)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Anzahlung</span>
                    <span className="font-bold">
                      {new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF", maximumFractionDigits: 0 }).format(anzahlung)}
                    </span>
                  </div>
                  <Slider value={[anzahlung]} min={0} max={Math.floor(vehicle.price * 0.8)} step={500}
                    onValueChange={(v) => setAnzahlung(v[0])} />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Laufzeit (Monate)</span>
                    <span className="font-bold">{laufzeit}</span>
                  </div>
                  <Slider value={[laufzeit]} min={12} max={84} step={12}
                    onValueChange={(v) => setLaufzeit(v[0])} />
                </div>

                <div className="pt-4 border-t border-border flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Monatliche Rate ab*</span>
                  <span className="text-2xl font-bold text-primary">
                    {new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF", maximumFractionDigits: 0 }).format(rate)}
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
