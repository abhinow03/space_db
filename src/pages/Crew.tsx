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
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

export default function Crew() {
  const { role } = useRole();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    nationality: '',
    date_of_birth: '',
    role: '',
    bio: '',
  });

  const { data: crew = [] } = useQuery({
    queryKey: ['crew_members'],
    queryFn: async () => {
      const res = await fetch('/api/crew_members');
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/crew_members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew_members'] });
      toast.success('Crew member added');
      setIsDialogOpen(false);
      setFormData({ name: '', nationality: '', date_of_birth: '', role: '', bio: '' });
    },
  });

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'nationality', label: 'Nationality' },
    { key: 'role', label: 'Role' },
    { key: 'missions_count', label: 'Missions' },
  ];

  return (
    <div className="flex min-h-screen relative">
      <StarField />
      <Sidebar />
      <main className="ml-64 flex-1 p-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">Crew Members</h1>
            <p className="text-muted-foreground">Astronauts and mission specialists</p>
          </div>
          {(role === 'admin' || role === 'scientist') && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="neon-glow"><Plus size={20} className="mr-2" />Add Crew Member</Button>
              </DialogTrigger>
              <DialogContent className="glass-panel">
                <DialogHeader><DialogTitle className="text-2xl text-gradient">Add Crew Member</DialogTitle></DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="space-y-4">
                  <div><Label>Name *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="bg-input" /></div>
                  <div><Label>Nationality *</Label><Input value={formData.nationality} onChange={(e) => setFormData({ ...formData, nationality: e.target.value })} required className="bg-input" /></div>
                  <div><Label>Date of Birth</Label><Input type="date" value={formData.date_of_birth} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} className="bg-input" /></div>
                  <div><Label>Role *</Label><Input value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required className="bg-input" /></div>
                  <Button type="submit" className="w-full neon-glow">Add Crew Member</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>
        <DataTable data={crew} columns={columns} />
      </main>
    </div>
  );
}
