import { motion } from 'framer-motion';
import { useEffect, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import ForceGraph2D from 'react-force-graph-2d';
import Sidebar from '@/components/Sidebar';
import StarField from '@/components/StarField';
import { Card } from '@/components/ui/card';

const API_BASE = 'http://localhost:4000/api';

export default function Graph() {
  const { data: graph = { nodes: [], links: [] }, isLoading, isError, error } = useQuery({
    queryKey: ['graph'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/graph`);
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    staleTime: 1000 * 60,
  });

  // quick debug log so you can see response in browser console
  useEffect(() => {
    console.log('API /api/graph response:', { isLoading, isError, error, graph });
  }, [isLoading, isError, error, graph]);

  const graphData = useMemo(() => {
    return {
      nodes: (graph.nodes || []).map((n: any) => ({ id: String(n.id), name: n.label ?? n.name, type: n.type, color: n.color })),
      links: (graph.links || []).map((l: any) => ({ source: String(l.source), target: String(l.target) })),
    };
  }, [graph]);

  if (isLoading) return <div className="p-4">Loading graph…</div>;
  if (isError) return <div className="p-4 text-red-500">Graph error: {String(error)}</div>;
  if (!graphData.nodes.length) return <div className="p-4">No graph data returned from the server.</div>;

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
            nodeAutoColorBy="type"
            linkColor={() => '#00ffff'}
            backgroundColor="transparent"
            nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale) => {
              const label = node.name;
              const fontSize = 12 / globalScale;
              ctx.fillStyle = node.color || (node.color = '#888');
              ctx.beginPath();
              ctx.arc(node.x ?? 0, node.y ?? 0, 6, 0, 2 * Math.PI, false);
              ctx.fill();
              ctx.font = `${fontSize}px Sans-Serif`;
              ctx.fillStyle = '#ffffff';
              ctx.fillText(label, (node.x ?? 0) + 8, (node.y ?? 0) + 4);
            }}
          />
        </Card>
      </main>
    </div>
  );
}
