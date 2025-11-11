import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Sidebar from '@/components/Sidebar';
import StarField from '@/components/StarField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Database, Zap, Code2, GitBranch } from 'lucide-react';

const API_BASE = 'http://localhost:4000/api';

export default function DatabaseInfo() {
  const queryClient = useQueryClient();
  const [missionId, setMissionId] = useState('1');
  const [launchId, setLaunchId] = useState('1');
  const [variantId, setVariantId] = useState('1');
  const [endDate, setEndDate] = useState('2025-12-31');
  const [assignmentData, setAssignmentData] = useState({
    mission_id: '1',
    crew_member_id: '1',
    role: 'Commander',
    assignment_date: '2025-01-15',
  });

  /* ---------------- Test Procedures ---------------- */
  const testCompleteMission = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE}/missions/${missionId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ end_date: endDate }),
      });
      if (!res.ok) throw new Error('Failed to complete mission');
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(`Mission completed! ${JSON.stringify(data)}`);
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const testAssignCrew = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE}/crew_assignments/proc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentData),
      });
      if (!res.ok) throw new Error('Failed to assign crew');
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(`Crew assigned! ${JSON.stringify(data)}`);
      queryClient.invalidateQueries({ queryKey: ['crew_assignments'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const testAddMission = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE}/missions/proc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Mission via Procedure',
          agency_id: 1,
          status: 'planned',
        }),
      });
      if (!res.ok) throw new Error('Failed to add mission');
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(`Mission created! ${JSON.stringify(data)}`);
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  /* ---------------- Test Functions ---------------- */
  const { data: activeMissionsCount } = useQuery({
    queryKey: ['active_missions_count'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/stats/active-missions`);
      if (!res.ok) throw new Error('Failed to fetch active missions count');
      return res.json();
    },
  });

  const { data: totalPayloadMass } = useQuery({
    queryKey: ['total_payload_mass', launchId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/launches/${launchId}/total-mass`);
      if (!res.ok) throw new Error('Failed to fetch total payload mass');
      return res.json();
    },
  });

  return (
    <div className="flex min-h-screen relative">
      <StarField />
      <Sidebar />

      <main className="ml-64 flex-1 p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gradient mb-2">
            Database Components
          </h1>
          <p className="text-muted-foreground">
            Procedures, Functions, and Triggers in the Space Database
          </p>
        </motion.div>

        <Tabs defaultValue="procedures" className="w-full">
          <TabsList className="glass-panel mb-6">
            <TabsTrigger value="procedures" className="flex items-center gap-2">
              <GitBranch size={18} />
              Stored Procedures
            </TabsTrigger>
            <TabsTrigger value="functions" className="flex items-center gap-2">
              <Code2 size={18} />
              Functions
            </TabsTrigger>
            <TabsTrigger value="triggers" className="flex items-center gap-2">
              <Zap size={18} />
              Triggers
            </TabsTrigger>
          </TabsList>

          {/* STORED PROCEDURES */}
          <TabsContent value="procedures" className="space-y-6">
            <Card className="glass-panel border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gradient">
                  <Database size={20} />
                  add_mission
                </CardTitle>
                <CardDescription>
                  Creates a new mission with basic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="font-semibold mb-2">Parameters:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>
                      <code>p_name</code> (VARCHAR) - Mission name
                    </li>
                    <li>
                      <code>p_agency_id</code> (INT) - Agency ID
                    </li>
                    <li>
                      <code>p_status</code> (VARCHAR) - Mission status
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="font-semibold mb-2">What it does:</p>
                  <p className="text-sm">
                    Inserts a new mission into the missions table with the
                    provided name, agency, and status.
                  </p>
                </div>

                <Button
                  onClick={() => testAddMission.mutate()}
                  className="neon-glow"
                  disabled={testAddMission.isPending}
                >
                  {testAddMission.isPending ? 'Testing...' : 'Test Procedure'}
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-panel border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gradient">
                  <Database size={20} />
                  add_launch
                </CardTitle>
                <CardDescription>
                  Creates a new launch with mission and rocket details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="font-semibold mb-2">Parameters:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>
                      <code>p_mission_id</code> (INT) - Mission ID
                    </li>
                    <li>
                      <code>p_variant_id</code> (INT) - Rocket variant ID
                    </li>
                    <li>
                      <code>p_h_name</code> (VARCHAR) - Launch name
                    </li>
                    <li>
                      <code>p_launch_date</code> (DATE) - Date of launch
                    </li>
                    <li>
                      <code>p_launch_site</code> (VARCHAR) - Launch location
                    </li>
                    <li>
                      <code>p_outcome</code> (VARCHAR) - Launch outcome
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="font-semibold mb-2">What it does:</p>
                  <p className="text-sm">
                    Inserts a new launch into the launches table, linking it to
                    a mission and rocket variant.
                  </p>
                </div>

                <p className="text-xs text-muted-foreground">
                  Use via: POST /api/launches/proc
                </p>
              </CardContent>
            </Card>

            <Card className="glass-panel border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gradient">
                  <Database size={20} />
                  complete_mission
                </CardTitle>
                <CardDescription>
                  Marks a mission as completed and sets end date
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="font-semibold mb-2">Parameters:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>
                      <code>p_mission_id</code> (INT) - Mission to complete
                    </li>
                    <li>
                      <code>p_end_date</code> (DATE) - Completion date
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="font-semibold mb-2">What it does:</p>
                  <p className="text-sm">
                    Updates the mission status to 'completed' and sets the end
                    date. Useful for tracking when missions finish.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Mission ID</Label>
                  <Input
                    type="number"
                    value={missionId}
                    onChange={(e) => setMissionId(e.target.value)}
                    className="bg-input"
                  />
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-input"
                  />
                </div>

                <Button
                  onClick={() => testCompleteMission.mutate()}
                  className="neon-glow"
                  disabled={testCompleteMission.isPending}
                >
                  {testCompleteMission.isPending
                    ? 'Testing...'
                    : 'Test Procedure'}
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-panel border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gradient">
                  <Database size={20} />
                  assign_crew_to_mission
                </CardTitle>
                <CardDescription>
                  Assigns a crew member to a mission with a specific role
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="font-semibold mb-2">Parameters:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>
                      <code>p_mission_id</code> (INT) - Mission ID
                    </li>
                    <li>
                      <code>p_crew_member_id</code> (INT) - Crew member ID
                    </li>
                    <li>
                      <code>p_role</code> (VARCHAR) - Role on the mission
                    </li>
                    <li>
                      <code>p_assignment_date</code> (DATE) - Assignment date
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="font-semibold mb-2">What it does:</p>
                  <p className="text-sm">
                    Creates a crew assignment record linking a crew member to a
                    mission with their designated role.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Mission ID</Label>
                    <Input
                      type="number"
                      value={assignmentData.mission_id}
                      onChange={(e) =>
                        setAssignmentData({
                          ...assignmentData,
                          mission_id: e.target.value,
                        })
                      }
                      className="bg-input"
                    />
                  </div>
                  <div>
                    <Label>Crew Member ID</Label>
                    <Input
                      type="number"
                      value={assignmentData.crew_member_id}
                      onChange={(e) =>
                        setAssignmentData({
                          ...assignmentData,
                          crew_member_id: e.target.value,
                        })
                      }
                      className="bg-input"
                    />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Input
                      value={assignmentData.role}
                      onChange={(e) =>
                        setAssignmentData({
                          ...assignmentData,
                          role: e.target.value,
                        })
                      }
                      className="bg-input"
                    />
                  </div>
                  <div>
                    <Label>Assignment Date</Label>
                    <Input
                      type="date"
                      value={assignmentData.assignment_date}
                      onChange={(e) =>
                        setAssignmentData({
                          ...assignmentData,
                          assignment_date: e.target.value,
                        })
                      }
                      className="bg-input"
                    />
                  </div>
                </div>

                <Button
                  onClick={() => testAssignCrew.mutate()}
                  className="neon-glow w-full"
                  disabled={testAssignCrew.isPending}
                >
                  {testAssignCrew.isPending ? 'Testing...' : 'Test Procedure'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FUNCTIONS */}
          <TabsContent value="functions" className="space-y-6">
            <Card className="glass-panel border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gradient">
                  <Code2 size={20} />
                  get_active_mission_count
                </CardTitle>
                <CardDescription>
                  Returns the count of currently active missions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="font-semibold mb-2">Parameters:</p>
                  <p className="text-sm text-muted-foreground">None</p>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="font-semibold mb-2">Returns:</p>
                  <p className="text-sm">INT - Number of active missions</p>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="font-semibold mb-2">What it does:</p>
                  <p className="text-sm">
                    Counts all missions with status = 'active' in the database.
                    Useful for dashboard statistics.
                  </p>
                </div>

                <div className="bg-primary/10 border border-primary/30 p-4 rounded-lg">
                  <p className="font-semibold mb-2">Current Result:</p>
                  <p className="text-3xl font-bold text-gradient">
                    {activeMissionsCount?.count ?? 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Active missions
                  </p>
                </div>

                <p className="text-xs text-muted-foreground">
                  Use via: GET /api/stats/active-missions
                </p>
              </CardContent>
            </Card>

            <Card className="glass-panel border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gradient">
                  <Code2 size={20} />
                  get_total_payload_mass
                </CardTitle>
                <CardDescription>
                  Calculates total payload mass for a specific launch
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="font-semibold mb-2">Parameters:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>
                      <code>p_launch_id</code> (INT) - Launch ID to calculate
                      for
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="font-semibold mb-2">Returns:</p>
                  <p className="text-sm">
                    DECIMAL - Total mass in kg of all payloads
                  </p>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="font-semibold mb-2">What it does:</p>
                  <p className="text-sm">
                    Sums up the mass_kg of all payloads associated with a given
                    launch. Helps verify payload capacity limits.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Launch ID</Label>
                  <Input
                    type="number"
                    value={launchId}
                    onChange={(e) => setLaunchId(e.target.value)}
                    className="bg-input"
                  />
                </div>

                <div className="bg-primary/10 border border-primary/30 p-4 rounded-lg">
                  <p className="font-semibold mb-2">Current Result:</p>
                  <p className="text-3xl font-bold text-gradient">
                    {totalPayloadMass?.total_mass ?? 0} kg
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total payload mass for Launch #{launchId}
                  </p>
                </div>

                <p className="text-xs text-muted-foreground">
                  Use via: GET /api/launches/:id/total-mass
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TRIGGERS */}
          <TabsContent value="triggers" className="space-y-6">
            <Card className="glass-panel border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gradient">
                  <Zap size={20} />
                  before_mission_insert
                </CardTitle>
                <CardDescription>
                  Automatically sets default mission status before insert
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="font-semibold mb-2">Event:</p>
                  <p className="text-sm">
                    BEFORE INSERT on <code>missions</code> table
                  </p>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="font-semibold mb-2">What it does:</p>
                  <p className="text-sm">
                    If a new mission is being inserted without a status (or with
                    an empty status), this trigger automatically sets the status
                    to 'planned'. This ensures all missions have a valid status.
                  </p>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="font-semibold mb-2">Example:</p>
                  <p className="text-sm">
                    When you create a new mission without specifying status, it
                    will automatically be set to 'planned' instead of NULL.
                  </p>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-lg">
                  <p className="font-semibold mb-2 flex items-center gap-2">
                    <Zap size={16} />
                    Automatic Execution
                  </p>
                  <p className="text-sm">
                    This trigger runs automatically - no manual action needed!
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-panel border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gradient">
                  <Zap size={20} />
                  after_launch_insert
                </CardTitle>
                <CardDescription>
                  Updates mission status when a successful launch occurs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="font-semibold mb-2">Event:</p>
                  <p className="text-sm">
                    AFTER INSERT on <code>launches</code> table
                  </p>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="font-semibold mb-2">What it does:</p>
                  <p className="text-sm">
                    When a new launch is added with outcome = 'success', this
                    trigger automatically updates the associated mission's status
                    from 'planned' to 'active'. This keeps mission statuses
                    synchronized with launch events.
                  </p>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="font-semibold mb-2">Example Flow:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Mission created with status = 'planned'</li>
                    <li>Launch added with outcome = 'success'</li>
                    <li>Trigger fires and changes mission to 'active'</li>
                  </ol>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-lg">
                  <p className="font-semibold mb-2 flex items-center gap-2">
                    <Zap size={16} />
                    Automatic Execution
                  </p>
                  <p className="text-sm">
                    This trigger runs automatically when you create a successful
                    launch!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}