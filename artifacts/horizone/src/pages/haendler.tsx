import { useGetDashboardStats, useListVehicles, useListInquiries } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Eye, MessageSquare, Heart, PlusCircle, MapPin, Calendar, Gauge } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

const DEALER_ID = 1;

export default function Haendler() {
  const { data: stats, isLoading: isLoadingStats } = useGetDashboardStats({ dealerId: DEALER_ID });
  const { data: vehiclesData, isLoading: isLoadingVehicles } = useListVehicles({ limit: 5 });
  const { data: inquiries, isLoading: isLoadingInquiries } = useListInquiries({ dealerId: DEALER_ID });

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Händler-Dashboard</h1>
          <p className="text-muted-foreground mt-1">Willkommen zurück, Premium Motors GmbH</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-4 w-4" />
          Neues Inserat erstellen
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Inserate</CardTitle>
            <Car className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-2xl font-bold">{new Intl.NumberFormat("de-DE").format(stats?.activeListings || 0)}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Von 50 verfügbaren Slots</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aufrufe gesamt</CardTitle>
            <Eye className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-2xl font-bold">{new Intl.NumberFormat("de-DE").format(stats?.totalViews || 0)}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Letzte 30 Tage</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anfragen</CardTitle>
            <MessageSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-2xl font-bold">{new Intl.NumberFormat("de-DE").format(stats?.totalInquiries || 0)}</div>
            )}
            <p className="text-xs text-primary mt-1 font-medium">{stats?.recentInquiries || 0} neu</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auf dem Merkzettel</CardTitle>
            <Heart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-2xl font-bold">{new Intl.NumberFormat("de-DE").format(stats?.totalFavorites || 0)}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Über alle Inserate hinweg</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold">Ihre neuesten Inserate</h2>
          <Card className="border-border/50">
            {isLoadingVehicles ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : vehiclesData?.vehicles && vehiclesData.vehicles.length > 0 ? (
              <div className="divide-y divide-border/50">
                {vehiclesData.vehicles.map(vehicle => (
                  <div key={vehicle.id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                    <div className="w-16 h-12 bg-muted rounded overflow-hidden shrink-0">
                      {vehicle.images?.[0] ? (
                        <img src={vehicle.images[0]} alt={vehicle.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/fahrzeuge/${vehicle.id}`}>
                        <p className="font-medium truncate hover:text-primary cursor-pointer">{vehicle.title}</p>
                      </Link>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{vehicle.year}</span>
                        <span className="flex items-center gap-1"><Gauge className="w-3 h-3" />{new Intl.NumberFormat("de-DE").format(vehicle.km)} km</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{vehicle.location}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-primary">
                        {new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(vehicle.price)}
                      </div>
                      {vehicle.featured && (
                        <Badge className="text-xs mt-1 bg-primary/10 text-primary border-none">Top Inserat</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                Noch keine Inserate vorhanden.
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Aktuelle Anfragen</h2>
          <Card className="border-border/50">
            {isLoadingInquiries ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : inquiries && inquiries.length > 0 ? (
              <div className="divide-y divide-border/50">
                {inquiries.slice(0, 5).map((inquiry: { id: number; senderName: string; message: string; status: string; createdAt: string }) => (
                  <div key={inquiry.id} className="p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{inquiry.senderName}</p>
                      <Badge variant={inquiry.status === 'new' ? 'default' : 'outline'} className="text-xs">
                        {inquiry.status === 'new' ? 'Neu' : inquiry.status === 'replied' ? 'Beantwortet' : inquiry.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{inquiry.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                Noch keine Anfragen vorhanden.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
