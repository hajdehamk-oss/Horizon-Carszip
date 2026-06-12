import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Heart, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useListFavorites, useListInquiries } from "@workspace/api-client-react";
import { VehicleCard } from "@/components/vehicle-card";
import { useToast } from "@/hooks/use-toast";
import { useVisitorProfile } from "@/hooks/use-visitor-profile";
import { useState } from "react";

const USER_ID = 1;

function statusLabel(status: string) {
  if (['new', 'neu'].includes(status)) return { label: 'Neu', variant: 'default' as const };
  if (['replied', 'beantwortet'].includes(status)) return { label: 'Beantwortet', variant: 'outline' as const };
  return { label: status, variant: 'outline' as const };
}

export default function Dashboard() {
  const { data: favorites, isLoading: isLoadingFavorites } = useListFavorites({ userId: USER_ID });
  const { data: inquiries, isLoading: isLoadingInquiries } = useListInquiries({ userId: USER_ID });
  const { toast } = useToast();
  const { profile, updateProfile } = useVisitorProfile();
  const [notifNew, setNotifNew] = useState(true);
  const [notifPrice, setNotifPrice] = useState(true);

  const [editName, setEditName] = useState(profile?.name || "");
  const [editEmail, setEditEmail] = useState(profile?.email || "");
  const [editPhone, setEditPhone] = useState(profile?.phone || "");

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    updateProfile({ name: editName, email: editEmail, phone: editPhone });
    toast({ description: "Profil gespeichert." });
  }

  const greeting = profile?.name ? `Hallo, ${profile.name}` : "Mein Profil";

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{greeting}</h1>
      </div>

      <Tabs defaultValue="favorites" className="w-full">
        <div className="overflow-x-auto mb-8 -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="p-1 bg-muted/50 rounded-lg w-max min-w-full">
            <TabsTrigger value="favorites" className="rounded-md px-4 md:px-6 py-2.5 whitespace-nowrap">
              <Heart className="w-4 h-4 mr-2" /> Gespeicherte Fahrzeuge
              {favorites && favorites.length > 0 && (
                <span className="ml-1.5 text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">{favorites.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="inquiries" className="rounded-md px-4 md:px-6 py-2.5 whitespace-nowrap">
              <MessageSquare className="w-4 h-4 mr-2" /> Meine Nachrichten
              {inquiries && inquiries.length > 0 && (
                <span className="ml-1.5 text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">{inquiries.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-md px-4 md:px-6 py-2.5 whitespace-nowrap">
              <Settings className="w-4 h-4 mr-2" /> Einstellungen
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="favorites" className="space-y-6">
          <h2 className="text-2xl font-bold mb-6">
            {profile?.name ? `${profile.name}s gespeicherte Fahrzeuge` : "Gespeicherte Fahrzeuge"}
          </h2>
          {isLoadingFavorites ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-80 w-full rounded-xl" />)}
            </div>
          ) : favorites && favorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {favorites.map((vehicle: Parameters<typeof VehicleCard>[0]['vehicle']) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center border border-border/50 rounded-lg bg-card text-muted-foreground">
              {profile?.name
                ? `${profile.name}, Sie haben noch keine Fahrzeuge gespeichert.`
                : "Sie haben noch keine Fahrzeuge gespeichert."}
              <br />
              <span className="text-sm">Klicken Sie auf das ♥ Symbol bei einem Inserat.</span>
            </div>
          )}
        </TabsContent>

        <TabsContent value="inquiries">
          <h2 className="text-2xl font-bold mb-6">Meine Nachrichten</h2>
          {isLoadingInquiries ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : inquiries && inquiries.length > 0 ? (
            <div className="space-y-4">
              {inquiries.map((inquiry: { id: number; senderName: string; senderEmail: string; message: string; status: string; createdAt: string }) => {
                const { label, variant } = statusLabel(inquiry.status);
                return (
                  <Card key={inquiry.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <p className="font-medium">{inquiry.senderName}</p>
                          <p className="text-sm text-muted-foreground">{inquiry.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(inquiry.createdAt).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit", year: "numeric" })}
                          </p>
                        </div>
                        <Badge variant={variant}>{label}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                Sie haben noch keine Nachrichten gesendet.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <h2 className="text-2xl font-bold mb-6">Meine Angaben</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Persönliche Daten</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="settings-name">Name</Label>
                    <Input
                      id="settings-name"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      placeholder="Luca Müller"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="settings-email">E-Mail</Label>
                    <Input
                      id="settings-email"
                      type="email"
                      value={editEmail}
                      onChange={e => setEditEmail(e.target.value)}
                      placeholder="luca@example.ch"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="settings-phone">Telefon</Label>
                    <Input
                      id="settings-phone"
                      type="tel"
                      value={editPhone}
                      onChange={e => setEditPhone(e.target.value)}
                      placeholder="+41 79 123 45 67"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold">
                    Speichern
                  </Button>
                </form>
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
                    <button
                      onClick={() => setNotifNew(v => !v)}
                      className={`h-6 w-11 rounded-full relative transition-colors ${notifNew ? "bg-primary" : "bg-muted-foreground/30"}`}
                    >
                      <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${notifNew ? "right-1" : "left-1"}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">E-Mail bei Preisänderungen</p>
                      <p className="text-sm text-muted-foreground">Erfahren Sie sofort, wenn sich der Preis eines gespeicherten Fahrzeugs ändert.</p>
                    </div>
                    <button
                      onClick={() => setNotifPrice(v => !v)}
                      className={`h-6 w-11 rounded-full relative transition-colors ${notifPrice ? "bg-primary" : "bg-muted-foreground/30"}`}
                    >
                      <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${notifPrice ? "right-1" : "left-1"}`} />
                    </button>
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
