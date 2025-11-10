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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

const API_BASE = "http://localhost:4000/api";

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

  /* ---------------- FETCH CREW MEMBERS ---------------- */
  const { data: crew = [] } = useQuery({
    queryKey: ['crew_members'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/crew_members`);
      if (!res.ok) throw new Error('Failed to fetch crew members');
      return await res.json();
    },
  });

  /* ---------------- CREATE CREW MEMBER ---------------- */
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_BASE}/crew_members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || 'Failed to add crew member');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew_members'] });
      toast.success('Crew member added successfully');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.message),
  });

  /* ---------------- UPDATE CREW MEMBER ---------------- */
  const updateMutation = useMutation({
    mutationFn: async ({ crew_id, data }: { crew_id: number; data: any }) => {
      const res = await fetch(`${API_BASE}/crew_members/${crew_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update crew member');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew_members'] });
      toast.success('Crew member updated successfully');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.message),
  });

  /* ---------------- DELETE CREW MEMBER ---------------- */
  const deleteMutation = useMutation({
    mutationFn: async (crew_id: number) => {
      const res = await fetch(`${API_BASE}/crew_members/${crew_id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete crew member');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew_members'] });
      toast.success('Crew member deleted successfully');
    },
    onError: (err: any) => toast.error(err.message),
  });

  /* ---------------- FORM HANDLING ---------------- */
  const resetForm = () => {
    setFormData({
      name: '',
      nationality: '',
      date_of_birth: '',
      role: '',
      bio: '',
    });
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: formData.name,
      nationality: formData.nationality || null,
      date_of_birth: formData.date_of_birth || null,
      role: formData.role || null,
      bio: formData.bio || null,
    };

    if (editingItem) {
      updateMutation.mutate({ crew_id: editingItem.crew_id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      nationality: item.nationality || '',
      date_of_birth: item.date_of_birth || '',
      role: item.role || '',
      bio: item.bio || '',
    });
    setIsDialogOpen(true);
  };

  /* ---------------- TABLE COLUMNS ---------------- */
  const columns = [
    { key: 'crew_id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'nationality', label: 'Nationality' },
    { key: 'date_of_birth', label: 'Date of Birth' },
    { key: 'role', label: 'Role' },
    { key: 'bio', label: 'Bio' },
    { key: 'missions_count', label: 'Missions' },
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
            <h1 className="text-4xl font-bold text-gradient mb-2">Crew Members</h1>
            <p className="text-muted-foreground">Astronauts and mission specialists</p>
          </div>

          {canCreate && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="neon-glow" onClick={() => resetForm()}>
                  <Plus size={20} className="mr-2" />
                  Add Crew Member
                </Button>
              </DialogTrigger>

              <DialogContent className="glass-panel max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-gradient">
                    {editingItem ? 'Edit Crew Member' : 'Add New Crew Member'}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    {editingItem
                      ? "Modify the details below and click 'Update' to save changes."
                      : "Provide the details below and click 'Create' to add a new crew member."}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
                      id="nationality"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      className="bg-input border-border/50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      className="bg-input border-border/50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="bg-input border-border/50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="bg-input border-border/50"
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full neon-glow">
                    {editingItem ? 'Update' : 'Create'} Crew Member
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>

        <DataTable
          data={crew}
          columns={columns}
          onEdit={handleEdit}
          onDelete={(item) => {
            if (confirm('Are you sure you want to delete this crew member?')) {
              deleteMutation.mutate(item.crew_id);
            }
          }}
        />
      </main>
    </div>
  );
}