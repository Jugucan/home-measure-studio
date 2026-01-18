import { useState } from 'react';
import { SPACE_ICONS } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface CreateSpaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, icon: string) => void;
  initialData?: { name: string; icon: string };
  mode?: 'create' | 'edit';
}

export function CreateSpaceDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode = 'create',
}: CreateSpaceDialogProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [selectedIcon, setSelectedIcon] = useState(initialData?.icon || SPACE_ICONS[0].icon);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), selectedIcon);
      setName('');
      setSelectedIcon(SPACE_ICONS[0].icon);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            {mode === 'create' ? 'Crear nou espai' : 'Editar espai'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Afegeix una nova habitació o àrea per organitzar les teves mesures.'
              : 'Actualitza el nom i la icona de l\'espai.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="spaceName">Nom de l'espai</Label>
            <Input
              id="spaceName"
              placeholder="p. ex., Cuina, Habitació principal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Icona</Label>
            <div className="grid grid-cols-5 gap-2">
              {SPACE_ICONS.map(({ name: iconName, icon }) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={cn(
                    'aspect-square rounded-lg flex items-center justify-center text-2xl transition-all',
                    selectedIcon === icon
                      ? 'bg-primary/10 ring-2 ring-primary'
                      : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel·lar
            </Button>
            <Button type="submit" variant="hero" disabled={!name.trim()}>
              {mode === 'create' ? 'Crear espai' : 'Desar canvis'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
