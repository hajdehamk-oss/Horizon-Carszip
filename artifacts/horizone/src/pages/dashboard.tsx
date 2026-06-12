import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Settings, Heart, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Mein Profil</h1>
        <Button variant="outline">Profil bearbeiten</Button>
      </div>

      <Tabs defaultValue="favorites" className="w-full">
        <TabsList className="mb-8 p-1 bg-muted/50 rounded-lg">
          <TabsTrigger value="favorites" className="rounded-md px-6 py-2.5">
            <Heart className="w-4 h-4 mr-2" /> Favoriten
          </TabsTrigger>
          <TabsTrigger value="inquiries" className="rounded-md px-6 py-2.5">
            <MessageSquare className="w-4 h-4 mr-2" /> Anfragen
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-md px-6 py-2.5">
            <Settings className="w-4 h-4 mr-2" /> Einstellungen
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="favorites" className="space-y-6">
          <h2 className="text-2xl font-bold mb-6">Meine Favoriten</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-3 p-12 text-center border border-border/50 rounded-lg bg-card text-muted-foreground">
              Sie haben noch keine Fahrzeuge auf dem Merkzettel.
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="inquiries">
          <h2 className="text-2xl font-bold mb-6">Meine Anfragen</h2>
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              Sie haben noch keine Anfragen gesendet.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <h2 className="text-2xl font-bold mb-6">Kontoeinstellungen</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Persönliche Daten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Name</span>
                    <p className="font-medium">Max Mustermann</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">E-Mail</span>
                    <p className="font-medium">max@example.com</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Telefon</span>
                    <p className="font-medium">+49 151 12345678</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Ort</span>
                    <p className="font-medium">München</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Benachrichtigungen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">E-Mail bei neuen passenden Inseraten</p>
                      <p className="text-sm text-muted-foreground">Wir informieren Sie über neue Fahrzeuge, die zu Ihren Suchen passen.</p>
                    </div>
                    <div className="h-6 w-11 rounded-full bg-primary relative cursor-pointer">
                      <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">E-Mail bei Preisänderungen</p>
                      <p className="text-sm text-muted-foreground">Erfahren Sie sofort, wenn sich der Preis eines favorisierten Fahrzeugs ändert.</p>
                    </div>
                    <div className="h-6 w-11 rounded-full bg-primary relative cursor-pointer">
                      <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
