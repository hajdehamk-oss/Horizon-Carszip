import { useEffect, useRef } from "react";
import { Shield, Search, Truck, FileCheck, Star } from "lucide-react";

const sections = [
  {
    icon: Search,
    title: "Fahrzeugsuche",
    text: "Teilen Sie uns einfach Ihre Wünsche bezüglich Marke, Modell, Ausstattung und Budget mit, und wir übernehmen die professionelle Recherche auf dem koreanischen Markt. Dank unserer Erfahrung und unseres Netzwerks finden wir die besten verfügbaren Fahrzeuge.",
  },
  {
    icon: Shield,
    title: "VIN-Prüfung & Transparenz",
    text: "Jedes Fahrzeug wird anhand der Fahrgestellnummer (VIN) überprüft, sodass die Fahrzeughistorie, Wartungsdaten und relevante Informationen transparent nachvollziehbar sind. Dadurch minimieren wir Risiken und schaffen maximale Sicherheit für unsere Kunden.",
  },
  {
    icon: Truck,
    title: "Kompletter Importprozess",
    text: "Nach der Auswahl des Fahrzeugs kümmern wir uns um den gesamten Importprozess – von der Kaufabwicklung über den internationalen Transport bis hin zur Zollabfertigung und den notwendigen Importformalitäten. Sie erhalten eine schlüsselfertige Lösung.",
  },
  {
    icon: FileCheck,
    title: "MFK-Vorbereitung",
    text: "Auf Wunsch bieten wir zusätzlich die Vorbereitung und Durchführung der MFK-Kontrolle an, damit Ihr Fahrzeug schnell und unkompliziert für den Schweizer Straßenverkehr zugelassen werden kann.",
  },
  {
    icon: Star,
    title: "Persönliche Betreuung",
    text: "Unser Ziel ist es, unseren Kunden den Zugang zu attraktiven Fahrzeugen aus Südkorea so einfach, sicher und transparent wie möglich zu gestalten – mit persönlicher Betreuung und höchstem Qualitätsanspruch während des gesamten Prozesses.",
  },
];

function AnimatedSection({ icon: Icon, title, text, index }: {
  icon: typeof Search;
  title: string;
  text: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("opacity-100", "translate-y-0");
          el.classList.remove("opacity-0", "translate-y-8");
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="opacity-0 translate-y-8 transition-all duration-700 ease-out"
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="flex gap-5 items-start group">
        <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-1.5">{title}</h3>
          <p className="text-muted-foreground leading-relaxed">{text}</p>
        </div>
      </div>
    </div>
  );
}

export default function UeberUns() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.classList.add("opacity-100", "translate-y-0");
      el.classList.remove("opacity-0", "translate-y-6");
    });
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-transparent py-24 md:py-32">
        <div className="container">
          <div
            ref={heroRef}
            className="opacity-0 translate-y-6 transition-all duration-700 ease-out max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest mb-6">
              🇰🇷 Import aus Südkorea
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-6">
              Ihr zuverlässiger Partner für den{" "}
              <span className="text-primary">Fahrzeugimport</span> aus Südkorea
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Wir sind spezialisiert auf die Beschaffung und den Import hochwertiger
              Fahrzeuge aus Südkorea und bieten unseren Kunden einen umfassenden
              Rundum-Service aus einer Hand.
            </p>
          </div>
        </div>

        {/* decorative blob */}
        <div
          className="pointer-events-none absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)" }}
        />
      </section>

      {/* Process steps */}
      <section className="py-20 md:py-28">
        <div className="container max-w-3xl">
          <div className="flex flex-col gap-10 divide-y divide-border/40">
            {sections.map((s, i) => (
              <div key={s.title} className={i === 0 ? "" : "pt-10"}>
                <AnimatedSection {...s} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="border-t border-border/40 bg-card py-16">
        <div className="container text-center max-w-xl">
          <h2 className="text-2xl font-bold mb-3">Bereit für Ihr Traumfahrzeug?</h2>
          <p className="text-muted-foreground mb-6">
            Kontaktieren Sie uns noch heute und wir starten gemeinsam die Suche auf dem koreanischen Markt.
          </p>
          <a
            href="/fahrzeuge"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Fahrzeuge entdecken
          </a>
        </div>
      </section>
    </div>
  );
}
