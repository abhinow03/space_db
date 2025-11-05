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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

const API_BASE = 'http://localhost:4000/api';

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

  /* ---------------- FETCH PAYLOADS ---------------- */
  const { data: payloads = [] } = useQuery({
    queryKey: ['payloads'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/payloads`);
      if (!res.ok) throw new Error('Failed to fetch payloads');
      return await res.json();
    },
  });

  /* ---------------- FETCH LAUNCHES ---------------- */
  const { data: launches = [] } = useQuery({
    queryKey: ['launches'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/launches`);
      if (!res.ok) throw new Error('Failed to fetch launches');
      return await res.json();
    },
  });

  /* ---------------- CREATE PAYLOAD ---------------- */
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_BASE}/payloads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create payload');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payloads'] });
      toast.success('Payload created successfully');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.message),
  });

  /* ---------------- UPDATE PAYLOAD ---------------- */
  const updateMutation = useMutation({
    mutationFn: async ({ payload_id, data }: { payload_id: number; data: any }) => {
      const res = await fetch(`${API_BASE}/payloads/${payload_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update payload');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payloads'] });
      toast.success('Payload updated successfully');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.message),
  });

  /* ---------------- DELETE PAYLOAD ---------------- */
  const deleteMutation = useMutation({
    mutationFn: async (payload_id: number) => {
      const res = await fetch(`${API_BASE}/payloads/${payload_id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete payload');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payloads'] });
      toast.success('Payload deleted successfully');
    },
    onError: (err: any) => toast.error(err.message),
  });

  /* ---------------- FORM HANDLING ---------------- */
  const resetForm = () => {
    setFormData({
      launch_id: '',
      name: '',
      type: '',
      mass_kg: '',
      orbit: '',
      description: '',
    });
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
      updateMutation.mutate({ payload_id: editingItem.payload_id, data });
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
    { key: 'payload_id', label: 'ID' },
    { key: 'name', label: 'Payload Name' },
    { key: 'type', label: 'Type' },
    {
      key: 'mass_kg',
      label: 'Mass',
      render: (val: number) => (val ? `${val} kg` : '-'),
    },
    { key: 'orbit', label: 'Orbit' },
    { key: 'launch_id', label: 'Launch ID' },
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
            <p className="text-muted-foreground">
              Satellites, instruments, and cargo assigned to launches
            </p>
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
                  <DialogDescription className="text-sm text-muted-foreground">
                    {editingItem
                      ? "Modify the details below and click 'Update' to save changes."
                      : "Provide the payload details below and click 'Create' to add a new record."}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
                      onValueChange={(value) =>
                        setFormData({ ...formData, launch_id: value })
                      }
                    >
                      <SelectTrigger className="bg-input border-border/50">
                        <SelectValue placeholder="Select launch" />
                      </SelectTrigger>
                      <SelectContent className="glass-panel">
                        {launches.map((l: any) => (
                          <SelectItem key={l.launch_id} value={l.launch_id}>
                            {l.mission_id
                              ? `Mission ${l.mission_id}`
                              : 'Unknown'}{' '}
                            - {new Date(l.launch_date).toLocaleDateString()}
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
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
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
                        onChange={(e) =>
                          setFormData({ ...formData, mass_kg: e.target.value })
                        }
                        className="bg-input border-border/50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="orbit">Orbit</Label>
                      <Input
                        id="orbit"
                        value={formData.orbit}
                        onChange={(e) =>
                          setFormData({ ...formData, orbit: e.target.value })
                        }
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
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="bg-input border-border/50"
                      rows={4}
                    />
                  </div>

                  <Button type="submit" className="w-full neon-glow">
                    {editingItem ? 'Update Payload' : 'Create Payload'}
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
              deleteMutation.mutate(item.payload_id);
            }
          }}
        />
      </main>
    </div>
  );
}
