import { useState, useRef } from "react";
import { useGetAdminStats, useGetPlatformStats, useListVehicles, useCreateVehicle } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Car, Euro, Store, CheckCircle, Clock, Plus, Trash2, Upload, X, LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const chartData = [
  { name: "Jan", revenue: 2990 },
  { name: "Feb", revenue: 5980 },
  { name: "Mär", revenue: 5980 },
  { name: "Apr", revenue: 8970 },
  { name: "Mai", revenue: 8970 },
  { name: "Jun", revenue: 11960 },
  { name: "Jul", revenue: 11960 },
];

interface VehicleFormData {
  title: string;
  brand: string;
  model: string;
  year: string;
  price: string;
  km: string;
  fuelType: string;
  transmission: string;
  vehicleType: string;
  location: string;
  description: string;
  color: string;
  power: string;
  doors: string;
  seats: string;
  condition: string;
  featured: boolean;
}

const emptyForm: VehicleFormData = {
  title: "", brand: "", model: "", year: new Date().getFullYear().toString(),
  price: "", km: "", fuelType: "Benzin", transmission: "Automatik",
  vehicleType: "Limousine", location: "", description: "", color: "",
  power: "", doors: "4", seats: "5", condition: "used", featured: false,
};

export default function Admin() {
  const { data: adminStats, isLoading: isLoadingAdmin } = useGetAdminStats();
  const { data: platformStats, isLoading: isLoadingPlatform } = useGetPlatformStats();
  const { data: vehiclesData, isLoading: isLoadingVehicles } = useListVehicles({ limit: 50 });
  const { mutateAsync: createVehicle } = useCreateVehicle();
  const { token, logout } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<VehicleFormData>(emptyForm);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function setField<K extends keyof VehicleFormData>(key: K, value: VehicleFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setIsUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("image", file);
        const res = await fetch("/api/upload/vehicle-image", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        if (!res.ok) throw new Error("Upload fehlgeschlagen");
        const body = await res.json() as { url: string };
        urls.push(body.url);
      }
      setUploadedImages(prev => [...prev, ...urls]);
      toast({ title: `${urls.length} Bild${urls.length > 1 ? "er" : ""} hochgeladen` });
    } catch (err) {
      toast({ title: "Upload fehlgeschlagen", description: String(err), variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDeleteVehicle(id: number, title: string) {
    if (!confirm(`„${title}" wirklich löschen?`)) return;
    try {
      await fetch(`/api/vehicles/${id}/admin`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await queryClient.invalidateQueries();
      toast({ title: "Fahrzeug gelöscht" });
    } catch {
      toast({ title: "Fehler beim Löschen", variant: "destructive" });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createVehicle({
        data: {
          title: form.title,
          brand: form.brand,
          model: form.model,
          year: parseInt(form.year),
          price: parseInt(form.price),
          km: parseInt(form.km),
          fuelType: form.fuelType,
          transmission: form.transmission,
          vehicleType: form.vehicleType,
          location: form.location,
          description: form.description || undefined,
          color: form.color || undefined,
          power: form.power ? parseInt(form.power) : undefined,
          doors: form.doors ? parseInt(form.doors) : undefined,
          seats: form.seats ? parseInt(form.seats) : undefined,
          condition: form.condition,
          featured: form.featured,
          images: uploadedImages,
        },
      });
      await queryClient.invalidateQueries();
      toast({ title: "Fahrzeug erfolgreich erstellt" });
      setForm(emptyForm);
      setUploadedImages([]);
      setDialogOpen(false);
    } catch (err) {
      toast({ title: "Fehler beim Erstellen", description: String(err), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <Button variant="outline" size="sm" onClick={() => { logout(); navigate("/admin/login"); }} className="gap-2">
          <LogOut className="h-4 w-4" /> Abmelden
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Umsatz Gesamt</CardTitle>
            <Euro className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoadingAdmin ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(adminStats?.totalRevenue || 0)}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">{adminStats?.totalDealerSubscriptions || 0} aktive Abos à €299</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nutzer</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoadingPlatform ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-2xl font-bold">{new Intl.NumberFormat("de-DE").format(platformStats?.totalUsers || 0)}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">+{adminStats?.newUsersThisMonth || 0} diesen Monat</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Inserate</CardTitle>
            <Car className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoadingAdmin ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-2xl font-bold">{new Intl.NumberFormat("de-DE").format(adminStats?.activeVehicles || 0)}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">+{adminStats?.newVehiclesThisMonth || 0} diesen Monat</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Händler</CardTitle>
            <Store className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoadingPlatform ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-2xl font-bold">{new Intl.NumberFormat("de-DE").format(platformStats?.totalDealers || 0)}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Geprüfte Partner</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="vehicles">Fahrzeuge</TabsTrigger>
          <TabsTrigger value="approvals">Freigaben</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Umsatzübersicht</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.1)" }}
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Alle Fahrzeuge ({vehiclesData?.total ?? 0})</h2>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90 gap-2">
                    <Plus className="h-4 w-4" /> Fahrzeug hinzufügen
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Neues Fahrzeug erstellen</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-6 pt-2">
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Fotos</Label>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-6 text-center cursor-pointer transition-colors"
                      >
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {isUploading ? "Wird hochgeladen..." : "Klicken oder Dateien hierher ziehen"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP bis zu 10 MB</p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                      {uploadedImages.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {uploadedImages.map((url, i) => (
                            <div key={i} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-border">
                              <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setUploadedImages(prev => prev.filter((_, j) => j !== i))}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                              >
                                <X className="h-4 w-4 text-white" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 space-y-1.5">
                        <Label>Titel *</Label>
                        <Input value={form.title} onChange={e => setField("title", e.target.value)} placeholder="z.B. Porsche 911 Carrera S – Sportabgasanlage" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Marke *</Label>
                        <Input value={form.brand} onChange={e => setField("brand", e.target.value)} placeholder="z.B. Porsche" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Modell *</Label>
                        <Input value={form.model} onChange={e => setField("model", e.target.value)} placeholder="z.B. 911 Carrera S" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Baujahr *</Label>
                        <Input type="number" value={form.year} onChange={e => setField("year", e.target.value)} min={1900} max={2030} required />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Preis (€) *</Label>
                        <Input type="number" value={form.price} onChange={e => setField("price", e.target.value)} placeholder="z.B. 89900" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Kilometerstand *</Label>
                        <Input type="number" value={form.km} onChange={e => setField("km", e.target.value)} placeholder="z.B. 25000" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Standort *</Label>
                        <Input value={form.location} onChange={e => setField("location", e.target.value)} placeholder="z.B. München" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Kraftstoff</Label>
                        <Select value={form.fuelType} onValueChange={v => setField("fuelType", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["Benzin", "Diesel", "Elektro", "Hybrid", "Plug-in Hybrid", "Wasserstoff"].map(f => (
                              <SelectItem key={f} value={f}>{f}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Getriebe</Label>
                        <Select value={form.transmission} onValueChange={v => setField("transmission", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["Automatik", "Schaltgetriebe", "Halbautomatik"].map(t => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Karosserie</Label>
                        <Select value={form.vehicleType} onValueChange={v => setField("vehicleType", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["Limousine", "SUV", "Kombi", "Sportwagen", "Cabrio", "Coupe", "Van", "Geländewagen"].map(t => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Zustand</Label>
                        <Select value={form.condition} onValueChange={v => setField("condition", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">Neu</SelectItem>
                            <SelectItem value="used">Gebraucht</SelectItem>
                            <SelectItem value="classic">Klassiker</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Farbe</Label>
                        <Input value={form.color} onChange={e => setField("color", e.target.value)} placeholder="z.B. Schwarz-Metallic" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Leistung (PS)</Label>
                        <Input type="number" value={form.power} onChange={e => setField("power", e.target.value)} placeholder="z.B. 450" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Türen</Label>
                        <Input type="number" value={form.doors} onChange={e => setField("doors", e.target.value)} min={1} max={6} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Sitzplätze</Label>
                        <Input type="number" value={form.seats} onChange={e => setField("seats", e.target.value)} min={1} max={9} />
                      </div>
                      <div className="col-span-2 space-y-1.5">
                        <Label>Beschreibung</Label>
                        <Textarea
                          value={form.description}
                          onChange={e => setField("description", e.target.value)}
                          placeholder="Fahrzeugbeschreibung, Ausstattung, Besonderheiten..."
                          rows={4}
                        />
                      </div>
                      <div className="col-span-2 flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="featured"
                          checked={form.featured}
                          onChange={e => setField("featured", e.target.checked)}
                          className="h-4 w-4 accent-primary"
                        />
                        <Label htmlFor="featured" className="cursor-pointer">Als „Top Inserat" markieren</Label>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                        Abbrechen
                      </Button>
                      <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={isSubmitting || isUploading}>
                        {isSubmitting ? "Wird erstellt..." : "Fahrzeug erstellen"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              {isLoadingVehicles ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-14 w-full" />)}
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {vehiclesData?.vehicles?.map(vehicle => (
                    <div key={vehicle.id} className="p-4 flex items-center gap-4 hover:bg-muted/20 transition-colors">
                      <div className="w-14 h-10 bg-muted rounded overflow-hidden shrink-0">
                        {vehicle.images?.[0] ? (
                          <img src={vehicle.images[0]} alt={vehicle.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Car className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{vehicle.title}</p>
                        <p className="text-xs text-muted-foreground">{vehicle.brand} · {vehicle.year} · {new Intl.NumberFormat("de-DE").format(vehicle.km)} km</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {vehicle.featured && <Badge className="text-xs bg-primary/10 text-primary border-none">Top</Badge>}
                        <span className="font-bold text-primary text-sm">
                          {new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(vehicle.price)}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteVehicle(vehicle.id, vehicle.title)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {!vehiclesData?.vehicles?.length && (
                    <div className="p-12 text-center text-muted-foreground">Keine Fahrzeuge vorhanden.</div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle>Ausstehende Händler-Freigaben</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["Rhein Auto GmbH – Düsseldorf", "Autohof Bayern GmbH – Augsburg", "StarCars AG – Frankfurt"].map((name) => (
                  <div key={name} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Store className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">{name.split(" – ")[0]}</p>
                        <p className="text-sm text-muted-foreground">{name.split(" – ")[1]}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 gap-1.5">
                        <Clock className="w-4 h-4" /> Ablehnen
                      </Button>
                      <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/10 gap-1.5">
                        <CheckCircle className="w-4 h-4" /> Genehmigen
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
