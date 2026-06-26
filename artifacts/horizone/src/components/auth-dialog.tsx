import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car, Loader2 } from "lucide-react";
import { useClientAuth, type ClientUser } from "@/hooks/use-client-auth";
import { useToast } from "@/hooks/use-toast";

interface AuthDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (token: string, user: ClientUser) => void;
  defaultTab?: "login" | "register";
  title?: string;
  description?: string;
}

export function AuthDialog({ open, onClose, onSuccess, defaultTab = "register", title, description }: AuthDialogProps) {
  const { login } = useClientAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regCity, setRegCity] = useState("");

  function reset() {
    setLoginEmail(""); setLoginPassword("");
    setRegName(""); setRegEmail(""); setRegPassword(""); setRegPhone(""); setRegCity("");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) { toast({ title: "Fehler", description: data.error, variant: "destructive" }); return; }
      login(data.token, data.user);
      toast({ title: `Willkommen, ${data.user.name}!` });
      reset();
      onSuccess?.(data.token, data.user);
      onClose();
    } finally { setLoading(false); }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword, phone: regPhone || undefined, city: regCity || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { toast({ title: "Fehler", description: data.error, variant: "destructive" }); return; }
      login(data.token, data.user);
      toast({ title: `Willkommen bei Horizone, ${data.user.name}!` });
      reset();
      onSuccess?.(data.token, data.user);
      onClose();
    } finally { setLoading(false); }
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) { reset(); onClose(); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Car className="w-4 h-4 text-primary" />
            </div>
            <DialogTitle>{title ?? "Anmelden oder registrieren"}</DialogTitle>
          </div>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <Tabs defaultValue={defaultTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Anmelden</TabsTrigger>
            <TabsTrigger value="register">Konto erstellen</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-4">
            <form onSubmit={handleLogin} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="auth-login-email">E-Mail</Label>
                <Input id="auth-login-email" type="email" placeholder="ihre@email.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="auth-login-pw">Passwort</Label>
                <Input id="auth-login-pw" type="password" placeholder="••••••••" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required autoComplete="current-password" />
              </div>
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Anmelden
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="mt-4">
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="auth-reg-name">Vollständiger Name</Label>
                <Input id="auth-reg-name" placeholder="Max Mustermann" value={regName} onChange={e => setRegName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="auth-reg-email">E-Mail</Label>
                <Input id="auth-reg-email" type="email" placeholder="ihre@email.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="auth-reg-pw">Passwort</Label>
                <Input id="auth-reg-pw" type="password" placeholder="Mindestens 6 Zeichen" minLength={6} value={regPassword} onChange={e => setRegPassword(e.target.value)} required autoComplete="new-password" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="auth-reg-phone">Telefonnummer</Label>
                <Input id="auth-reg-phone" placeholder="+41 79 000 00 00" value={regPhone} onChange={e => setRegPhone(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="auth-reg-city">Stadt <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input id="auth-reg-city" placeholder="Zürich" value={regCity} onChange={e => setRegCity(e.target.value)} />
              </div>
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Konto erstellen &amp; fortfahren
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
