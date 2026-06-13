import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, MessageSquare, Loader2 } from "lucide-react";
import { useVisitorProfile } from "@/hooks/use-visitor-profile";
import { useToast } from "@/hooks/use-toast";
import { useCreateInquiry } from "@workspace/api-client-react";

interface ContactDialogProps {
  open: boolean;
  onClose: () => void;
  vehicleTitle: string;
  vehicleLocation: string;
  vehicleId: number;
  dealerId?: number | null;
}

export function ContactDialog({ open, onClose, vehicleTitle, vehicleLocation, vehicleId, dealerId }: ContactDialogProps) {
  const { profile, loaded, updateProfile } = useVisitorProfile();
  const { toast } = useToast();
  const { mutateAsync: createInquiry, isPending } = useCreateInquiry();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (loaded && open) {
      setName(profile?.name || "");
      setEmail(profile?.email || "");
      setPhone(profile?.phone || "");
      setMessage(`Guten Tag,\n\nIch interessiere mich für Ihr Inserat „${vehicleTitle}". Bitte kontaktieren Sie mich für weitere Informationen.`);
      setSent(false);
    }
  }, [loaded, open, profile, vehicleTitle]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    try {
      await createInquiry({
        data: {
          vehicleId,
          dealerId: dealerId ?? undefined,
          senderName: name.trim(),
          senderEmail: email.trim(),
          senderPhone: phone.trim() || undefined,
          message: message.trim(),
          status: "neu",
        },
      });

      updateProfile({ name, email, phone });
      setSent(true);
      toast({
        title: "Nachricht gesendet ✓",
        description: `Der Händler aus ${vehicleLocation} meldet sich bald bei Ihnen.`,
      });
      setTimeout(() => {
        setSent(false);
        onClose();
      }, 2000);
    } catch {
      toast({
        title: "Fehler beim Senden",
        description: "Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    }
  }

  const canSubmit = name.trim() && email.trim() && message.trim();

  if (sent) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md text-center py-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <Check className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <DialogTitle className="text-xl">Nachricht gesendet!</DialogTitle>
          <DialogDescription>Der Händler meldet sich in Kürze bei Ihnen.</DialogDescription>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-5 h-5 text-primary" />
            <DialogTitle>Händler kontaktieren</DialogTitle>
          </div>
          <DialogDescription>
            Für weitere Informationen zu <span className="font-medium text-foreground">{vehicleTitle}</span> hinterlassen Sie bitte Ihre Kontaktdaten.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="contact-name">Ihr Name *</Label>
            <Input
              id="contact-name"
              placeholder="Luca Müller"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="contact-email">E-Mail *</Label>
              <Input
                id="contact-email"
                type="email"
                placeholder="luca@example.ch"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-phone">Telefon</Label>
              <Input
                id="contact-phone"
                type="tel"
                placeholder="+41 79 123 45 67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contact-message">Nachricht *</Label>
            <Textarea
              id="contact-message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Abbrechen
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold"
              disabled={!canSubmit || isPending}
            >
              {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Nachricht senden
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
