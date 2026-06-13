import { useParams, Link } from "wouter";
import { useGetDealer, useGetDealerVehicles } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { VehicleCard } from "@/components/vehicle-card";
import { MapPin, Phone, Mail, Star, ShieldCheck, Car, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HaendlerDetail() {
  const params = useParams();
  const dealerId = parseInt(params.id || "0", 10);

  const { data: dealer, isLoading: isLoadingDealer } = useGetDealer(dealerId, {
    query: { enabled: !!dealerId },
  });
  const { data: vehicles, isLoading: isLoadingVehicles } = useGetDealerVehicles(dealerId, {
    query: { enabled: !!dealerId },
  });

  if (isLoadingDealer) {
    return (
      <div className="container py-8 space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-80 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="container py-24 text-center">
        <p className="text-xl text-muted-foreground">Händler nicht gefunden.</p>
        <Link href="/fahrzeuge">
          <Button variant="outline" className="mt-4">Zurück zur Übersicht</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <Link href="/fahrzeuge">
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
          <ArrowLeft className="w-4 h-4" /> Zurück zur Übersicht
        </button>
      </Link>

      {/* Dealer header card */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
        <div className="px-6 pb-6 -mt-10">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="w-20 h-20 rounded-xl border-2 border-border bg-background flex items-center justify-center shadow-lg">
              <Car className="w-9 h-9 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold">{dealer.name}</h1>
                {dealer.verified && (
                  <Badge variant="outline" className="border-primary/50 text-primary gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verifiziert
                  </Badge>
                )}
                {dealer.subscriptionTier === "premium" && (
                  <Badge className="bg-primary text-white gap-1">
                    <Star className="w-3 h-3" /> Premium
                  </Badge>
                )}
              </div>
              {dealer.rating && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(n => (
                      <Star
                        key={n}
                        className={`w-3.5 h-3.5 ${n <= Math.round(dealer.rating!) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{dealer.rating.toFixed(1)}</span>
                  <span>({dealer.reviewCount} Bewertungen)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: vehicles */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold">
            Fahrzeuge dieses Händlers
            {vehicles && <span className="ml-2 text-base font-normal text-muted-foreground">({vehicles.length})</span>}
          </h2>
          {isLoadingVehicles ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map(i => <Skeleton key={i} className="h-72 rounded-xl" />)}
            </div>
          ) : vehicles && vehicles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}
            </div>
          ) : (
            <p className="text-muted-foreground py-8 text-center border border-border/50 rounded-lg">
              Keine Fahrzeuge verfügbar.
            </p>
          )}
        </div>

        {/* Right: contact */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border/50 bg-card p-5 space-y-4">
            <h3 className="font-semibold text-lg">Kontakt &amp; Standort</h3>
            {dealer.address && (
              <div className="flex gap-3 text-sm">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">{dealer.name}</p>
                  <p className="text-muted-foreground">{dealer.address}</p>
                  <p className="text-muted-foreground">{dealer.city}</p>
                </div>
              </div>
            )}
            {dealer.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <a href={`tel:${dealer.phone}`} className="hover:text-primary transition-colors">
                  {dealer.phone}
                </a>
              </div>
            )}
            {dealer.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <a href={`mailto:${dealer.email}`} className="hover:text-primary transition-colors break-all">
                  {dealer.email}
                </a>
              </div>
            )}
            <a href={`tel:${dealer.phone || ""}`}>
              <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold mt-2">
                <Phone className="w-4 h-4 mr-2" /> Jetzt anrufen
              </Button>
            </a>
          </div>

          {dealer.description && (
            <div className="rounded-xl border border-border/50 bg-card p-5 space-y-2">
              <h3 className="font-semibold">Über uns</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{dealer.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
