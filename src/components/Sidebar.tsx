import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Rocket, 
  PackagePlus, 
  Satellite, 
  ClipboardList, 
  UserCog, 
  Factory, 
  Network 
} from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';

export default function Sidebar() {
  const { role } = useRole();
  
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'scientist', 'viewer'] },
    { path: '/agencies', label: 'Agencies', icon: Building2, roles: ['admin', 'scientist', 'viewer'] },
    { path: '/manufacturers', label: 'Manufacturers', icon: Factory, roles: ['admin', 'scientist', 'viewer'] },
    { path: '/crew', label: 'Crew Members', icon: Users, roles: ['admin', 'scientist', 'viewer'] },
    { path: '/rockets', label: 'Rockets', icon: Rocket, roles: ['admin', 'scientist', 'viewer'] },
    { path: '/missions', label: 'Missions', icon: ClipboardList, roles: ['admin', 'scientist', 'viewer'] },
    { path: '/launches', label: 'Launches', icon: Satellite, roles: ['admin', 'scientist', 'viewer'] },
    { path: '/payloads', label: 'Payloads', icon: PackagePlus, roles: ['admin', 'scientist', 'viewer'] },
    { path: '/crew-assignments', label: 'Assignments', icon: UserCog, roles: ['admin', 'scientist', 'viewer'] },
    { path: '/graph', label: 'Mission Graph', icon: Network, roles: ['admin', 'scientist', 'viewer'] },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-border/30 min-h-screen fixed left-0 top-0 z-40">
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gradient">OrbitBase</h1>
          <p className="text-xs text-muted-foreground mt-1">Space Mission Database</p>
        </motion.div>

        <nav className="space-y-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isAllowed = role && item.roles.includes(role);
            
            if (!isAllowed) return null;
            
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-primary/20 text-primary neon-glow'
                        : 'text-foreground/70 hover:bg-muted/50 hover:text-primary'
                    }`
                  }
                >
                  <Icon size={20} />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              </motion.div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
