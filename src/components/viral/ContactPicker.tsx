import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, Trash2, Smartphone } from "lucide-react";
import { toast } from "sonner";

export interface ContactEntry {
  name: string;
  phone: string;
}

interface ContactPickerProps {
  contacts: ContactEntry[];
  onChange: (contacts: ContactEntry[]) => void;
  max?: number;
  min?: number;
}

/**
 * ContactPicker — uses the Contact Picker API on supported browsers (Android Chrome)
 * with fallback to manual entry for iOS/desktop.
 * Phase 1: Reduces friction from manual phone entry → tap-to-select.
 */
export default function ContactPicker({
  contacts,
  onChange,
  max = 10,
  min = 3,
}: ContactPickerProps) {
  const [isPickerSupported] = useState(() => "contacts" in navigator && "ContactsManager" in window);

  const handleNativePicker = async () => {
    try {
      const supported = await (navigator as any).contacts.getProperties();
      const props = ["name", "tel"].filter((p) => supported.includes(p));

      const results = await (navigator as any).contacts.select(props, { multiple: true });

      const newContacts: ContactEntry[] = results
        .filter((c: any) => c.name?.[0] && c.tel?.[0])
        .map((c: any) => ({
          name: c.name[0],
          phone: c.tel[0],
        }));

      if (newContacts.length > 0) {
        const merged = [...contacts, ...newContacts].slice(0, max);
        onChange(merged);
        toast.success(`${newContacts.length} contacto(s) agregado(s)`);
      }
    } catch (err) {
      // User cancelled or API error
      console.log("Contact picker cancelled or failed:", err);
    }
  };

  const addManualContact = () => {
    if (contacts.length < max) {
      onChange([...contacts, { name: "", phone: "" }]);
    }
  };

  const updateContact = (idx: number, field: keyof ContactEntry, value: string) => {
    const updated = [...contacts];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange(updated);
  };

  const removeContact = (idx: number) => {
    if (contacts.length > 1) {
      onChange(contacts.filter((_, i) => i !== idx));
    }
  };

  return (
    <div className="space-y-3">
      {/* Native picker button (Android Chrome) */}
      {isPickerSupported && (
        <Button
          type="button"
          variant="outline"
          onClick={handleNativePicker}
          className="w-full h-12 rounded-xl text-sm gap-2 border-primary/30 text-primary hover:bg-primary/5"
        >
          <Smartphone className="w-4 h-4" />
          Seleccionar de Contactos
        </Button>
      )}

      {/* Contact list */}
      {contacts.map((contact, idx) => (
        <div
          key={idx}
          className="bg-card border border-border/40 rounded-xl p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold text-foreground">
                Nominado {idx + 1}
              </span>
            </div>
            {contacts.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={() => removeContact(idx)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Nombre"
              value={contact.name}
              onChange={(e) => updateContact(idx, "name", e.target.value)}
              className="h-9 text-sm rounded-lg"
              maxLength={50}
            />
            <Input
              placeholder="+1 (555) 123-4567"
              value={contact.phone}
              onChange={(e) => updateContact(idx, "phone", e.target.value)}
              className="h-9 text-sm rounded-lg"
              type="tel"
              maxLength={20}
            />
          </div>
        </div>
      ))}

      {/* Add more */}
      {contacts.length < max && (
        <Button
          variant="outline"
          onClick={addManualContact}
          className="w-full h-9 rounded-xl text-xs gap-2 border-dashed"
        >
          <Plus className="w-3.5 h-3.5" />
          Agregar nominado ({contacts.length}/{max})
        </Button>
      )}

      {contacts.length < min && (
        <p className="text-[10px] text-muted-foreground text-center">
          Nomina al menos {min} amigos para completar el challenge
        </p>
      )}
    </div>
  );
}
