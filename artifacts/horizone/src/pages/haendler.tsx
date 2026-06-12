import { useGetDashboardStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Eye, MessageSquare, Heart, PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function Haendler() {
  const { data: stats, isLoading } = useGetDashboardStats({ dealerId: 1 }); // Mock dealer ID

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
            {isLoading ? <Skeleton className="h-8 w-24" /> : (
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
             {isLoading ? <Skeleton className="h-8 w-24" /> : (
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
             {isLoading ? <Skeleton className="h-8 w-24" /> : (
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
             {isLoading ? <Skeleton className="h-8 w-24" /> : (
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
            <div className="p-12 text-center text-muted-foreground">
              Inserate-Verwaltung lädt...
            </div>
          </Card>
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Aktuelle Anfragen</h2>
          <Card className="border-border/50">
             <div className="p-12 text-center text-muted-foreground">
              Nachrichten laden...
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
