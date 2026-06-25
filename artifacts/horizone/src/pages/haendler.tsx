import { Link } from "wouter";
import { useListDealers } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Car, MapPin, Star, ShieldCheck, Phone, Mail } from "lucide-react";

function DealerCard({ dealer }: { dealer: any }) {
  return (
    <Link href={`/haendler/${dealer.id}`}>
      <div className="group rounded-xl border border-border/50 bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer">
        <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
        <div className="px-5 pb-5 -mt-8">
          <div className="flex items-end gap-4 mb-3">
            <div className="w-16 h-16 rounded-xl border-2 border-border bg-background flex items-center justify-center shadow-md">
              <Car className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-1.5">
                {dealer.verified && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verifiziert
                  </Badge>
                )}
                {dealer.rating && (
                  <Badge variant="outline" className="text-xs gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {Number(dealer.rating).toFixed(1)}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <h3 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-1 mb-1">
            {dealer.name}
          </h3>

          {(dealer.city || dealer.location) && (
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              {dealer.city || dealer.location}
            </p>
          )}

          {dealer.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {dealer.description}
            </p>
          )}

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground border-t border-border/50 pt-3">
            {dealer.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" /> {dealer.phone}
              </span>
            )}
            {dealer.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" /> {dealer.email}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Haendler() {
  const { data: dealers, isLoading, error } = useListDealers();

  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Händler</h1>
        <p className="text-muted-foreground">
          Entdecken Sie unsere verifizierten Premium-Autohändler
        </p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      )}

      {error && (
        <div className="py-16 text-center text-muted-foreground">
          Händler konnten nicht geladen werden.
        </div>
      )}

      {dealers && dealers.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          Keine Händler gefunden.
        </div>
      )}

      {dealers && dealers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dealers.map((dealer: any) => (
            <DealerCard key={dealer.id} dealer={dealer} />
          ))}
        </div>
      )}
    </div>
  );
}
