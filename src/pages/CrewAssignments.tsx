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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

const API_BASE = "http://localhost:4000/api";

export default function CrewAssignments() {
  const { role } = useRole();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // ✅ initialize with empty strings to keep controlled state
  const [formData, setFormData] = useState({
    crew_member_id: "",
    mission_id: "",
    role: "",
    assignment_date: "",
  });

  /* ---------------- FETCH ASSIGNMENTS ---------------- */
  const { data: assignments = [] } = useQuery({
    queryKey: ['crew_assignments'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/crew_assignments`);
      if (!res.ok) throw new Error('Failed to fetch assignments');
      return await res.json();
    },
  });

  /* ---------------- FETCH CREW MEMBERS ---------------- */
  const { data: crewMembers = [] } = useQuery({
    queryKey: ['crew_members'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/crew_members`);
      if (!res.ok) throw new Error('Failed to fetch crew members');
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

  /* ---------------- CREATE ASSIGNMENT ---------------- */
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API_BASE}/crew_assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create assignment');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew_assignments'] });
      toast.success('Assignment created successfully');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.message),
  });

  /* ---------------- UPDATE ASSIGNMENT ---------------- */
  const updateMutation = useMutation({
    mutationFn: async ({ assignment_id, data }: { assignment_id: number; data: any }) => {
      const res = await fetch(`${API_BASE}/crew_assignments/${assignment_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update assignment');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew_assignments'] });
      toast.success('Assignment updated successfully');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.message),
  });

  /* ---------------- DELETE ASSIGNMENT ---------------- */
  const deleteMutation = useMutation({
    mutationFn: async (assignment_id: number) => {
      const res = await fetch(`${API_BASE}/crew_assignments/${assignment_id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete assignment');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew_assignments'] });
      toast.success('Assignment deleted successfully');
    },
    onError: (err: any) => toast.error(err.message),
  });

  /* ---------------- FORM HANDLING ---------------- */
  const resetForm = () => {
    setFormData({
      crew_member_id: "",
      mission_id: "",
      role: "",
      assignment_date: "",
    });
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      crew_member_id: Number(formData.crew_member_id) || null,
      mission_id: Number(formData.mission_id) || null,
      role: formData.role.trim(),
      assignment_date: formData.assignment_date || null,
    };

    if (editingItem) {
      updateMutation.mutate({ assignment_id: editingItem.assignment_id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      crew_member_id: String(item.crew_member_id || ""),
      mission_id: String(item.mission_id || ""),
      role: item.role || "",
      assignment_date: item.assignment_date || "",
    });
    setIsDialogOpen(true);
  };

 const columns = [
  { key: 'assignment_id', label: 'ID' },
  { key: 'crew_member_name', label: 'Crew Member' },
  { key: 'mission_name', label: 'Mission' },
  { key: 'role', label: 'Role' },
  {
    key: 'assignment_date',
    label: 'Assignment Date',
    render: (val: string) => (val ? new Date(val).toLocaleDateString() : '-'),
  },
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
            <h1 className="text-4xl font-bold text-gradient mb-2">Crew Assignments</h1>
            <p className="text-muted-foreground">Assign crew members to missions</p>
          </div>

          {canCreate && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="neon-glow" onClick={() => resetForm()}>
                  <Plus size={20} className="mr-2" />
                  Add Assignment
                </Button>
              </DialogTrigger>

              <DialogContent className="glass-panel max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-gradient">
                    {editingItem ? 'Edit Assignment' : 'Add New Assignment'}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    {editingItem
                      ? "Modify the details below and click 'Update' to save changes."
                      : "Provide the assignment details below and click 'Create' to add a new record."}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="crew_member_id">Crew Member *</Label>
                    <Select
                      value={formData.crew_member_id || ""}
                      onValueChange={(value) =>
                        setFormData({ ...formData, crew_member_id: value })
                      }
                      required
                    >
                      <SelectTrigger className="bg-input border-border/50">
                        <SelectValue placeholder="Select crew member" />
                      </SelectTrigger>
                      <SelectContent className="glass-panel">
                        {crewMembers.map((c: any) => (
                          <SelectItem key={c.crew_id} value={String(c.crew_id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="mission_id">Mission *</Label>
                    <Select
                      value={formData.mission_id || ""}
                      onValueChange={(value) =>
                        setFormData({ ...formData, mission_id: value })
                      }
                      required
                    >
                      <SelectTrigger className="bg-input border-border/50">
                        <SelectValue placeholder="Select mission" />
                      </SelectTrigger>
                      <SelectContent className="glass-panel">
                        {missions.map((m: any) => (
                          <SelectItem key={m.mission_id} value={String(m.mission_id)}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="role">Role *</Label>
                    <Input
                      id="role"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      required
                      placeholder="e.g., Commander, Pilot, Engineer"
                      className="bg-input border-border/50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="assignment_date">Assignment Date</Label>
                    <Input
                      id="assignment_date"
                      type="date"
                      value={formData.assignment_date || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, assignment_date: e.target.value })
                      }
                      className="bg-input border-border/50"
                    />
                  </div>

                  <Button type="submit" className="w-full neon-glow">
                    {editingItem ? 'Update Assignment' : 'Create Assignment'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>

        <DataTable
          data={assignments}
          columns={columns}
          onEdit={handleEdit}
          onDelete={(item) => {
            if (confirm('Are you sure you want to delete this assignment?')) {
              deleteMutation.mutate(item.assignment_id);
            }
          }}
        />
      </main>
    </div>
  );
}