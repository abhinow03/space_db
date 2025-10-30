import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Rocket, Building2, Users, Satellite, TrendingUp, Network } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import StarField from '@/components/StarField';

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [missions, rockets, agencies, payloads, launches] = await Promise.all([
        supabase.from('missions').select('*', { count: 'exact' }),
        supabase.from('rockets').select('*', { count: 'exact' }),
        supabase.from('agencies').select('*', { count: 'exact' }),
        supabase.from('payloads').select('*', { count: 'exact' }),
        supabase.from('launches').select('success', { count: 'exact' }),
      ]);

      const successCount = launches.data?.filter(l => l.success === true).length || 0;
      const failureCount = launches.data?.filter(l => l.success === false).length || 0;

      return {
        missions: missions.count || 0,
        rockets: rockets.count || 0,
        agencies: agencies.count || 0,
        payloads: payloads.count || 0,
        successCount,
        failureCount,
      };
    },
  });

  const successData = [
    { name: 'Success', value: stats?.successCount || 0, color: '#00ffff' },
    { name: 'Failure', value: stats?.failureCount || 0, color: '#a855f7' },
  ];

  const statCards = [
    { title: 'Total Missions', value: stats?.missions || 0, icon: Rocket, color: 'from-primary to-accent' },
    { title: 'Rockets', value: stats?.rockets || 0, icon: Satellite, color: 'from-secondary to-primary' },
    { title: 'Agencies', value: stats?.agencies || 0, icon: Building2, color: 'from-accent to-secondary' },
    { title: 'Payloads', value: stats?.payloads || 0, icon: TrendingUp, color: 'from-primary to-secondary' },
  ];

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
          <h1 className="text-4xl font-bold text-gradient mb-2">Mission Control Dashboard</h1>
          <p className="text-muted-foreground">Overview of all space missions and operations</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-panel hover:neon-glow transition-all">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                      <Icon size={20} className="text-background" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">{stat.value}</div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="text-xl">Launch Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={successData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {successData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="glass-panel h-full flex flex-col justify-center items-center p-8">
              <Network size={64} className="text-primary mb-4 neon-glow" />
              <h3 className="text-2xl font-bold mb-4">Mission Graph Visualization</h3>
              <p className="text-muted-foreground text-center mb-6">
                Explore the relationships between agencies, missions, launches, and more in an interactive 3D graph
              </p>
              <Button
                onClick={() => navigate('/graph')}
                size="lg"
                className="neon-glow hover:neon-glow-purple"
              >
                Launch Graph Visualizer
              </Button>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
