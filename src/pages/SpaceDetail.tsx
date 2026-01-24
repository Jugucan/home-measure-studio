import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Camera, Upload, Trash2, ChevronDown, Pencil } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { AppHeader } from '@/components/layout/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DeleteConfirmDialog } from '@/components/spaces/DeleteConfirmDialog';
import { Box3DEditor, createDefaultBox3D } from '@/components/measurement/Box3DEditor';
import { MeasurementSummary } from '@/components/measurement/MeasurementSummary';
import { DimensionInputSheet } from '@/components/measurement/DimensionInputSheet';
import { Measurement, Box3D, Vertex } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function SpaceDetail() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const navigate = useNavigate();
  const { spaces, user, getSpace, addMeasurement, updateMeasurement, deleteMeasurement, addBox, updateBox, deleteBox } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Utilitzar directament l'space dels spaces per tenir sempre les dades actualitzades
  const space = spaces.find(s => s.id === spaceId);
  
  const [selectedMeasurementId, setSelectedMeasurementId] = useState<string | null>(null);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [dimensionSheetOpen, setDimensionSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [measurementToDelete, setMeasurementToDelete] = useState<Measurement | null>(null);
  const [boxToDelete, setBoxToDelete] = useState<string | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [imageSize, setImageSize] = useState({ width: 800, height: 600 });

  // Obtenir el measurement seleccionat
  const selectedMeasurement = space?.measurements.find(m => m.id === selectedMeasurementId) || null;

  // Seleccionar automàticament el primer measurement si n'hi ha
  useEffect(() => {
    if (space && space.measurements.length > 0 && !selectedMeasurementId) {
      setSelectedMeasurementId(space.measurements[0].id);
    }
  }, [space?.measurements.length]);

  // Carregar la mida de la imatge
  useEffect(() => {
    if (selectedMeasurement?.photoBase64) {
      const img = new Image();
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height });
      };
      img.src = selectedMeasurement.photoBase64;
    }
  }, [selectedMeasurement?.photoBase64]);

  if (!space) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <p className="text-muted-foreground">No s'ha trobat l'espai</p>
      </div>
    );
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file && spaceId) {
    try {
      // Importar la funció de Cloudinary
      const { uploadImageToCloudinary } = await import('@/lib/cloudinary');
      
      // Pujar la imatge a Cloudinary
      const imageUrl = await uploadImageToCloudinary(file);
      
      const newMeasurement: Omit<Measurement, 'id' | 'createdAt' | 'updatedAt'> = {
        name: file.name.replace(/\.[^/.]+$/, ''),
        photoUrl: imageUrl,
        photoBase64: '', // Ja no usem base64
        notes: '',
        boxes: [],
      };
      addMeasurement(spaceId, newMeasurement);
      
      // Seleccionar el nou measurement després d'afegir-lo
      setTimeout(() => {
        const updatedSpace = spaces.find(s => s.id === spaceId);
        if (updatedSpace && updatedSpace.measurements.length > 0) {
          setSelectedMeasurementId(updatedSpace.measurements[updatedSpace.measurements.length - 1].id);
        }
      }, 100);
    } catch (error) {
      console.error('Error processant la imatge:', error);
      alert('Error pujant la imatge. Comprova la connexió a internet.');
    }
  }
};

  const handleAddBox = () => {
    if (spaceId && selectedMeasurement) {
      const colorIndex = selectedMeasurement.boxes.length;
      const newBox = createDefaultBox3D(imageSize.width, imageSize.height, colorIndex);
      addBox(spaceId, selectedMeasurement.id, newBox);
      
      // Seleccionar la nova caixa automàticament SENSE obrir la finestra
      setTimeout(() => {
        const updatedSpace = spaces.find(s => s.id === spaceId);
        const updatedMeasurement = updatedSpace?.measurements.find(m => m.id === selectedMeasurement.id);
        if (updatedMeasurement && updatedMeasurement.boxes.length > 0) {
          setSelectedBoxId(updatedMeasurement.boxes[updatedMeasurement.boxes.length - 1].id);
        }
      }, 100);
    }
  };

  const handleUpdateBoxVertices = (boxId: string, vertices: Vertex[]) => {
    if (spaceId && selectedMeasurement) {
      updateBox(spaceId, selectedMeasurement.id, boxId, { vertices });
    }
  };

  const handleSaveDimensions = async (dimensions: { width: number; height: number; depth: number }, label: string, color: string, notes: string) => {
    if (spaceId && selectedMeasurement && selectedBoxId) {
      // Primer actualitzar dimensions, label, color i notes
      await updateBox(spaceId, selectedMeasurement.id, selectedBoxId, { dimensions, label, color, notes });
      
      // Ara guardar també els vèrtex actuals a Firestore
      const currentBox = selectedMeasurement.boxes.find(b => b.id === selectedBoxId);
      if (currentBox && user) {
        try {
          const spaceRef = doc(db, 'users', user.id, 'spaces', spaceId);
          const updatedMeasurements = selectedMeasurement.boxes.map(b =>
            b.id === selectedBoxId ? { ...b, vertices: currentBox.vertices } : b
          );
          
          await updateDoc(spaceRef, {
            measurements: space?.measurements.map(m =>
              m.id === selectedMeasurement.id
                ? { ...m, boxes: updatedMeasurements }
                : m
            ),
            updatedAt: Timestamp.now(),
          });
        } catch (error) {
          console.error('Error guardant vèrtex:', error);
        }
      }
    }
  };

  const handleDeleteMeasurement = () => {
    if (spaceId && measurementToDelete) {
      deleteMeasurement(spaceId, measurementToDelete.id);
      setMeasurementToDelete(null);
      setDeleteDialogOpen(false);
      setSelectedMeasurementId(null);
    }
  };

  const handleDeleteBox = () => {
    if (spaceId && selectedMeasurement && boxToDelete) {
      deleteBox(spaceId, selectedMeasurement.id, boxToDelete);
      setBoxToDelete(null);
      setDeleteDialogOpen(false);
      setSelectedBoxId(null);
    }
  };

  const handleRename = () => {
    if (spaceId && selectedMeasurement && newName.trim()) {
      updateMeasurement(spaceId, selectedMeasurement.id, { name: newName.trim() });
      setRenameDialogOpen(false);
    }
  };

  const selectedBox = useMemo(() => {
    return selectedMeasurement?.boxes.find(b => b.id === selectedBoxId) || null;
  }, [selectedMeasurement?.boxes, selectedBoxId]);

  return (
    <div className="min-h-screen gradient-hero">
      <AppHeader />

      <main className="container mx-auto px-4 py-6 pb-24">
        {/* Back Button & Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tornar als espais
          </Button>

          <div className="flex items-center gap-3">
            <span className="text-4xl">{space.icon}</span>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                {space.name}
              </h1>
              <p className="text-muted-foreground text-sm">
                {space.measurements.length} foto{space.measurements.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Photo Thumbnails */}
        {space.measurements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {space.measurements.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMeasurementId(m.id);
                    setSelectedBoxId(null);
                  }}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedMeasurementId === m.id
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <img
                    src={m.photoBase64 || m.photoUrl}
                    alt={m.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
              
              {/* Add Photo Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center transition-colors"
              >
                <Plus className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        {selectedMeasurement ? (
          <div className="space-y-6">
            {/* Photo Title & Actions */}
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">
                {selectedMeasurement.name}
              </h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    Accions <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    setNewName(selectedMeasurement.name);
                    setRenameDialogOpen(true);
                  }}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Reanomenar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => {
                      setMeasurementToDelete(selectedMeasurement);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Esborrar foto
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* 3D Box Editor */}
            <Card className="border-0 shadow-elevated overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-video">
                  <Box3DEditor
                    imageUrl={selectedMeasurement.photoBase64 || selectedMeasurement.photoUrl}
                    boxes={selectedMeasurement.boxes}
                    selectedBoxId={selectedBoxId}
                    onSelectBox={(boxId) => {
                      setSelectedBoxId(boxId);
                    }}
                    onUpdateBox={handleUpdateBoxVertices}
                    onAddBox={handleAddBox}
                    readOnly={false}
                  />
                </div>
              </CardContent>
              {/* Botó afegir cub fora de la imatge */}
              <div className="p-4 border-t border-border bg-muted/30">
                <Button 
                  onClick={handleAddBox}
                  variant="hero"
                  className="w-full h-12 text-base font-semibold"
                >
                  + Afegir cub
                </Button>
              </div>
            </Card>

            {/* Measurement Summary */}
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                Mides
              </h3>
              <MeasurementSummary
                boxes={selectedMeasurement.boxes}
                selectedBoxId={selectedBoxId}
                onSelectBox={(boxId) => {
                  // AQUÍ SÍ que obrim la finestra perquè l'usuari ha clicat a la llista
                  setSelectedBoxId(boxId);
                  setDimensionSheetOpen(true);
                }}
                onDeleteBox={(boxId) => {
                  setBoxToDelete(boxId);
                  setDeleteDialogOpen(true);
                }}
              />
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center">
              <Camera className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground mb-2">
              Afegeix la teva primera foto
            </h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Puja o fes una foto per començar a afegir mesures
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button variant="hero" size="lg" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-5 h-5" />
                Pujar foto
              </Button>
            </div>
          </motion.div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />
      </main>

      {/* Dimension Input Sheet */}
      <DimensionInputSheet
        open={dimensionSheetOpen}
        onOpenChange={setDimensionSheetOpen}
        box={selectedBox}
        onSave={handleSaveDimensions}
      />

      {/* Delete Dialogs */}
      <DeleteConfirmDialog
        open={deleteDialogOpen && !!measurementToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteDialogOpen(false);
            setMeasurementToDelete(null);
          }
        }}
        onConfirm={handleDeleteMeasurement}
        title="Esborrar foto?"
        description="Estàs segur que vols esborrar aquesta foto i totes les seves mesures? Aquesta acció no es pot desfer."
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen && !!boxToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteDialogOpen(false);
            setBoxToDelete(null);
          }
        }}
        onConfirm={handleDeleteBox}
        title="Esborrar mesura?"
        description="Estàs segur que vols esborrar aquesta caixa de mesura? Aquesta acció no es pot desfer."
      />

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reanomenar foto</DialogTitle>
            <DialogDescription>Introdueix un nou nom per a aquesta foto</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="photoName">Nom</Label>
              <Input
                id="photoName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nom de la foto"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel·lar
            </Button>
            <Button onClick={handleRename}>Desar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
