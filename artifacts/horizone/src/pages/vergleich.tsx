import { Link } from "wouter";
import { useCompare } from "@/hooks/use-compare";
import { useListVehicles } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, ArrowLeft, Check, Minus } from "lucide-react";
import sedanUrl from "@/assets/car-sedan.png";
import { cn } from "@/lib/utils";

type Vehicle = {
  id: number;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  km: number;
  fuelType: string;
  transmission: string;
  vehicleType: string;
  location: string;
  color?: string | null;
  power?: number | null;
  doors?: number | null;
  seats?: number | null;
  engineSize?: string | null;
  condition: string;
  images: string[];
};

function fmt(n: number, opts?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat("de-CH", opts).format(n);
}

type Winner = "a" | "b" | "tie" | null;

function compare(a: number | null | undefined, b: number | null | undefined, higherIsBetter = true): Winner {
  if (a == null || b == null) return null;
  if (a === b) return "tie";
  return higherIsBetter ? (a > b ? "a" : "b") : (a < b ? "a" : "b");
}

interface RowProps {
  label: string;
  a: string | null | undefined;
  b: string | null | undefined;
  winner?: Winner;
}

function Row({ label, a, b, winner }: RowProps) {
  return (
    <tr className="border-b border-border/40 last:border-0">
      <td className="py-3 px-4 text-sm text-muted-foreground font-medium w-32 bg-muted/20">{label}</td>
      <td className={cn(
        "py-3 px-4 text-sm font-semibold text-center",
        winner === "a" && "text-green-500",
        winner === "b" && "text-muted-foreground"
      )}>
        <div className="flex items-center justify-center gap-1.5">
          {winner === "a" && <Check className="w-3.5 h-3.5 text-green-500" />}
          {a ?? <Minus className="w-3.5 h-3.5 text-muted-foreground/40" />}
        </div>
      </td>
      <td className={cn(
        "py-3 px-4 text-sm font-semibold text-center",
        winner === "b" && "text-green-500",
        winner === "a" && "text-muted-foreground"
      )}>
        <div className="flex items-center justify-center gap-1.5">
          {winner === "b" && <Check className="w-3.5 h-3.5 text-green-500" />}
          {b ?? <Minus className="w-3.5 h-3.5 text-muted-foreground/40" />}
        </div>
      </td>
    </tr>
  );
}

