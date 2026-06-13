import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";

interface VisitorNameDialogProps {
  open: boolean;
  onSave: (name: string) => void;
}

export function VisitorNameDialog({ open, onSave }: VisitorNameDialogProps) {
  const [name, setName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) onSave(trimmed);
  }

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="items-center text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3 mx-auto">
            <Car className="w-7 h-7 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold">Willkommen bei HORIZONE</DialogTitle>
          <DialogDescription className="text-base mt-1">
            Wie dürfen wir Sie ansprechen? Mit Ihrem Namen speichern wir Ihre Fahrzeuge und Nachrichten für Sie.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <Input
            autoFocus
            placeholder="Ihr Name (z.B. Luca Müller)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 text-base"
          />
          <Button
            type="submit"
            className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-white"
            disabled={!name.trim()}
          >
            Weiter
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
