import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import Sidebar from '@/components/Sidebar';
import StarField from '@/components/StarField';
import { Card } from '@/components/ui/card';

export default function Graph() {
  const graphData = {
    nodes: [
      { id: 'nasa', name: 'NASA', type: 'agency', color: '#00ffff' },
      { id: 'spacex', name: 'SpaceX', type: 'agency', color: '#00ffff' },
      { id: 'apollo', name: 'Apollo 11', type: 'mission', color: '#00ff00' },
      { id: 'dragon', name: 'Dragon', type: 'rocket', color: '#ff8800' },
      { id: 'payload1', name: 'Satellite', type: 'payload', color: '#c0c0c0' },
    ],
    links: [
      { source: 'nasa', target: 'apollo' },
      { source: 'spacex', target: 'dragon' },
      { source: 'apollo', target: 'payload1' },
    ],
  };

  return (
    <div className="flex min-h-screen relative">
      <StarField />
      <Sidebar />
      <main className="ml-64 flex-1 p-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-2">Mission Graph</h1>
          <p className="text-muted-foreground">Interactive visualization of space mission relationships</p>
        </motion.div>
        <Card className="glass-panel p-4" style={{ height: '70vh' }}>
          <ForceGraph2D
            graphData={graphData}
            nodeLabel="name"
            nodeColor={(node: any) => node.color}
            linkColor={() => '#00ffff'}
            backgroundColor="transparent"
          />
        </Card>
      </main>
    </div>
  );
}
