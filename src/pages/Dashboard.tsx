import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { AppHeader } from '@/components/layout/AppHeader';
import { SpaceCard } from '@/components/spaces/SpaceCard';
import { CreateSpaceDialog } from '@/components/spaces/CreateSpaceDialog';
import { DeleteConfirmDialog } from '@/components/spaces/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Space } from '@/types';

export function Dashboard() {
  const navigate = useNavigate();
  const { spaces, createSpace, updateSpace, deleteSpace } = useApp();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [spaceToDelete, setSpaceToDelete] = useState<Space | null>(null);

  const handleCreateSpace = (name: string, icon: string) => {
    createSpace(name, icon);
  };

  const handleEditSpace = (name: string, icon: string) => {
    if (editingSpace) {
      updateSpace(editingSpace.id, { name, icon });
      setEditingSpace(null);
    }
  };

  const handleDeleteSpace = () => {
    if (spaceToDelete) {
      deleteSpace(spaceToDelete.id);
      setSpaceToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero">
      <AppHeader />

      <main className="container mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Els teus espais
          </h1>
          <p className="text-muted-foreground">
            Organitza les mesures per habitació o àrea
          </p>
        </motion.div>

        {/* Spaces Grid */}
        {spaces.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {spaces.map((space) => (
              <SpaceCard
                key={space.id}
                space={space}
                onClick={() => navigate(`/space/${space.id}`)}
                onEdit={() => setEditingSpace(space)}
                onDelete={() => {
                  setSpaceToDelete(space);
                  setDeleteDialogOpen(true);
                }}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
              <Sparkles className="w-10 h-10 text-primary-foreground" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Crea el teu primer espai
            </h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Crea un espai per a cada habitació o àrea que vulguis mesurar
            </p>
            <Button variant="hero" size="lg" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-5 h-5" />
              Crear espai
            </Button>
          </motion.div>
        )}

        {/* Floating Add Button */}
        {spaces.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="fixed bottom-6 right-6"
          >
            <Button
              variant="hero"
              size="xl"
              className="rounded-full shadow-float"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="w-6 h-6" />
              Afegir espai
            </Button>
          </motion.div>
        )}
      </main>

      {/* Create Dialog */}
      <CreateSpaceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateSpace}
        mode="create"
      />

      {/* Edit Dialog */}
      <CreateSpaceDialog
        open={editingSpace !== null}
        onOpenChange={(open) => !open && setEditingSpace(null)}
        onSubmit={handleEditSpace}
        initialData={editingSpace ? { name: editingSpace.name, icon: editingSpace.icon } : undefined}
        mode="edit"
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteSpace}
        title="Esborrar espai?"
        description={`Estàs segur que vols esborrar "${spaceToDelete?.name}"? Això eliminarà totes les mesures i fotos d'aquest espai. Aquesta acció no es pot desfer.`}
      />
    </div>
  );
}
