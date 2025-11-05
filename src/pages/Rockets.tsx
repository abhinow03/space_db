import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// removed supabase client - using backend API endpoints instead
import { useRole } from '@/contexts/RoleContext';
import Sidebar from '@/components/Sidebar';
import StarField from '@/components/StarField';
import DataTable from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

export default function Rockets() {
  const { role } = useRole();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    manufacturer_id: '',
    description: '',
    height_meters: '',
    mass_kg: '',
  });

  const { data: rockets = [] } = useQuery({
    queryKey: ['rockets'],
    queryFn: async () => {
      const res = await fetch('/api/rockets');
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  });

  const { data: manufacturers = [] } = useQuery({
    queryKey: ['manufacturers'],
    queryFn: async () => {
      const res = await fetch('/api/manufacturers');
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/rockets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rockets'] });
      toast.success('Rocket created successfully');
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/rockets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rockets'] });
      toast.success('Rocket updated successfully');
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/rockets/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rockets'] });
      toast.success('Rocket deleted successfully');
    },
  });

  const resetForm = () => {
    setFormData({ name: '', manufacturer_id: '', description: '', height_meters: '', mass_kg: '' });
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: formData.name,
      manufacturer_id: formData.manufacturer_id || null,
      description: formData.description || null,
      height_meters: formData.height_meters ? parseFloat(formData.height_meters) : null,
      mass_kg: formData.mass_kg ? parseFloat(formData.mass_kg) : null,
    };
    
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      manufacturer_id: item.manufacturer_id || '',
      description: item.description || '',
      height_meters: item.height_meters?.toString() || '',
      mass_kg: item.mass_kg?.toString() || '',
    });
    setIsDialogOpen(true);
  };

  const columns = [
    { key: 'name', label: 'Rocket Name' },
    { key: 'manufacturers', label: 'Manufacturer', render: (val: any) => val?.name || '-' },
    { key: 'height_meters', label: 'Height (m)', render: (val: any) => val ? `${val}m` : '-' },
    { key: 'mass_kg', label: 'Mass (kg)', render: (val: any) => val ? `${val}kg` : '-' },
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
            <h1 className="text-4xl font-bold text-gradient mb-2">Rockets</h1>
            <p className="text-muted-foreground">Launch vehicles and rocket systems</p>
          </div>
          
          {canCreate && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="neon-glow" onClick={() => resetForm()}>
                  <Plus size={20} className="mr-2" />
                  Add Rocket
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-panel max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-gradient">
                    {editingItem ? 'Edit Rocket' : 'Add New Rocket'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Rocket Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-input border-border/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="manufacturer_id">Manufacturer</Label>
                    <Select
                      value={formData.manufacturer_id}
                      onValueChange={(value) => setFormData({ ...formData, manufacturer_id: value })}
                    >
                      <SelectTrigger className="bg-input border-border/50">
                        <SelectValue placeholder="Select manufacturer" />
                      </SelectTrigger>
                      <SelectContent className="glass-panel">
                        {manufacturers.map((m) => (
                          <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="height_meters">Height (meters)</Label>
                      <Input
                        id="height_meters"
                        type="number"
                        step="0.01"
                        value={formData.height_meters}
                        onChange={(e) => setFormData({ ...formData, height_meters: e.target.value })}
                        className="bg-input border-border/50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mass_kg">Mass (kg)</Label>
                      <Input
                        id="mass_kg"
                        type="number"
                        step="0.01"
                        value={formData.mass_kg}
                        onChange={(e) => setFormData({ ...formData, mass_kg: e.target.value })}
                        className="bg-input border-border/50"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-input border-border/50"
                      rows={4}
                    />
                  </div>
                  <Button type="submit" className="w-full neon-glow">
                    {editingItem ? 'Update' : 'Create'} Rocket
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>

        <DataTable
          data={rockets}
          columns={columns}
          onEdit={handleEdit}
          onDelete={(item) => {
            if (confirm('Are you sure you want to delete this rocket?')) {
              deleteMutation.mutate(item.id);
            }
          }}
        />
      </main>
    </div>
  );
}
