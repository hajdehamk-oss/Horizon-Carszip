import { Link } from "wouter";
import { X, ArrowRightLeft } from "lucide-react";
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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-primary/30 bg-background/95 backdrop-blur-md shadow-2xl">
      <div className="container mx-auto px-4 py-3 flex items-center gap-4">
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
                  className="flex items-center gap-2 bg-muted/60 rounded-lg px-3 py-1.5 min-w-[140px] max-w-[220px]"
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
                    <span className="text-sm text-muted-foreground/50 italic">Fahrzeug {i + 1} wählen</span>
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
            className="text-muted-foreground hover:text-foreground"
          >
            Leeren
          </Button>
          <Link href="/vergleich">
            <Button
              size="sm"
              disabled={compareIds.length < 2}
              className="bg-primary hover:bg-primary/90 text-white font-bold"
            >
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Jetzt vergleichen
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
