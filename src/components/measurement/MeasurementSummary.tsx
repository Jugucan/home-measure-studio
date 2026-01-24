import { Box3D, BOX_COLORS } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Eye, EyeOff } from 'lucide-react';

interface MeasurementSummaryProps {
  boxes: Box3D[];
  onSelectBox: (boxId: string) => void;
  onDeleteBox: (boxId: string) => void;
  onToggleVisibility: (boxId: string) => void;
  selectedBoxId: string | null;
}

export function MeasurementSummary({
  boxes,
  onSelectBox,
  onDeleteBox,
  onToggleVisibility,
  selectedBoxId,
}: MeasurementSummaryProps) {
  if (boxes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Encara no hi ha mides. Afegeix un cub per començar a mesurar.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {boxes.map((box, index) => {
        const colorInfo = BOX_COLORS.find(c => c.name === box.color) || BOX_COLORS[0];
        const isSelected = box.id === selectedBoxId;
        const isVisible = box.visible !== false; // Per defecte visible
        const hasDimensions = box.dimensions.width > 0 || box.dimensions.height > 0 || box.dimensions.depth > 0;

        return (
          <Card
            key={box.id}
            className={`cursor-pointer transition-all duration-200 border-2 ${
              isSelected ? 'ring-2 ring-primary shadow-elevated' : 'hover:shadow-soft'
            } ${!isVisible ? 'opacity-50' : ''}`}
            style={{ borderColor: colorInfo.value }}
            onClick={() => onSelectBox(box.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
                    style={{ backgroundColor: colorInfo.value }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-foreground mb-1">
                      {box.label || `Cub ${index + 1}`}
                    </h4>
                    {hasDimensions ? (
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">{box.dimensions.width || '—'}</span>
                        <span className="text-xs mx-1">(ample) ×</span>
                        <span className="font-medium">{box.dimensions.height || '—'}</span>
                        <span className="text-xs mx-1">(alt) ×</span>
                        <span className="font-medium">{box.dimensions.depth || '—'}</span>
                        <span className="text-xs ml-1">(fons) cm</span>
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Sense dimensions
                      </p>
                    )}
                    {box.notes && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {box.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisibility(box.id);
                    }}
                    title={isVisible ? 'Amagar cub' : 'Mostrar cub'}
                  >
                    {isVisible ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteBox(box.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
