import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export default function RocketVariants() {
  const { role } = useRole();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    rocket_id: '',
    variant_name: '',
    payload_capacity_kg: '',
    stages: '',
    description: '',
  });

  const { data: variants = [] } = useQuery({
    queryKey: ['rocket_variants'],
    queryFn: async () => {
      const res = await fetch('/api/rocket_variants');
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  });

  const { data: rockets = [] } = useQuery({
    queryKey: ['rockets'],
    queryFn: async () => {
      const res = await fetch('/api/rockets');
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/rocket_variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rocket_variants'] });
      toast.success('Variant created successfully');
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/rocket_variants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rocket_variants'] });
      toast.success('Variant updated successfully');
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/rocket_variants/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rocket_variants'] });
      toast.success('Variant deleted successfully');
    },
  });

  const resetForm = () => {
    setFormData({ rocket_id: '', variant_name: '', payload_capacity_kg: '', stages: '', description: '' });
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      rocket_id: formData.rocket_id,
      variant_name: formData.variant_name,
      payload_capacity_kg: formData.payload_capacity_kg ? parseFloat(formData.payload_capacity_kg) : null,
      stages: formData.stages ? parseInt(formData.stages) : null,
      description: formData.description || null,
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
      rocket_id: item.rocket_id,
      variant_name: item.variant_name,
      payload_capacity_kg: item.payload_capacity_kg?.toString() || '',
      stages: item.stages?.toString() || '',
      description: item.description || '',
    });
    setIsDialogOpen(true);
  };

  const columns = [
    { key: 'variant_name', label: 'Variant Name' },
    { key: 'rockets', label: 'Rocket', render: (val: any) => val?.name || '-' },
    { key: 'payload_capacity_kg', label: 'Payload Capacity', render: (val: any) => val ? `${val}kg` : '-' },
    { key: 'stages', label: 'Stages' },
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
            <h1 className="text-4xl font-bold text-gradient mb-2">Rocket Variants</h1>
            <p className="text-muted-foreground">Different configurations of rocket systems</p>
          </div>
          
          {canCreate && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="neon-glow" onClick={() => resetForm()}>
                  <Plus size={20} className="mr-2" />
                  Add Variant
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-panel max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-gradient">
                    {editingItem ? 'Edit Rocket Variant' : 'Add New Rocket Variant'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="rocket_id">Rocket *</Label>
                    <Select
                      value={formData.rocket_id}
                      onValueChange={(value) => setFormData({ ...formData, rocket_id: value })}
                      required
                    >
                      <SelectTrigger className="bg-input border-border/50">
                        <SelectValue placeholder="Select rocket" />
                      </SelectTrigger>
                      <SelectContent className="glass-panel">
                        {rockets.map((r) => (
                          <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="variant_name">Variant Name *</Label>
                    <Input
                      id="variant_name"
                      value={formData.variant_name}
                      onChange={(e) => setFormData({ ...formData, variant_name: e.target.value })}
                      required
                      className="bg-input border-border/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="payload_capacity_kg">Payload Capacity (kg)</Label>
                      <Input
                        id="payload_capacity_kg"
                        type="number"
                        step="0.01"
                        value={formData.payload_capacity_kg}
                        onChange={(e) => setFormData({ ...formData, payload_capacity_kg: e.target.value })}
                        className="bg-input border-border/50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="stages">Stages</Label>
                      <Input
                        id="stages"
                        type="number"
                        value={formData.stages}
                        onChange={(e) => setFormData({ ...formData, stages: e.target.value })}
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
                    {editingItem ? 'Update' : 'Create'} Variant
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>

        <DataTable
          data={variants}
          columns={columns}
          onEdit={handleEdit}
          onDelete={(item) => {
            if (confirm('Are you sure you want to delete this variant?')) {
              deleteMutation.mutate(item.id);
            }
          }}
        />
      </main>
    </div>
  );
}
