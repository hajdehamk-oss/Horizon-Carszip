import { Link } from "wouter";
import { X, ArrowRightLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompare } from "@/hooks/use-compare";
import { useListVehicles } from "@workspace/api-client-react";

export function CompareBar() {
  const { compareIds, toggleCompare, clearCompare } = useCompare();

  const { data } = useListVehicles(
    { limit: 200 },
    { query: { enabled: compareIds.length > 0 } }
  );

  const vehicles = data?.vehicles?.filter(v => compareIds.includes(v.id)) ?? [];

  if (compareIds.length === 0) return null;

  const ready = compareIds.length === 2;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-primary/40 bg-background/97 backdrop-blur-md shadow-[0_-4px_24px_rgba(0,0,0,0.3)]">
      {/* Mobile layout */}
      <div className="md:hidden px-4 pt-3 pb-4 space-y-2.5">
        {/* Vehicle slots */}
        <div className="flex gap-2">
          {[0, 1].map(i => {
            const v = vehicles[i];
            return (
              <div
                key={i}
                className={`flex-1 flex items-center gap-2 rounded-xl px-3 py-2.5 border ${
                  v ? "bg-primary/10 border-primary/30" : "bg-muted/30 border-dashed border-border"
                }`}
              >
                {v ? (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground leading-none mb-0.5">{v.brand}</p>
                      <p className="text-sm font-semibold truncate leading-tight">{v.model}</p>
                    </div>
                    <button
                      onClick={() => toggleCompare(v.id)}
                      className="shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="flex-1 text-center">
                    <p className="text-xs text-muted-foreground/50 italic">Fahrzeug {i + 1}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearCompare}
            className="gap-1.5 text-muted-foreground border-border/60"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Leeren
          </Button>
          <Link href="/vergleich" className="flex-1">
            <Button
              size="sm"
              disabled={!ready}
              className="w-full gap-2 bg-primary hover:bg-primary/90 text-white font-bold"
            >
              <ArrowRightLeft className="w-4 h-4" />
              {ready ? "Jetzt vergleichen" : "Noch 1 Fahrzeug wählen"}
            </Button>
          </Link>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex container mx-auto px-4 py-3 items-center gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <ArrowRightLeft className="w-5 h-5 text-primary shrink-0" />
          <span className="text-sm font-semibold text-muted-foreground shrink-0">
            Vergleich ({compareIds.length}/2):
          </span>
          <div className="flex gap-3 min-w-0 flex-1">
            {[0, 1].map(i => {
              const v = vehicles[i];
              return (
                <div
                  key={i}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 min-w-[140px] max-w-[220px] border ${
                    v ? "bg-primary/10 border-primary/30" : "bg-muted/40 border-dashed border-border"
                  }`}
                >
                  {v ? (
                    <>
                      <span className="text-sm font-medium truncate flex-1">{v.brand} {v.model}</span>
                      <button
                        onClick={() => toggleCompare(v.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground/40 italic">Fahrzeug {i + 1} wählen</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCompare}
            className="text-muted-foreground hover:text-foreground gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Leeren
          </Button>
          <Link href="/vergleich">
            <Button
              size="sm"
              disabled={!ready}
              className="bg-primary hover:bg-primary/90 text-white font-bold gap-2"
            >
              <ArrowRightLeft className="w-4 h-4" />
              {ready ? "Jetzt vergleichen" : "Noch 1 Fahrzeug wählen"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
