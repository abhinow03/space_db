import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

export default function Payloads() {
  const { role } = useRole();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    launch_id: '',
    name: '',
    type: '',
    mass_kg: '',
    orbit: '',
    description: '',
  });

  const { data: payloads = [] } = useQuery({
    queryKey: ['payloads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payloads')
        .select('*, launches(launch_site, missions(name))')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: launches = [] } = useQuery({
    queryKey: ['launches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('launches')
        .select('*, missions(name)')
        .order('launch_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('payloads').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payloads'] });
      toast.success('Payload created successfully');
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from('payloads').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payloads'] });
      toast.success('Payload updated successfully');
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('payloads').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payloads'] });
      toast.success('Payload deleted successfully');
    },
  });

  const resetForm = () => {
    setFormData({ launch_id: '', name: '', type: '', mass_kg: '', orbit: '', description: '' });
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      launch_id: formData.launch_id || null,
      name: formData.name,
      type: formData.type,
      mass_kg: formData.mass_kg ? parseFloat(formData.mass_kg) : null,
      orbit: formData.orbit || null,
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
      launch_id: item.launch_id || '',
      name: item.name,
      type: item.type,
      mass_kg: item.mass_kg?.toString() || '',
      orbit: item.orbit || '',
      description: item.description || '',
    });
    setIsDialogOpen(true);
  };

  const columns = [
    { key: 'name', label: 'Payload Name' },
    { key: 'type', label: 'Type' },
    { key: 'mass_kg', label: 'Mass', render: (val: any) => val ? `${val}kg` : '-' },
    { key: 'orbit', label: 'Orbit' },
    { key: 'launches', label: 'Launch', render: (val: any) => val?.missions?.name || '-' },
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
            <h1 className="text-4xl font-bold text-gradient mb-2">Payloads</h1>
            <p className="text-muted-foreground">Satellites, instruments, and cargo</p>
          </div>
          
          {canCreate && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="neon-glow" onClick={() => resetForm()}>
                  <Plus size={20} className="mr-2" />
                  Add Payload
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-panel max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-gradient">
                    {editingItem ? 'Edit Payload' : 'Add New Payload'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Payload Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-input border-border/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="launch_id">Launch</Label>
                    <Select
                      value={formData.launch_id}
                      onValueChange={(value) => setFormData({ ...formData, launch_id: value })}
                    >
                      <SelectTrigger className="bg-input border-border/50">
                        <SelectValue placeholder="Select launch" />
                      </SelectTrigger>
                      <SelectContent className="glass-panel">
                        {launches.map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            {l.missions?.name || 'Unknown'} - {new Date(l.launch_date).toLocaleDateString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="type">Payload Type *</Label>
                    <Input
                      id="type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      required
                      placeholder="e.g., Satellite, Instrument, Cargo"
                      className="bg-input border-border/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                    <div>
                      <Label htmlFor="orbit">Orbit</Label>
                      <Input
                        id="orbit"
                        value={formData.orbit}
                        onChange={(e) => setFormData({ ...formData, orbit: e.target.value })}
                        placeholder="e.g., LEO, GEO"
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
                    {editingItem ? 'Update' : 'Create'} Payload
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>

        <DataTable
          data={payloads}
          columns={columns}
          onEdit={handleEdit}
          onDelete={(item) => {
            if (confirm('Are you sure you want to delete this payload?')) {
              deleteMutation.mutate(item.id);
            }
          }}
        />
      </main>
    </div>
  );
}
