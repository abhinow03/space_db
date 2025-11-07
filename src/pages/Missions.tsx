import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRole } from '@/contexts/RoleContext';
import Sidebar from '@/components/Sidebar';
import StarField from '@/components/StarField';
import DataTable from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

const API_BASE = "http://localhost:4000/api";

export default function Missions() {
const { role } = useRole();
const queryClient = useQueryClient();
const [isDialogOpen, setIsDialogOpen] = useState(false);
const [editingItem, setEditingItem] = useState<any>(null);
const [formData, setFormData] = useState({
name: '',
agency_id: '',
mission_type: '',
start_date: '',
end_date: '',
status: 'planned',
description: '',
budget_usd: '',
});

/* ------------------- FETCH MISSIONS ------------------- */
const { data: missions = [] } = useQuery({
queryKey: ['missions'],
queryFn: async () => {
const res = await fetch(`${API_BASE}/missions`);
if (!res.ok) throw new Error("Failed to fetch missions");
return res.json();
},
});

/* ------------------- FETCH AGENCIES ------------------- */
const { data: agencies = [] } = useQuery({
queryKey: ['agencies'],
queryFn: async () => {
const res = await fetch(`${API_BASE}/table/agencies`);
if (!res.ok) return [];
const json = await res.json();
return json.rows || [];
},
});

/* ------------------- MUTATIONS ------------------- */
const createMutation = useMutation({
mutationFn: async (data: any) => {
const res = await fetch(`${API_BASE}/missions/proc`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ name: data.name, agency_id: data.agency_id, status: data.status }),
});
if (!res.ok) {
const err = await res.json().catch(() => null);
throw new Error(err?.error || 'Failed to create mission');
}
},
onSuccess: () => {
queryClient.invalidateQueries({ queryKey: ['missions'] });
toast.success('Mission created successfully');
setIsDialogOpen(false);
resetForm();
},
onError: (err: any) => toast.error(err.message)
});

const updateMutation = useMutation({
mutationFn: async ({ mission_id, data }: { mission_id: number; data: any }) => {
const res = await fetch(`${API_BASE}/missions/${mission_id}`, {
method: "PUT",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(data)
});
if (!res.ok) throw new Error("Failed to update mission");
},
onSuccess: () => {
queryClient.invalidateQueries({ queryKey: ['missions'] });
toast.success('Mission updated successfully');
setIsDialogOpen(false);
resetForm();
},
onError: (err: any) => toast.error(err.message)
});

const deleteMutation = useMutation({
mutationFn: async (mission_id: number) => {
const res = await fetch(`${API_BASE}/missions/${mission_id}`, { method: "DELETE" });
if (!res.ok) throw new Error("Failed to delete mission");
},
onSuccess: () => {
queryClient.invalidateQueries({ queryKey: ['missions'] });
toast.success('Mission deleted successfully');
},
onError: (err: any) => toast.error(err.message)
});

/* ------------------- FORM HANDLING ------------------- */
const resetForm = () => {
setFormData({ name: '', agency_id: '', mission_type: '', start_date: '', end_date: '', status: 'planned', description: '', budget_usd: '' });
setEditingItem(null);
};

const handleSubmit = (e: React.FormEvent) => {
e.preventDefault();
const data = {
name: formData.name,
agency_id: formData.agency_id || null,
mission_type: formData.mission_type || null,
start_date: formData.start_date || null,
end_date: formData.end_date || null,
status: formData.status,
description: formData.description || null,
budget_usd: formData.budget_usd ? parseFloat(formData.budget_usd) : null,
};
if (editingItem) {
updateMutation.mutate({ mission_id: editingItem.mission_id, data });
} else {
createMutation.mutate(data);
}
};

const handleEdit = (item: any) => {
setEditingItem(item);
setFormData({
name: item.name,
agency_id: item.agency_id || '',
mission_type: item.mission_type || '',
start_date: item.start_date || '',
end_date: item.end_date || '',
status: item.status,
description: item.description || '',
budget_usd: item.budget_usd?.toString() || '',
});
setIsDialogOpen(true);
};

/* ------------------- COLUMNS ------------------- */
const columns = [
{ key: 'mission_id', label: 'Mission ID' },
{ key: 'name', label: 'Mission Name' },
{ key: 'agency_id', label: 'Agency ID' },
{ key: 'mission_type', label: 'Type' },
{ key: 'status', label: 'Status', render: (val: string) => <span className="capitalize">{val}</span> },
];

const canCreate = role === 'admin';

return ( <div className="flex min-h-screen relative"> <StarField /> <Sidebar />

```
  <main className="ml-64 flex-1 p-8 relative z-10">
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 flex justify-between items-center"
    >
      <div>
        <h1 className="text-4xl font-bold text-gradient mb-2">Missions</h1>
        <p className="text-muted-foreground">Space exploration missions and operations</p>
      </div>

      {canCreate && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="neon-glow" onClick={() => resetForm()}>
              <Plus size={20} className="mr-2" />
              Add Mission
            </Button>
          </DialogTrigger>

          <DialogContent className="glass-panel max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-gradient">
                {editingItem ? "Edit Mission" : "Add New Mission"}
              </DialogTitle>

              <DialogDescription className="text-sm text-muted-foreground">
                {editingItem
                  ? "Modify the details below and click 'Update' to save your changes."
                  : "Provide the mission details below and click 'Create' to add a new record."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Mission Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-input border-border/50"
                />
              </div>

              <div>
                <Label htmlFor="agency_id">Agency ID</Label>
                <Input
                  id="agency_id"
                  value={formData.agency_id}
                  onChange={(e) => setFormData({ ...formData, agency_id: e.target.value })}
                  className="bg-input border-border/50"
                />
              </div>

              <div>
                <Label htmlFor="mission_type">Mission Type *</Label>
                <Input
                  id="mission_type"
                  value={formData.mission_type}
                  onChange={(e) => setFormData({ ...formData, mission_type: e.target.value })}
                  required
                  placeholder="e.g., Lunar Landing, Satellite Deployment"
                  className="bg-input border-border/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="bg-input border-border/50"
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="bg-input border-border/50"
                  />
                </div>
              </div>

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
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="budget_usd">Budget (USD)</Label>
                <Input
                  id="budget_usd"
                  type="number"
                  step="0.01"
                  value={formData.budget_usd}
                  onChange={(e) => setFormData({ ...formData, budget_usd: e.target.value })}
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
                {editingItem ? 'Update' : 'Create'} Mission
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>

    <DataTable
      data={missions}
      columns={columns}
      onEdit={handleEdit}
      onDelete={(item) => {
        if (confirm('Are you sure you want to delete this mission?')) {
          deleteMutation.mutate(item.mission_id);
        }
      }}
    />
  </main>
</div>
);
}
