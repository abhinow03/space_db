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

export default function Launches() {
  const { role } = useRole();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    mission_id: '',
    rocket_variant_id: '',
    launch_date: '',
    launch_site: '',
    status: 'scheduled',
    success: '',
    notes: '',
  });

  const { data: launches = [] } = useQuery({
    queryKey: ['launches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('launches')
        .select('*, missions(name), rocket_variants(variant_name)')
        .order('launch_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: missions = [] } = useQuery({
    queryKey: ['missions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('missions').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: variants = [] } = useQuery({
    queryKey: ['rocket_variants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rocket_variants')
        .select('*, rockets(name)')
        .order('variant_name');
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('launches').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['launches'] });
      toast.success('Launch created successfully');
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from('launches').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['launches'] });
      toast.success('Launch updated successfully');
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('launches').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['launches'] });
      toast.success('Launch deleted successfully');
    },
  });

  const resetForm = () => {
    setFormData({ mission_id: '', rocket_variant_id: '', launch_date: '', launch_site: '', status: 'scheduled', success: '', notes: '' });
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      mission_id: formData.mission_id || null,
      rocket_variant_id: formData.rocket_variant_id || null,
      launch_date: formData.launch_date,
      launch_site: formData.launch_site,
      status: formData.status,
      success: formData.success === '' ? null : formData.success === 'true',
      notes: formData.notes || null,
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
      mission_id: item.mission_id || '',
      rocket_variant_id: item.rocket_variant_id || '',
      launch_date: item.launch_date ? new Date(item.launch_date).toISOString().slice(0, 16) : '',
      launch_site: item.launch_site,
      status: item.status,
      success: item.success === null ? '' : item.success.toString(),
      notes: item.notes || '',
    });
    setIsDialogOpen(true);
  };

  const columns = [
    { key: 'launch_date', label: 'Launch Date', render: (val: string) => new Date(val).toLocaleString() },
    { key: 'missions', label: 'Mission', render: (val: any) => val?.name || '-' },
    { key: 'rocket_variants', label: 'Rocket', render: (val: any) => val?.variant_name || '-' },
    { key: 'launch_site', label: 'Site' },
    { key: 'success', label: 'Success', render: (val: boolean | null) => val === null ? '-' : val ? '✅' : '❌' },
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
            <h1 className="text-4xl font-bold text-gradient mb-2">Launches</h1>
            <p className="text-muted-foreground">Rocket launch events and outcomes</p>
          </div>
          
          {canCreate && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="neon-glow" onClick={() => resetForm()}>
                  <Plus size={20} className="mr-2" />
                  Add Launch
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-panel max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-gradient">
                    {editingItem ? 'Edit Launch' : 'Add New Launch'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="mission_id">Mission</Label>
                    <Select
                      value={formData.mission_id}
                      onValueChange={(value) => setFormData({ ...formData, mission_id: value })}
                    >
                      <SelectTrigger className="bg-input border-border/50">
                        <SelectValue placeholder="Select mission" />
                      </SelectTrigger>
                      <SelectContent className="glass-panel">
                        {missions.map((m) => (
                          <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="rocket_variant_id">Rocket Variant</Label>
                    <Select
                      value={formData.rocket_variant_id}
                      onValueChange={(value) => setFormData({ ...formData, rocket_variant_id: value })}
                    >
                      <SelectTrigger className="bg-input border-border/50">
                        <SelectValue placeholder="Select rocket variant" />
                      </SelectTrigger>
                      <SelectContent className="glass-panel">
                        {variants.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.rockets?.name} - {v.variant_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="launch_date">Launch Date *</Label>
                    <Input
                      id="launch_date"
                      type="datetime-local"
                      value={formData.launch_date}
                      onChange={(e) => setFormData({ ...formData, launch_date: e.target.value })}
                      required
                      className="bg-input border-border/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="launch_site">Launch Site *</Label>
                    <Input
                      id="launch_site"
                      value={formData.launch_site}
                      onChange={(e) => setFormData({ ...formData, launch_site: e.target.value })}
                      required
                      placeholder="e.g., Kennedy Space Center"
                      className="bg-input border-border/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger className="bg-input border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-panel">
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="launched">Launched</SelectItem>
                          <SelectItem value="aborted">Aborted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="success">Success</Label>
                      <Select
                        value={formData.success}
                        onValueChange={(value) => setFormData({ ...formData, success: value })}
                      >
                        <SelectTrigger className="bg-input border-border/50">
                          <SelectValue placeholder="Select outcome" />
                        </SelectTrigger>
                        <SelectContent className="glass-panel">
                          <SelectItem value="true">Success</SelectItem>
                          <SelectItem value="false">Failure</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="bg-input border-border/50"
                      rows={3}
                    />
                  </div>
                  <Button type="submit" className="w-full neon-glow">
                    {editingItem ? 'Update' : 'Create'} Launch
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>

        <DataTable
          data={launches}
          columns={columns}
          onEdit={handleEdit}
          onDelete={(item) => {
            if (confirm('Are you sure you want to delete this launch?')) {
              deleteMutation.mutate(item.id);
            }
          }}
        />
      </main>
    </div>
  );
}
