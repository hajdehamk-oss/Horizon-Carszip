import { useState, useRef } from "react";
import {
  useGetAdminStats, useGetPlatformStats, useListVehicles,
  useCreateVehicle, useGetDashboardStats, useListInquiries, useUpdateInquiry
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users, Car, Euro, Store, CheckCircle, Clock, Plus, Trash2,
  Upload, X, LogOut, ArrowLeft, Eye, MessageSquare, Heart,
  PlusCircle, MapPin, Calendar, Gauge, Mail, Phone, CheckCheck, Inbox
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
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

const DEALER_ID = 1;

interface VehicleFormData {
  title: string; brand: string; model: string; year: string;
  price: string; km: string; fuelType: string; transmission: string;
  vehicleType: string; location: string; description: string; color: string;
  power: string; doors: string; seats: string; condition: string; featured: boolean;
}

const emptyForm: VehicleFormData = {
  title: "", brand: "", model: "", year: new Date().getFullYear().toString(),
  price: "", km: "", fuelType: "Benzin", transmission: "Automatik",
  vehicleType: "Limousine", location: "", description: "", color: "",
  power: "", doors: "4", seats: "5", condition: "used", featured: false,
};

function statusLabel(status: string) {
  if (['new', 'neu'].includes(status)) return { label: 'Neu', variant: 'default' as const };
  if (['replied', 'beantwortet'].includes(status)) return { label: 'Beantwortet', variant: 'outline' as const };
  return { label: status, variant: 'outline' as const };
}

export default function Admin() {
  const { data: adminStats, isLoading: isLoadingAdmin } = useGetAdminStats();
  const { data: platformStats, isLoading: isLoadingPlatform } = useGetPlatformStats();
  const { data: vehiclesData, isLoading: isLoadingVehicles } = useListVehicles({ limit: 50 });
  const { data: dealerStats, isLoading: isLoadingDealerStats } = useGetDashboardStats({ dealerId: DEALER_ID });
  const { data: dealerVehicles, isLoading: isLoadingDealerVehicles } = useListVehicles({ limit: 10 });
  const { data: dealerInquiries, isLoading: isLoadingDealerInquiries } = useListInquiries({ dealerId: DEALER_ID });
  const { data: allInquiries, isLoading: isLoadingAllInquiries } = useListInquiries({});
  const { mutateAsync: updateInquiry } = useUpdateInquiry();
  const { mutateAsync: createVehicle } = useCreateVehicle();
  const { token, logout } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(null);
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
          title: form.title, brand: form.brand, model: form.model,
          year: parseInt(form.year), price: parseInt(form.price), km: parseInt(form.km),
          fuelType: form.fuelType, transmission: form.transmission, vehicleType: form.vehicleType,
          location: form.location, description: form.description || undefined,
          color: form.color || undefined,
          power: form.power ? parseInt(form.power) : undefined,
          doors: form.doors ? parseInt(form.doors) : undefined,
          seats: form.seats ? parseInt(form.seats) : undefined,
          condition: form.condition, featured: form.featured, images: uploadedImages,
        },
      });
      await queryClient.invalidateQueries();
      toast({ title: "Fahrzeug erfolgreich erstellt" });
      setForm(emptyForm);
      setUploadedImages([]);
      setActiveTab("vehicles");
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

      {/* Platform stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Umsatz Gesamt</CardTitle>
            <Euro className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoadingAdmin ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF", maximumFractionDigits: 0 }).format(adminStats?.totalRevenue || 0)}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">{adminStats?.totalDealerSubscriptions || 0} aktive Abos à CHF 299</p>
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto mb-6 -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="h-auto gap-1 w-max">
            <TabsTrigger value="overview" className="whitespace-nowrap">Übersicht</TabsTrigger>
            <TabsTrigger value="haendler" className="whitespace-nowrap">Händler-Panel</TabsTrigger>
            <TabsTrigger value="vehicles" className="whitespace-nowrap">Fahrzeuge</TabsTrigger>
            <TabsTrigger value="add-vehicle" className="whitespace-nowrap">Fahrzeug hinzufügen</TabsTrigger>
            <TabsTrigger value="nachrichten" className="whitespace-nowrap">
              Nachrichten
              {allInquiries && allInquiries.filter((i: { status: string }) => i.status === "neu").length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-primary text-primary-foreground rounded-full">
                  {allInquiries.filter((i: { status: string }) => i.status === "neu").length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="approvals" className="whitespace-nowrap">Freigaben</TabsTrigger>
          </TabsList>
        </div>

        {/* ── Overview ── */}
        <TabsContent value="overview">
          <Card>
            <CardHeader><CardTitle>Umsatzübersicht</CardTitle></CardHeader>
            <CardContent className="pl-2">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `CHF ${v}`} />
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

        {/* ── Händler Panel ── */}
        <TabsContent value="haendler">
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Händler-Dashboard</h2>
                <p className="text-muted-foreground mt-1">Premium Motors GmbH</p>
              </div>
              <Button className="bg-primary hover:bg-primary/90 gap-2" onClick={() => setActiveTab("add-vehicle")}>
                <PlusCircle className="h-4 w-4" /> Neues Inserat erstellen
              </Button>
            </div>

            {/* Dealer stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aktive Inserate</CardTitle>
                  <Car className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  {isLoadingDealerStats ? <Skeleton className="h-8 w-24" /> : (
                    <div className="text-2xl font-bold">{new Intl.NumberFormat("de-DE").format(dealerStats?.activeListings || 0)}</div>
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
                  {isLoadingDealerStats ? <Skeleton className="h-8 w-24" /> : (
                    <div className="text-2xl font-bold">{new Intl.NumberFormat("de-DE").format(dealerStats?.totalViews || 0)}</div>
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
                  {isLoadingDealerStats ? <Skeleton className="h-8 w-24" /> : (
                    <div className="text-2xl font-bold">{new Intl.NumberFormat("de-DE").format(dealerStats?.totalInquiries || 0)}</div>
                  )}
                  <p className="text-xs text-primary mt-1 font-medium">{dealerStats?.recentInquiries || 0} neu</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Auf dem Merkzettel</CardTitle>
                  <Heart className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  {isLoadingDealerStats ? <Skeleton className="h-8 w-24" /> : (
                    <div className="text-2xl font-bold">{new Intl.NumberFormat("de-DE").format(dealerStats?.totalFavorites || 0)}</div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Über alle Inserate hinweg</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Listings */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Ihre neuesten Inserate</h3>
                  <Button variant="ghost" size="sm" className="text-primary" onClick={() => setActiveTab("vehicles")}>
                    Alle anzeigen →
                  </Button>
                </div>
                <Card className="border-border/50">
                  {isLoadingDealerVehicles ? (
                    <div className="p-6 space-y-4">
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                    </div>
                  ) : dealerVehicles?.vehicles && dealerVehicles.vehicles.length > 0 ? (
                    <div className="divide-y divide-border/50">
                      {dealerVehicles.vehicles.slice(0, 5).map(vehicle => (
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
                              {new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF", maximumFractionDigits: 0 }).format(vehicle.price)}
                            </div>
                            {vehicle.featured && (
                              <Badge className="text-xs mt-1 bg-primary/10 text-primary border-none">Top Inserat</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-12 text-center text-muted-foreground">Noch keine Inserate vorhanden.</div>
                  )}
                </Card>
              </div>

              {/* Inquiries */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Aktuelle Anfragen</h3>
                <Card className="border-border/50">
                  {isLoadingDealerInquiries ? (
                    <div className="p-6 space-y-4">
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
                    </div>
                  ) : dealerInquiries && dealerInquiries.length > 0 ? (
                    <div className="divide-y divide-border/50">
                      {dealerInquiries.slice(0, 5).map((inquiry: { id: number; senderName: string; message: string; status: string }) => {
                        const { label, variant } = statusLabel(inquiry.status);
                        return (
                          <div key={inquiry.id} className="p-4 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">{inquiry.senderName}</p>
                              <Badge variant={variant} className="text-xs">{label}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">{inquiry.message}</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-12 text-center text-muted-foreground">Noch keine Anfragen vorhanden.</div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Vehicles list ── */}
        <TabsContent value="vehicles">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Alle Fahrzeuge ({vehiclesData?.total ?? 0})</h2>
              <Button className="bg-primary hover:bg-primary/90 gap-2" onClick={() => setActiveTab("add-vehicle")}>
                <Plus className="h-4 w-4" /> Fahrzeug hinzufügen
              </Button>
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
                          {new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF", maximumFractionDigits: 0 }).format(vehicle.price)}
                        </span>
                        <Button
                          size="icon" variant="ghost"
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

        {/* ── Add vehicle (inline) ── */}
        <TabsContent value="add-vehicle">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="gap-2" onClick={() => setActiveTab("vehicles")}>
                <ArrowLeft className="h-4 w-4" /> Zurück zur Liste
              </Button>
              <h2 className="text-xl font-bold">Neues Fahrzeug erstellen</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <Card>
                <CardHeader><CardTitle className="text-base">Fotos</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-10 text-center cursor-pointer transition-colors"
                  >
                    <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {isUploading ? "Wird hochgeladen…" : "Klicken oder Dateien hierher ziehen"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP bis zu 10 MB</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                    onChange={handleImageUpload} disabled={isUploading} />
                  {uploadedImages.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {uploadedImages.map((url, i) => (
                        <div key={i} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-border">
                          <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                          <button type="button"
                            onClick={() => setUploadedImages(prev => prev.filter((_, j) => j !== i))}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <X className="h-5 w-5 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Fahrzeugdaten</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2 space-y-1.5">
                      <Label>Titel *</Label>
                      <Input value={form.title} onChange={e => setField("title", e.target.value)} placeholder="z.B. Porsche 911 Carrera S – Sportabgasanlage" required />
                    </div>
                    <div className="space-y-1.5"><Label>Marke *</Label>
                      <Input value={form.brand} onChange={e => setField("brand", e.target.value)} placeholder="z.B. Porsche" required />
                    </div>
                    <div className="space-y-1.5"><Label>Modell *</Label>
                      <Input value={form.model} onChange={e => setField("model", e.target.value)} placeholder="z.B. 911 Carrera S" required />
                    </div>
                    <div className="space-y-1.5"><Label>Baujahr *</Label>
                      <Input type="number" value={form.year} onChange={e => setField("year", e.target.value)} min={1900} max={2030} required />
                    </div>
                    <div className="space-y-1.5"><Label>Preis (CHF) *</Label>
                      <Input type="number" value={form.price} onChange={e => setField("price", e.target.value)} placeholder="z.B. 89900" required />
                    </div>
                    <div className="space-y-1.5"><Label>Kilometerstand *</Label>
                      <Input type="number" value={form.km} onChange={e => setField("km", e.target.value)} placeholder="z.B. 25000" required />
                    </div>
                    <div className="space-y-1.5"><Label>Standort *</Label>
                      <Input value={form.location} onChange={e => setField("location", e.target.value)} placeholder="z.B. München" required />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Technische Details</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="space-y-1.5"><Label>Kraftstoff</Label>
                      <Select value={form.fuelType} onValueChange={v => setField("fuelType", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["Benzin", "Diesel", "Elektro", "Hybrid", "Plug-in Hybrid", "Wasserstoff"].map(f => (
                            <SelectItem key={f} value={f}>{f}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5"><Label>Getriebe</Label>
                      <Select value={form.transmission} onValueChange={v => setField("transmission", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["Automatik", "Schaltgetriebe", "Halbautomatik"].map(t => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5"><Label>Karosserie</Label>
                      <Select value={form.vehicleType} onValueChange={v => setField("vehicleType", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["Limousine", "SUV", "Kombi", "Sportwagen", "Cabrio", "Coupe", "Van", "Geländewagen"].map(t => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5"><Label>Zustand</Label>
                      <Select value={form.condition} onValueChange={v => setField("condition", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Neu</SelectItem>
                          <SelectItem value="used">Gebraucht</SelectItem>
                          <SelectItem value="classic">Klassiker</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5"><Label>Farbe</Label>
                      <Input value={form.color} onChange={e => setField("color", e.target.value)} placeholder="z.B. Schwarz-Metallic" />
                    </div>
                    <div className="space-y-1.5"><Label>Leistung (PS)</Label>
                      <Input type="number" value={form.power} onChange={e => setField("power", e.target.value)} placeholder="z.B. 450" />
                    </div>
                    <div className="space-y-1.5"><Label>Türen</Label>
                      <Input type="number" value={form.doors} onChange={e => setField("doors", e.target.value)} min={1} max={6} />
                    </div>
                    <div className="space-y-1.5"><Label>Sitzplätze</Label>
                      <Input type="number" value={form.seats} onChange={e => setField("seats", e.target.value)} min={1} max={9} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Beschreibung & Optionen</CardTitle></CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-1.5">
                    <Label>Beschreibung</Label>
                    <Textarea value={form.description} onChange={e => setField("description", e.target.value)}
                      placeholder="Fahrzeugbeschreibung, Ausstattung, Besonderheiten…" rows={5} />
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="featured" checked={form.featured}
                      onChange={e => setField("featured", e.target.checked)} className="h-4 w-4 accent-primary" />
                    <Label htmlFor="featured" className="cursor-pointer">Als „Top Inserat" markieren</Label>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button type="button" variant="outline" className="flex-1 md:flex-none md:px-10"
                  onClick={() => { setForm(emptyForm); setUploadedImages([]); setActiveTab("vehicles"); }}>
                  Abbrechen
                </Button>
                <Button type="submit" className="flex-1 md:flex-none md:px-10 bg-primary hover:bg-primary/90"
                  disabled={isSubmitting || isUploading}>
                  {isSubmitting ? "Wird erstellt…" : "Fahrzeug erstellen"}
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>

        {/* ── Nachrichten ── */}
        <TabsContent value="nachrichten">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
            {/* Left: message list */}
            <div className="lg:col-span-1 flex flex-col border border-border/50 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border/50 flex items-center gap-2 bg-muted/20">
                <Inbox className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">Eingang</h3>
                <span className="ml-auto text-xs text-muted-foreground">{allInquiries?.length ?? 0} Nachrichten</span>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-border/40">
                {isLoadingAllInquiries ? (
                  <div className="p-4 space-y-3">
                    {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : allInquiries && allInquiries.length > 0 ? (
                  [...allInquiries]
                    .sort((a: { createdAt: string }, b: { createdAt: string }) =>
                      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    )
                    .map((inq: { id: number; senderName: string; message: string; status: string; createdAt: string }) => {
                      const isNew = inq.status === "neu";
                      const isSelected = selectedInquiryId === inq.id;
                      return (
                        <button
                          key={inq.id}
                          onClick={() => setSelectedInquiryId(inq.id)}
                          className={`w-full text-left p-4 transition-colors hover:bg-muted/30 ${isSelected ? "bg-primary/10 border-l-2 border-primary" : ""}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm font-medium ${isNew ? "text-foreground" : "text-muted-foreground"}`}>
                              {inq.senderName}
                            </span>
                            {isNew && (
                              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{inq.message}</p>
                          <p className="text-[11px] text-muted-foreground/60 mt-1">
                            {new Date(inq.createdAt).toLocaleString("de-CH", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </button>
                      );
                    })
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground p-8">
                    <MessageSquare className="w-10 h-10 opacity-20" />
                    <p className="text-sm">Noch keine Nachrichten</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: message detail */}
            <div className="lg:col-span-2 flex flex-col border border-border/50 rounded-xl overflow-hidden">
              {(() => {
                const inq = allInquiries?.find((i: { id: number }) => i.id === selectedInquiryId) as {
                  id: number; senderName: string; senderEmail: string; senderPhone?: string;
                  message: string; status: string; createdAt: string; vehicleId: number;
                } | undefined;

                if (!inq) {
                  return (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                      <MessageSquare className="w-12 h-12 opacity-20" />
                      <p className="text-sm">Wählen Sie eine Nachricht aus</p>
                    </div>
                  );
                }

                const isNew = inq.status === "neu";

                async function markReplied() {
                  try {
                    await updateInquiry({ id: inq!.id, data: { status: "beantwortet" } });
                    await queryClient.invalidateQueries();
                    toast({ description: "Als beantwortet markiert." });
                  } catch {
                    toast({ description: "Fehler beim Aktualisieren.", variant: "destructive" });
                  }
                }

                return (
                  <>
                    {/* Header */}
                    <div className="p-5 border-b border-border/50 flex items-start justify-between gap-4 bg-muted/10">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-base">{inq.senderName}</h3>
                          <Badge variant={isNew ? "default" : "outline"} className="text-xs">
                            {isNew ? "Neu" : "Beantwortet"}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{inq.senderEmail}</span>
                          {inq.senderPhone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{inq.senderPhone}</span>}
                          <span className="flex items-center gap-1"><Car className="w-3 h-3" />Fahrzeug #{inq.vehicleId}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {new Date(inq.createdAt).toLocaleString("de-CH")}
                        </span>
                        {isNew && (
                          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={markReplied}>
                            <CheckCheck className="w-3.5 h-3.5" /> Als beantwortet markieren
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Message bubble */}
                    <div className="flex-1 overflow-y-auto p-6">
                      <div className="flex gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary font-bold text-sm">
                          {inq.senderName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="bg-muted/50 rounded-2xl rounded-tl-none p-4 text-sm leading-relaxed whitespace-pre-wrap max-w-prose">
                            {inq.message}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-2 ml-1">
                            {new Date(inq.createdAt).toLocaleString("de-CH", { weekday: "long", day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Quick reply actions */}
                    <div className="p-4 border-t border-border/50 bg-muted/10 flex items-center gap-2">
                      <Button size="sm" variant="outline" className="gap-1.5"
                        onClick={() => window.open(`mailto:${inq.senderEmail}?subject=Re: Anfrage zu Fahrzeug %23${inq.vehicleId}`, "_blank")}>
                        <Mail className="w-3.5 h-3.5" /> Per E-Mail antworten
                      </Button>
                      {inq.senderPhone && (
                        <Button size="sm" variant="outline" className="gap-1.5"
                          onClick={() => window.open(`tel:${inq.senderPhone}`, "_blank")}>
                          <Phone className="w-3.5 h-3.5" /> Anrufen
                        </Button>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </TabsContent>

        {/* ── Approvals ── */}
        <TabsContent value="approvals">
          <Card>
            <CardHeader><CardTitle>Ausstehende Händler-Freigaben</CardTitle></CardHeader>
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
                      <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 gap-1.5"
                        onClick={() => toast({ description: `${name.split(" – ")[0]} wurde abgelehnt.` })}>
                        <Clock className="w-4 h-4" /> Ablehnen
                      </Button>
                      <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/10 gap-1.5"
                        onClick={() => toast({ description: `${name.split(" – ")[0]} wurde genehmigt.` })}>
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
