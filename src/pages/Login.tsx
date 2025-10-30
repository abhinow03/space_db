import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useRole } from '@/contexts/RoleContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, UserCog, Eye } from 'lucide-react';
import StarField from '@/components/StarField';

export default function Login() {
  const navigate = useNavigate();
  const { setRole } = useRole();

  const roles = [
    {
      id: 'admin',
      title: 'Admin',
      description: 'Full CRUD access to all data',
      icon: UserCog,
      color: 'from-primary to-accent',
    },
    {
      id: 'scientist',
      title: 'Scientist',
      description: 'Add/Update missions and payloads',
      icon: Rocket,
      color: 'from-secondary to-accent',
    },
    {
      id: 'viewer',
      title: 'Viewer',
      description: 'Read-only access to explore data',
      icon: Eye,
      color: 'from-accent to-primary',
    },
  ];

  const handleRoleSelect = (roleId: string) => {
    setRole(roleId as 'admin' | 'scientist' | 'viewer');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <StarField />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl relative z-10"
      >
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl font-bold text-gradient mb-4"
          >
            OrbitBase
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-muted-foreground"
          >
            Space Mission Database Management System
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-3xl font-semibold text-center mb-8 text-foreground">
            Who are you?
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((role, index) => {
              const Icon = role.icon;
              return (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card className="glass-panel cursor-pointer hover:neon-glow transition-all h-full">
                    <CardHeader>
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${role.color} flex items-center justify-center mb-4`}>
                        <Icon size={32} className="text-background" />
                      </div>
                      <CardTitle className="text-2xl">{role.title}</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {role.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => handleRoleSelect(role.id)}
                        className="w-full neon-glow hover:neon-glow-purple"
                      >
                        Launch as {role.title}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
