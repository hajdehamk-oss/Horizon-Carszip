import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useClientAuth, getClientToken } from "@/hooks/use-client-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Car, LogOut, CheckCircle2, Circle, Clock } from "lucide-react";
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
        {/* connecting line */}
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

export default function MeineBestellungen() {
  const [, navigate] = useLocation();
  const { user, isLoggedIn, logout } = useClientAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { navigate("/login"); return; }
    const token = getClientToken();
    fetch("/api/orders/mine", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); })
      .catch(() => toast({ title: "Fehler", description: "Bestellungen konnten nicht geladen werden", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  function handleLogout() {
    logout();
    navigate("/");
    toast({ title: "Abgemeldet", description: "Sie wurden erfolgreich abgemeldet" });
  }

  if (!isLoggedIn) return null;

  return (
    <div className="container py-8 max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meine Bestellungen</h1>
          <p className="text-muted-foreground text-sm">Willkommen, {user?.name}</p>
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
            <p className="text-sm text-muted-foreground">Ihr Händler erstellt eine Bestellung für Sie, sobald Sie ein Fahrzeug gekauft haben.</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/fahrzeuge")}>Fahrzeuge entdecken</Button>
        </div>
      )}

      {!loading && orders.map(order => {
        const step = ORDER_STEPS[order.currentStep] ?? ORDER_STEPS[0];
        const isDelivered = order.currentStep >= ORDER_STEPS.length - 1;
        const image = order.vehicleImages?.[0];

        return (
          <div key={order.id} className="rounded-xl border border-border/50 bg-card overflow-hidden">
            <div className="flex items-center gap-4 p-4 border-b border-border/50">
              <div className="w-20 h-14 rounded-lg bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                {image
                  ? <img src={image} alt={order.vehicleTitle} className="w-full h-full object-cover" />
                  : <Car className="w-7 h-7 text-muted-foreground" />
                }
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
                <p className="text-xs text-muted-foreground mt-1">
                  Bestellung #{order.id}
                </p>
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
              <span className="flex items-center gap-1">
                <Circle className="w-2 h-2 fill-primary text-primary" />
                Bestellt am {new Date(order.createdAt).toLocaleDateString("de-CH")}
              </span>
              <span>Zuletzt aktualisiert: {new Date(order.updatedAt).toLocaleDateString("de-CH")}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
