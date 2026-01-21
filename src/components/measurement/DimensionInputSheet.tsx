import { useState, useEffect, useCallback } from 'react';
import { Box3D, BOX_COLORS } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface DimensionInputSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  box: Box3D | null;
  onSave: (dimensions: { width: number; height: number; depth: number }, label: string, color: string, notes: string) => void;
}

export function DimensionInputSheet({
  open,
  onOpenChange,
  box,
  onSave,
}: DimensionInputSheetProps) {
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [depth, setDepth] = useState('');
  const [label, setLabel] = useState('');
  const [color, setColor] = useState(BOX_COLORS[0].name);
  const [notes, setNotes] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Inicialitzar només quan s'obre la finestra
  useEffect(() => {
    if (open && box && !isInitialized) {
      setWidth(box.dimensions.width > 0 ? String(box.dimensions.width) : '');
      setHeight(box.dimensions.height > 0 ? String(box.dimensions.height) : '');
      setDepth(box.dimensions.depth > 0 ? String(box.dimensions.depth) : '');
      setLabel(box.label);
      setColor(box.color);
      setNotes(box.notes || '');
      setIsInitialized(true);
    } else if (!open) {
      setIsInitialized(false);
    }
  }, [open, box, isInitialized]);

  const handleSave = useCallback(() => {
    onSave(
      {
        width: parseFloat(width) || 0,
        height: parseFloat(height) || 0,
        depth: parseFloat(depth) || 0,
      },
      label,
      color,
      notes
    );
    onOpenChange(false);
  }, [width, height, depth, label, color, notes, onSave, onOpenChange]);

  // Si no hi ha box, no renderitzar res
  if (!box) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-auto max-h-[90vh] rounded-t-3xl px-4 sm:px-6 pb-6 overflow-y-auto will-change-transform"
      >
        <SheetHeader className="text-left pb-4 pt-2">
          <SheetTitle className="font-display text-xl">Editar mesura</SheetTitle>
          <SheetDescription className="text-sm">
            Introdueix les dimensions reals i informació d'aquest objecte
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="label" className="text-base font-medium">Etiqueta (opcional)</Label>
            <Input
              id="label"
              placeholder="p. ex., Armari, Moble TV"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium">Dimensions (cm)</Label>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="width" className="text-xs text-muted-foreground">Amplada</Label>
                <Input
                  id="width"
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="text-center text-lg font-semibold h-14"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height" className="text-xs text-muted-foreground">Alçada</Label>
                <Input
                  id="height"
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="text-center text-lg font-semibold h-14"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="depth" className="text-xs text-muted-foreground">Fondària</Label>
                <Input
                  id="depth"
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                  className="text-center text-lg font-semibold h-14"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-base font-medium">Notes/Anotacions (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Afegeix informació addicional sobre aquest objecte..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px] text-base resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium">Color de la caixa</Label>
            <div className="flex gap-3 flex-wrap justify-center">
              {BOX_COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.name)}
                  className={cn(
                    'w-12 h-12 rounded-full transition-all',
                    color === c.name ? 'ring-4 ring-offset-2 ring-foreground scale-110' : 'hover:scale-105'
                  )}
                  style={{ backgroundColor: c.value }}
                  aria-label={c.name}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 h-12 text-base"
              onClick={() => onOpenChange(false)}
            >
              Cancel·lar
            </Button>
            <Button 
              variant="hero" 
              className="flex-1 h-12 text-base font-semibold" 
              onClick={handleSave}
            >
              Desar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
