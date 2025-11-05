import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRole } from '@/contexts/RoleContext';
import Sidebar from '@/components/Sidebar';
import StarField from '@/components/StarField';
import DataTable from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

const API_BASE = "http://localhost:4000/api";

export default function Manufacturers() {
  const { role } = useRole();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    founded_year: '',
    specialization: '',
  });

  /* ---------------- FETCH MANUFACTURERS ---------------- */
  const { data: manufacturers = [] } = useQuery({
    queryKey: ['manufacturers'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/manufacturers`);
      if (!res.ok) throw new Error("Failed to fetch manufacturers");
      return res.json();
    },
  });

  /* ---------------- CREATE MANUFACTURER ---------------- */
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_BASE}/manufacturers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create manufacturer");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
      toast.success('Manufacturer created successfully');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.message),
  });

  /* ---------------- UPDATE MANUFACTURER ---------------- */
  const updateMutation = useMutation({
    mutationFn: async ({ manufacturer_id, data }: { manufacturer_id: number; data: any }) => {
      const res = await fetch(`${API_BASE}/manufacturers/${manufacturer_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update manufacturer");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
      toast.success('Manufacturer updated successfully');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.message),
  });

  /* ---------------- DELETE MANUFACTURER ---------------- */
  const deleteMutation = useMutation({
    mutationFn: async (manufacturer_id: number) => {
      const res = await fetch(`${API_BASE}/manufacturers/${manufacturer_id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete manufacturer");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
      toast.success('Manufacturer deleted successfully');
    },
    onError: (err: any) => toast.error(err.message),
  });

  /* ---------------- FORM HANDLING ---------------- */
  const resetForm = () => {
    setFormData({
      name: '',
      country: '',
      founded_year: '',
      specialization: '',
    });
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: formData.name,
      country: formData.country || null,
      founded_year: formData.founded_year ? parseInt(formData.founded_year) : null,
      specialization: formData.specialization || null,
    };

    if (editingItem) {
      updateMutation.mutate({ manufacturer_id: editingItem.manufacturer_id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      country: item.country || '',
      founded_year: item.founded_year?.toString() || '',
      specialization: item.specialization || '',
    });
    setIsDialogOpen(true);
  };

  const columns = [
    { key: 'manufacturer_id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'country', label: 'Country' },
    { key: 'founded_year', label: 'Founded Year' },
    { key: 'specialization', label: 'Specialization' },
  ];

  const canCreate = role === 'admin' || role === 'scientist';

  return (
    <div className="flex min-h-screen relative">
      <StarField />
      <Sidebar />

      <main className="ml-64 flex-1 p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">Manufacturers</h1>
            <p className="text-muted-foreground">Rocket and spacecraft manufacturers</p>
          </div>

          {canCreate && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="neon-glow" onClick={() => resetForm()}>
                  <Plus size={20} className="mr-2" />
                  Add Manufacturer
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-panel max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-gradient">
                    {editingItem ? 'Edit Manufacturer' : 'Add New Manufacturer'}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    {editingItem
                      ? "Modify the manufacturer details below and click 'Update' to save your changes."
                      : "Provide the manufacturer details below and click 'Create' to add a new record."}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-input border-border/50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      required
                      className="bg-input border-border/50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="founded_year">Founded Year</Label>
                    <Input
                      id="founded_year"
                      type="number"
                      value={formData.founded_year}
                      onChange={(e) => setFormData({ ...formData, founded_year: e.target.value })}
                      className="bg-input border-border/50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      className="bg-input border-border/50"
                    />
                  </div>

                  <Button type="submit" className="w-full neon-glow">
                    {editingItem ? 'Update' : 'Create'} Manufacturer
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>

        <DataTable
          data={manufacturers}
          columns={columns}
          onEdit={handleEdit}
          onDelete={(item) => {
            if (confirm('Are you sure you want to delete this manufacturer?')) {
              deleteMutation.mutate(item.manufacturer_id);
            }
          }}
        />
      </main>
    </div>
  );
}
