import { Link } from "wouter";
import { Car, MapPin, Gauge, Calendar, Fuel, Heart, ArrowRightLeft } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Vehicle } from "@workspace/api-client-react";
import sedanUrl from "@/assets/car-sedan.png";
import { useFavorites } from "@/hooks/use-favorites";
import { useCompare } from "@/hooks/use-compare";
import { cn } from "@/lib/utils";

interface VehicleCardProps {
  vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const imageUrl = vehicle.images?.[0] || sedanUrl;
  const { isFavorited, toggleFavorite } = useFavorites();
  const { isInCompare, toggleCompare, isFull } = useCompare();
  const favorited = isFavorited(vehicle.id);
  const comparing = isInCompare(vehicle.id);

  return (
    <Card className="overflow-hidden flex flex-col group border-border/50 hover:border-primary/50 transition-all hover:shadow-lg bg-card text-card-foreground">
      <Link href={`/fahrzeuge/${vehicle.id}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-muted cursor-pointer">
          <img
            src={imageUrl}
            alt={vehicle.title}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
          {vehicle.featured && (
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground font-bold border-none uppercase tracking-wide">
              Top Inserat
            </Badge>
          )}
          <div className="absolute bottom-3 right-3 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded text-lg font-bold">
            {new Intl.NumberFormat("de-CH", {
              style: "currency",
              currency: "CHF",
              maximumFractionDigits: 0,
            }).format(vehicle.price)}
          </div>
        </div>
      </Link>

      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
          <Link href={`/fahrzeuge/${vehicle.id}`} className="hover:text-primary transition-colors line-clamp-2 cursor-pointer font-bold text-lg leading-tight flex-1">
            {vehicle.title}
          </Link>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0 -mt-1 -mr-1"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(vehicle.id);
            }}
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-colors",
                favorited ? "fill-primary text-primary" : "text-muted-foreground"
              )}
            />
          </Button>
        </div>
        <div className="text-sm text-muted-foreground mt-1 font-medium">
          {vehicle.brand} {vehicle.model}
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 flex-1">
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary/70" />
            <span>{vehicle.year}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Gauge className="w-4 h-4 text-primary/70" />
            <span>{new Intl.NumberFormat("de-DE").format(vehicle.km)} km</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Fuel className="w-4 h-4 text-primary/70" />
            <span className="truncate">{vehicle.fuelType}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Car className="w-4 h-4 text-primary/70" />
            <span className="truncate">{vehicle.transmission}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 text-sm text-muted-foreground flex items-center justify-between border-t border-border/30 mt-auto">
        <div className="flex items-center gap-1.5 pt-3">
          <MapPin className="w-4 h-4" />
          <span className="truncate max-w-[120px]">{vehicle.location}</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            "pt-3 h-auto gap-1.5 text-xs font-medium transition-colors",
            comparing
              ? "text-primary"
              : isFull && !comparing
                ? "text-muted-foreground/40 cursor-not-allowed"
                : "text-muted-foreground hover:text-primary"
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isFull || comparing) toggleCompare(vehicle.id);
          }}
          title={
            comparing ? "Aus Vergleich entfernen"
            : isFull ? "Vergleich ist voll (max. 2)"
            : "Zum Vergleich hinzufügen"
          }
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          {comparing ? "Im Vergleich" : "Vergleichen"}
        </Button>
      </CardFooter>
    </Card>
  );
}
