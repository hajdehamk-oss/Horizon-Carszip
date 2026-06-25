import { useState } from "react";
import { useLocation } from "wouter";
import { useClientAuth } from "@/hooks/use-client-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Car, Loader2 } from "lucide-react";

export default function ClientLogin() {
  const [, navigate] = useLocation();
  const { login, isLoggedIn } = useClientAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regCity, setRegCity] = useState("");

  if (isLoggedIn) {
    navigate("/meine-bestellungen");
    return null;
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
      toast({ title: "Willkommen zurück!", description: `Hallo ${data.user.name}` });
      navigate("/meine-bestellungen");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword, phone: regPhone, city: regCity }),
      });
      const data = await res.json();
      if (!res.ok) { toast({ title: "Fehler", description: data.error, variant: "destructive" }); return; }
      login(data.token, data.user);
      toast({ title: "Konto erstellt!", description: `Willkommen bei Horizone, ${data.user.name}!` });
      navigate("/meine-bestellungen");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Car className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Kunden-Portal</h1>
          <p className="text-muted-foreground text-sm text-center">
            Verfolgen Sie Ihre Fahrzeugbestellung in Echtzeit
          </p>
        </div>

        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Anmelden</TabsTrigger>
            <TabsTrigger value="register">Registrieren</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Anmelden</CardTitle>
                <CardDescription>Melden Sie sich an, um Ihre Bestellungen zu verfolgen</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">E-Mail</Label>
                    <Input id="login-email" type="email" placeholder="ihre@email.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Passwort</Label>
                    <Input id="login-password" type="password" placeholder="••••••••" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Anmelden
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Konto erstellen</CardTitle>
                <CardDescription>Erstellen Sie ein Konto, um Ihre Bestellungen zu verfolgen</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Vollständiger Name</Label>
                    <Input id="reg-name" placeholder="Max Mustermann" value={regName} onChange={e => setRegName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">E-Mail</Label>
                    <Input id="reg-email" type="email" placeholder="ihre@email.com" value={regEmail} onChange={e => setRegEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Passwort</Label>
                    <Input id="reg-password" type="password" placeholder="Mindestens 6 Zeichen" minLength={6} value={regPassword} onChange={e => setRegPassword(e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="reg-phone">Telefon (optional)</Label>
                      <Input id="reg-phone" placeholder="+41 79 000 00 00" value={regPhone} onChange={e => setRegPhone(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-city">Stadt (optional)</Label>
                      <Input id="reg-city" placeholder="Zürich" value={regCity} onChange={e => setRegCity(e.target.value)} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Konto erstellen
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
