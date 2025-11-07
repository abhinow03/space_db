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

  /* ---------------- FETCH LAUNCHES ---------------- */
  const { data: launches = [] } = useQuery({
    queryKey: ['launches'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/launches`);
      if (!res.ok) throw new Error('Failed to fetch launches');
      return await res.json();
    },
  });

  /* ---------------- FETCH MISSIONS ---------------- */
  const { data: missions = [] } = useQuery({
    queryKey: ['missions'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/missions`);
      if (!res.ok) throw new Error('Failed to fetch missions');
      return await res.json();
    },
  });

  /* ---------------- FETCH ROCKET VARIANTS ---------------- */
  const { data: variants = [] } = useQuery({
    queryKey: ['rocket_variants'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/rocket_variants`);
      if (!res.ok) throw new Error('Failed to fetch rocket variants');
      return await res.json();
    },
  });

  /* ---------------- TOTAL PAYLOAD MASS FOR SELECTED LAUNCH (uses DB function) ---------------- */
  const { data: totalMassData } = useQuery({
    queryKey: ['launch', editingItem?.launch_id, 'total-mass'],
    queryFn: async () => {
      const id = editingItem?.launch_id;
      const res = await fetch(`${API_BASE}/launches/${id}/total-mass`);
      if (!res.ok) throw new Error('Failed to fetch total payload mass');
      return await res.json();
    },
    enabled: !!editingItem?.launch_id,
  });

  /* ---------------- CREATE LAUNCH ---------------- */
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // convert string IDs from the form to numbers before calling backend
      const payload = {
        mission_id: data.mission_id ? Number(data.mission_id) : null,
        variant_id: data.rocket_variant_id ? Number(data.rocket_variant_id) : null,
        h_name: data.notes || null,
        launch_date: data.launch_date || null,
        launch_site: data.launch_site || null,
        outcome: data.success === '' ? null : (data.success ? 'success' : 'failure'),
      };

      const res = await fetch(`${API_BASE}/launches/proc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || 'Failed to create launch');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['launches'] });
      toast.success('Launch created successfully');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.message),
  });

  /* ---------------- UPDATE LAUNCH ---------------- */
  const updateMutation = useMutation({
    mutationFn: async ({ launch_id, data }: { launch_id: number; data: any }) => {
      const res = await fetch(`${API_BASE}/launches/${launch_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update launch');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['launches'] });
      toast.success('Launch updated successfully');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.message),
  });

  /* ---------------- DELETE LAUNCH ---------------- */
  const deleteMutation = useMutation({
    mutationFn: async (launch_id: number) => {
      const res = await fetch(`${API_BASE}/launches/${launch_id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete launch');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['launches'] });
      toast.success('Launch deleted successfully');
    },
    onError: (err: any) => toast.error(err.message),
  });

  /* ---------------- FORM HANDLING ---------------- */
  const resetForm = () => {
    setFormData({
      mission_id: '',
      rocket_variant_id: '',
      launch_date: '',
      launch_site: '',
      status: 'scheduled',
      success: '',
      notes: '',
    });
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
      updateMutation.mutate({ launch_id: editingItem.launch_id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      mission_id: item.mission_id != null ? String(item.mission_id) : '',
      // handle both possible field names returned by API (variant_id or rocket_variant_id)
      rocket_variant_id:
        (item.variant_id ?? item.rocket_variant_id) != null
          ? String(item.variant_id ?? item.rocket_variant_id)
          : '',
      launch_date: item.launch_date ? new Date(item.launch_date).toISOString().slice(0, 16) : '',
      launch_site: item.launch_site || '',
      status: item.status || 'scheduled',
      success: item.success === null ? '' : String(item.success),
      notes: item.notes || '',
    });
    setIsDialogOpen(true);
  };

  const columns = [
    { key: 'launch_id', label: 'ID' },
    { key: 'launch_date', label: 'Launch Date', render: (val: string) => new Date(val).toLocaleString() },
    { key: 'mission_id', label: 'Mission ID' },
    { key: 'rocket_variant_id', label: 'Rocket Variant ID' },
    { key: 'launch_site', label: 'Launch Site' },
    { key: 'status', label: 'Status', render: (val: string) => val || '-' },
    { key: 'success', label: 'Success', render: (val: boolean | null) => (val === null ? '-' : val ? '✅' : '❌') },
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
                  <DialogDescription className="text-sm text-muted-foreground">
                    {editingItem
                      ? "Modify the details below and click 'Update' to save changes."
                      : "Provide the launch details below and click 'Create' to add a new record."}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
                        {missions.map((m: any) => (
                          <SelectItem key={String(m.mission_id)} value={String(m.mission_id)}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="rocket_variant_id">Rocket Variant</Label>
                    <Select
                      value={formData.rocket_variant_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, rocket_variant_id: value })
                      }
                    >
                      <SelectTrigger className="bg-input border-border/50">
                        <SelectValue placeholder="Select rocket variant" />
                      </SelectTrigger>
                      <SelectContent className="glass-panel">
                        {variants.map((v: any) => {
                          const id = v.variant_id ?? v.rocket_variant_id ?? v.id;
                          return (
                            <SelectItem key={String(id)} value={String(id)}>
                              {v.variant_name ?? v.name}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="launch_date">Launch Date *</Label>
                    <Input
                      id="launch_date"
                      type="datetime-local"
                      value={formData.launch_date}
                      onChange={(e) =>
                        setFormData({ ...formData, launch_date: e.target.value })
                      }
                      required
                      className="bg-input border-border/50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="launch_site">Launch Site *</Label>
                    <Input
                      id="launch_site"
                      value={formData.launch_site}
                      onChange={(e) =>
                        setFormData({ ...formData, launch_site: e.target.value })
                      }
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

                  {editingItem && (
                    <div className="text-sm text-muted-foreground">
                      <strong>Total payload mass for this launch:</strong>{' '}
                      {totalMassData ? `${totalMassData.total_mass} kg` : '—'}
                    </div>
                  )
                  }

                  <Button type="submit" className="w-full neon-glow">
                    {editingItem ? 'Update Launch' : 'Create Launch'}
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
              deleteMutation.mutate(item.launch_id);
            }
          }}
        />
      </main>
    </div>
  );
}
