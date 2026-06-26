import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useClientAuth, getClientToken } from "@/hooks/use-client-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Car, LogOut, CheckCircle2, Clock, Hourglass, XCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ORDER_STEPS = [
  { label: "Bestellung\neingegangen", icon: "📋" },
  { label: "Wird\nbearbeitet", icon: "⚙️" },
  { label: "Unterwegs", icon: "🚚" },
  { label: "Im Hafen", icon: "⚓" },
  { label: "Zugestellt", icon: "🏁" },
];

function ProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="w-full py-6">
      <div className="relative flex items-start justify-between">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-700"
          style={{ width: currentStep === 0 ? "0%" : `${(currentStep / (ORDER_STEPS.length - 1)) * 100}%` }}
        />
        {ORDER_STEPS.map((step, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <div key={i} className="relative flex flex-col items-center gap-2 flex-1">
              <div className={`
                relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all duration-500
                ${done ? "bg-primary border-primary text-primary-foreground" : ""}
                ${active ? "bg-primary/10 border-primary scale-110 shadow-lg shadow-primary/20" : ""}
                ${!done && !active ? "bg-background border-border text-muted-foreground" : ""}
              `}>
                {done ? <CheckCircle2 className="w-5 h-5 text-primary-foreground" /> : <span>{step.icon}</span>}
              </div>
              <span className={`text-center text-xs leading-tight whitespace-pre-line font-medium transition-colors ${active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface Order {
  id: number;
  currentStep: number;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  vehicleId: number;
  vehicleTitle: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleImages: string[];
  vehiclePrice: number;
}

const POLL_INTERVAL = 4000;

export default function MeineBestellungen() {
  const [, navigate] = useLocation();
  const { user, isLoggedIn, logout } = useClientAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [syncing, setSyncing] = useState(false);
  const prevOrdersRef = useRef<Order[]>([]);

  async function fetchOrders(silent = false) {
    if (!silent) setSyncing(true);
    const token = getClientToken();
    try {
      const res = await fetch("/api/orders/mine", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      const fresh: Order[] = Array.isArray(data) ? data : [];

      // Detect changes and notify
      const prev = prevOrdersRef.current;
      fresh.forEach(order => {
        const old = prev.find(o => o.id === order.id);
        if (!old) return;
        if (old.status === "pending" && order.status === "active") {
          toast({ title: "✅ Bestellung bestätigt!", description: `Ihre Anfrage für ${order.vehicleTitle} wurde angenommen.` });
        } else if (old.status === "pending" && order.status === "rejected") {
          toast({ title: "❌ Anfrage abgelehnt", description: `Ihre Anfrage für ${order.vehicleTitle} wurde leider abgelehnt.`, variant: "destructive" });
        } else if (old.currentStep !== order.currentStep && order.status === "active") {
          const stepLabel = ORDER_STEPS[order.currentStep]?.label.replace("\n", " ") ?? "";
          toast({ title: "🚗 Status aktualisiert", description: `${order.vehicleTitle}: ${stepLabel}` });
        }
      });

      prevOrdersRef.current = fresh;
      setOrders(fresh);
      setLastUpdate(new Date());
    } catch {
      if (!silent) toast({ title: "Fehler", description: "Bestellungen konnten nicht geladen werden", variant: "destructive" });
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }

  useEffect(() => {
    if (!isLoggedIn) { navigate("/login"); return; }
    fetchOrders();
    const interval = setInterval(() => fetchOrders(true), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  function handleLogout() {
    logout();
    navigate("/");
    toast({ title: "Abgemeldet", description: "Sie wurden erfolgreich abgemeldet" });
  }

  if (!isLoggedIn) return null;

  const pendingOrders = orders.filter(o => o.status === "pending");
  const activeOrders = orders.filter(o => o.status !== "pending" && o.status !== "rejected");
  const rejectedOrders = orders.filter(o => o.status === "rejected");

  return (
    <div className="container py-8 max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Meine Bestellungen</h1>
            <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Live
            </span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground text-sm">Willkommen, {user?.name}</p>
            {lastUpdate && (
              <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                <RefreshCw className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} />
                {lastUpdate.toLocaleTimeString("de-CH", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            )}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
          <LogOut className="w-4 h-4" />
          Abmelden
        </Button>
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2].map(i => <Skeleton key={i} className="h-56 rounded-xl" />)}
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="py-20 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Car className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Noch keine Bestellungen</p>
            <p className="text-sm text-muted-foreground">Klicken Sie auf "Jetzt vorbestellen" auf einer Fahrzeugseite, um eine Anfrage zu stellen.</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/fahrzeuge")}>Fahrzeuge entdecken</Button>
        </div>
      )}

      {/* Pending orders */}
      {pendingOrders.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Hourglass className="w-4 h-4 text-amber-500" />
            <h2 className="font-semibold text-sm">Warte auf Bestätigung</h2>
            <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">{pendingOrders.length}</Badge>
          </div>
          {pendingOrders.map(order => (
            <PendingCard key={order.id} order={order} />
          ))}
        </div>
      )}

      {/* Active orders with progress */}
      {activeOrders.length > 0 && (
        <div className="space-y-4">
          {pendingOrders.length > 0 && (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm">Aktive Bestellungen</h2>
            </div>
          )}
          {activeOrders.map(order => (
            <ActiveCard key={order.id} order={order} />
          ))}
        </div>
      )}

      {/* Rejected orders */}
      {rejectedOrders.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-destructive" />
            <h2 className="font-semibold text-sm text-muted-foreground">Abgelehnte Anfragen</h2>
          </div>
          {rejectedOrders.map(order => (
            <PendingCard key={order.id} order={order} rejected />
          ))}
        </div>
      )}
    </div>
  );
}

function PendingCard({ order, rejected }: { order: Order; rejected?: boolean }) {
  const image = order.vehicleImages?.[0];
  return (
    <div className={`rounded-xl border bg-card overflow-hidden ${rejected ? "border-destructive/30 opacity-60" : "border-amber-300/40 bg-amber-500/5"}`}>
      <div className="flex items-center gap-4 p-4">
        <div className="w-16 h-12 rounded-lg bg-muted overflow-hidden shrink-0 flex items-center justify-center">
          {image ? <img src={image} alt={order.vehicleTitle} className="w-full h-full object-cover" /> : <Car className="w-6 h-6 text-muted-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{order.vehicleTitle}</h3>
          <p className="text-xs text-muted-foreground">{order.vehicleBrand} {order.vehicleModel} · {order.vehicleYear}</p>
          {order.notes && <p className="text-xs text-muted-foreground mt-1 italic">„{order.notes}"</p>}
        </div>
        <Badge variant={rejected ? "destructive" : "outline"} className={`shrink-0 gap-1 ${!rejected ? "text-amber-600 border-amber-400" : ""}`}>
          {rejected ? <><XCircle className="w-3 h-3" /> Abgelehnt</> : <><Hourglass className="w-3 h-3" /> Ausstehend</>}
        </Badge>
      </div>
      <div className="px-4 pb-3 text-xs text-muted-foreground">
        {rejected
          ? "Ihre Anfrage wurde leider abgelehnt."
          : "Ihr Händler prüft Ihre Anfrage und bestätigt sie in Kürze."}
      </div>
    </div>
  );
}

function ActiveCard({ order }: { order: Order }) {
  const step = ORDER_STEPS[order.currentStep] ?? ORDER_STEPS[0];
  const isDelivered = order.currentStep >= ORDER_STEPS.length - 1;
  const image = order.vehicleImages?.[0];

  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      <div className="flex items-center gap-4 p-4 border-b border-border/50">
        <div className="w-20 h-14 rounded-lg bg-muted overflow-hidden shrink-0 flex items-center justify-center">
          {image ? <img src={image} alt={order.vehicleTitle} className="w-full h-full object-cover" /> : <Car className="w-7 h-7 text-muted-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{order.vehicleTitle}</h3>
          <p className="text-sm text-muted-foreground">{order.vehicleBrand} {order.vehicleModel} · {order.vehicleYear}</p>
        </div>
        <div className="text-right shrink-0">
          <Badge variant={isDelivered ? "default" : "secondary"} className="gap-1">
            {isDelivered ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
            {step.label.replace("\n", " ")}
          </Badge>
          <p className="text-xs text-muted-foreground mt-1">Bestellung #{order.id}</p>
        </div>
      </div>
      <div className="px-6">
        <ProgressBar currentStep={order.currentStep} />
      </div>
      {order.notes && (
        <div className="mx-4 mb-4 px-4 py-3 rounded-lg bg-muted/40 border border-border/40">
          <p className="text-xs font-medium text-muted-foreground mb-0.5">Notiz vom Händler</p>
          <p className="text-sm">{order.notes}</p>
        </div>
      )}
      <div className="px-4 pb-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>Bestellt am {new Date(order.createdAt).toLocaleDateString("de-CH")}</span>
        <span>Zuletzt aktualisiert: {new Date(order.updatedAt).toLocaleDateString("de-CH")}</span>
      </div>
    </div>
  );
}
