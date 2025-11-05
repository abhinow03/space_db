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
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

export default function Agencies() {
  const { role } = useRole();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    founded_year: '',
    description: '',
    website: '',
  });

  const { data: agencies = [] } = useQuery({
    queryKey: ['agencies'],
    queryFn: async () => {
      const { data, error } = await supabase.from('agencies').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('agencies').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencies'] });
      toast.success('Agency created successfully');
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase.from('agencies').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencies'] });
      toast.success('Agency updated successfully');
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('agencies').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencies'] });
      toast.success('Agency deleted successfully');
    },
  });

  const resetForm = () => {
    setFormData({ name: '', country: '', founded_year: '', description: '', website: '' });
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      founded_year: formData.founded_year ? parseInt(formData.founded_year) : null,
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
      country: item.country,
      founded_year: item.founded_year?.toString() || '',
      description: item.description || '',
      website: item.website || '',
    });
    setIsDialogOpen(true);
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'country', label: 'Country' },
    { key: 'founded_year', label: 'Founded Year' },
    { key: 'website', label: 'Website', render: (value: string) => value ? <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{value}</a> : '-' },
  ];

  const canCreate = role === 'admin' 

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
            <h1 className="text-4xl font-bold text-gradient mb-2">Space Agencies</h1>
            <p className="text-muted-foreground">Manage space exploration organizations</p>
          </div>
          
          {canCreate && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="neon-glow" onClick={() => resetForm()}>
                  <Plus size={20} className="mr-2" />
                  Add Agency
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-panel max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-gradient">
                    {editingItem ? 'Edit Agency' : 'Add New Agency'}
                  </DialogTitle>
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
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="bg-input border-border/50"
                    />
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
                    {editingItem ? 'Update' : 'Create'} Agency
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>

        <DataTable
          data={agencies}
          columns={columns}
          onEdit={handleEdit}
          onDelete={(item) => {
            if (confirm('Are you sure you want to delete this agency?')) {
              deleteMutation.mutate(item.id);
            }
          }}
        />
      </main>
    </div>
  );
}