export default function Vergleich() {
  const { compareIds, clearCompare } = useCompare();
  const { data, isLoading } = useListVehicles(
    { limit: 200 },
    { query: { enabled: compareIds.length > 0 } }
  );

  const vehicles = (data?.vehicles?.filter(v => compareIds.includes(v.id)) ?? []) as Vehicle[];
  const a = vehicles[0];
  const b = vehicles[1];

  if (compareIds.length < 2) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center gap-6 text-center">
        <ArrowRightLeft className="w-16 h-16 text-primary/40" />
        <h1 className="text-3xl font-bold">Kein Vergleich ausgewählt</h1>
        <p className="text-muted-foreground max-w-md">
          Wählen Sie zwei Fahrzeuge aus der Liste aus, um sie miteinander zu vergleichen.
          Klicken Sie dazu auf das <strong>⊕</strong>-Symbol auf den Fahrzeugkarten.
        </p>
        <Link href="/fahrzeuge">
          <Button className="bg-primary hover:bg-primary/90 text-white font-bold">
            Fahrzeuge durchsuchen
          </Button>
        </Link>
      </div>
    );
  }

  if (isLoading || !a || !b) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Lade Vergleich…</div>
      </div>
    );
  }

  const priceWinner   = compare(a.price, b.price, false);
  const kmWinner      = compare(a.km, b.km, false);
  const powerWinner   = compare(a.power, b.power, true);
  const yearWinner    = compare(a.year, b.year, true);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 pb-24">
      <div className="flex items-center gap-4">
        <Link href="/fahrzeuge">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Zurück
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold">Fahrzeugvergleich</h1>
        </div>
        <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground" onClick={clearCompare}>
          Vergleich leeren
        </Button>
      </div>

      {/* Car headers + table — horizontally scrollable on mobile */}
      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <div className="min-w-[520px] space-y-4">

          {/* Car header cards */}
          <div className="grid grid-cols-[1fr_1fr_1fr] gap-0 rounded-xl overflow-hidden border border-border/50">
            <div className="bg-muted/30 p-4" />
            {[a, b].map((v, i) => (
              <div key={i} className="bg-card border-l border-border/50 flex flex-col">
                <Link href={`/fahrzeuge/${v.id}`}>
                  <div className="relative aspect-[16/9] overflow-hidden bg-muted cursor-pointer">
                    <img
                      src={v.images?.[0] || sedanUrl}
                      alt={v.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>
                <div className="p-4 flex-1">
                  <Link href={`/fahrzeuge/${v.id}`}>
                    <h2 className="font-bold text-base leading-snug hover:text-primary transition-colors cursor-pointer line-clamp-2">
                      {v.title}
                    </h2>
                  </Link>
                  <p className="text-sm text-muted-foreground mt-0.5">{v.brand} {v.model}</p>
                  <p className="text-xl font-bold text-primary mt-2">
                    {fmt(v.price, { style: "currency", currency: "CHF", maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <table className="w-full">
              <colgroup>
                <col className="w-[30%]" />
                <col className="w-[35%]" />
                <col className="w-[35%]" />
              </colgroup>
              <thead>
                <tr className="bg-muted/40 border-b border-border/50">
                  <th className="py-3 px-4 text-left text-sm font-semibold text-muted-foreground">Merkmal</th>
                  <th className="py-3 px-4 text-center text-sm font-bold">{a.brand} {a.model}</th>
                  <th className="py-3 px-4 text-center text-sm font-bold border-l border-border/40">{b.brand} {b.model}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-muted/10 border-b border-border/40">
                  <td colSpan={3} className="py-2 px-4 text-xs font-bold uppercase tracking-wider text-primary/70">Preis & Allgemein</td>
                </tr>
                <Row label="Preis" a={fmt(a.price, { style: "currency", currency: "CHF", maximumFractionDigits: 0 })} b={fmt(b.price, { style: "currency", currency: "CHF", maximumFractionDigits: 0 })} winner={priceWinner} />
                <Row label="Baujahr" a={String(a.year)} b={String(b.year)} winner={yearWinner} />
                <Row label="Kilometerstand" a={`${fmt(a.km)} km`} b={`${fmt(b.km)} km`} winner={kmWinner} />
                <Row label="Zustand" a={a.condition} b={b.condition} />
                <Row label="Standort" a={a.location} b={b.location} />
                <tr className="bg-muted/10 border-b border-border/40">
                  <td colSpan={3} className="py-2 px-4 text-xs font-bold uppercase tracking-wider text-primary/70">Motor & Antrieb</td>
                </tr>
                <Row label="Kraftstoff" a={a.fuelType} b={b.fuelType} />
                <Row label="Getriebe" a={a.transmission} b={b.transmission} />
                <Row label="Leistung" a={a.power ? `${a.power} PS` : null} b={b.power ? `${b.power} PS` : null} winner={powerWinner} />
                <Row label="Hubraum" a={a.engineSize ?? null} b={b.engineSize ?? null} />
                <tr className="bg-muted/10 border-b border-border/40">
                  <td colSpan={3} className="py-2 px-4 text-xs font-bold uppercase tracking-wider text-primary/70">Karosserie & Ausstattung</td>
                </tr>
                <Row label="Fahrzeugtyp" a={a.vehicleType} b={b.vehicleType} />
                <Row label="Farbe" a={a.color ?? null} b={b.color ?? null} />
                <Row label="Türen" a={a.doors ? String(a.doors) : null} b={b.doors ? String(b.doors) : null} />
                <Row label="Sitze" a={a.seats ? String(a.seats) : null} b={b.seats ? String(b.seats) : null} />
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* Verdict */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[a, b].map((v, i) => {
          const other = i === 0 ? b : a;
          const wins: string[] = [];
          if (v.price < other.price) wins.push("günstigerer Preis");
          if (v.km < other.km) wins.push("weniger Kilometer");
          if ((v.power ?? 0) > (other.power ?? 0)) wins.push("mehr Leistung");
          if (v.year > other.year) wins.push("neueres Baujahr");

          return (
            <div key={i} className="rounded-xl border border-border/50 bg-card p-5">
              <h3 className="font-bold text-base mb-2">{v.brand} {v.model}</h3>
              {wins.length > 0 ? (
                <ul className="space-y-1.5">
                  {wins.map((w, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-green-500">
                      <Check className="w-4 h-4 shrink-0" /> {w}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Kein klarer Vorteil in diesen Kriterien.</p>
              )}
              <Link href={`/fahrzeuge/${v.id}`} className="block mt-4">
                <Button size="sm" variant="outline" className="w-full">Details ansehen</Button>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
