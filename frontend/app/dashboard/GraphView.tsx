'use client';
import ReactFlow, { Background, Controls, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { PostRead } from '@/types/post';
import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card } from '@/app/components/ui/Card';
import { Badge } from '@/app/components/ui/Badge';
import { BarChart3, PieChart as PieChartIcon, Network } from 'lucide-react';

/**
 * Props for the GraphView component.
 */
interface GraphViewProps {
    /** An array of posts to be visualized in the graphs. */
    posts: PostRead[];
}

/**
 * Renders various visualizations of debate data, including a ReactFlow graph of arguments,
 * a sentiment distribution pie chart, and a net combat power bar chart.
 */
export default function GraphView({ posts }: GraphViewProps) {
    // 1. React Flow Data (Nodes and Edges for the Argument Combat Map)
    const { nodes, edges } = useMemo(() => {
        // Create nodes from posts, positioning them based on their side (PRO/CON).
        const nodes: Node[] = posts.map((post, index) => {
            const isPro = post.side === 'PRO';
            // Node position is a simple layout for demonstration.
            return {
                id: post.id.toString(),
                data: { label: post.title || (post.content.length > 50 ? post.content.substring(0, 50) + '...' : post.content) },
                position: { 
                    x: isPro ? 0 + (index % 2) * 200 : 500 + (index % 2) * 200, 
                    y: (index % 10) * 140 
                },
                style: { 
                    background: isPro ? '#3B82F6' : '#F43F5E',
                    color: 'white',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '16px',
                    fontSize: '10px',
                    fontWeight: '900',
                    width: 180,
                    textAlign: 'center',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }
            };
        });

        // Create edges connecting replies to their parent posts.
        const edges: Edge[] = posts
            .filter(post => post.parent_post_id !== null)
            .map(post => ({
                id: `e-${post.parent_post_id}-${post.id}`,
                source: post.parent_post_id!.toString(), // Source is the parent post
                target: post.id.toString(), // Target is the current post (reply)
                animated: true,
                style: { stroke: '#7C3AED', strokeWidth: 3, opacity: 0.4 }
            }));

        return { nodes, edges };
    }, [posts]);

    // 2. Sentiment Data (Donut Chart showing PRO vs CON post count)
    const sentimentData = useMemo(() => {
        const proCount = posts.filter(p => p.side === 'PRO').length;
        const conCount = posts.filter(p => p.side === 'CON').length;
        return [
            { name: 'Support', value: proCount, color: '#3B82F6' }, // Blue for PRO
            { name: 'Oppose', value: conCount, color: '#F43F5E' }, // Red for CON
        ];
    }, [posts]);

    // 3. Interaction Data (Bar Chart showing Net Combat Power)
    const interactionData = useMemo(() => {
        // Calculate net score for PRO and CON sides.
        const proNet = posts.filter(p => p.side === 'PRO').reduce((acc, p) => acc + (p.upvotes - p.downvotes), 0);
        const conNet = posts.filter(p => p.side === 'CON').reduce((acc, p) => acc + (p.upvotes - p.downvotes), 0);
        return [
            { name: 'Net Power', Support: Math.max(0, proNet), Oppose: Math.max(0, conNet) },
        ];
    }, [posts]);

    return (
        <div className="space-y-8 mt-8 pb-20">
            {/* Top Stats Cards */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Sentiment Share - Pie Chart */}
                <Card className="flex flex-col h-[350px] border-none shadow-premium">
                    <div className="flex items-center gap-2 mb-6">
                        <PieChartIcon className="w-4 h-4 text-brand-600" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white">Sentiment Share</h4>
                    </div>
                    <div className="flex-1 w-full h-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={sentimentData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={85}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {sentimentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }}
                                />
                                <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{value}</span>}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Net Combat Power - Bar Chart */}
                <Card className="flex flex-col h-[350px] border-none shadow-premium">
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart3 className="w-4 h-4 text-brand-600" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white">Net Combat Power</h4>
                    </div>
                    <div className="flex-1 w-full h-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={interactionData} barGap={12}>
                                <XAxis dataKey="name" hide />
                                <YAxis hide />
                                <Tooltip 
                                    cursor={{fill: 'transparent'}}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 'bold' }}
                                />
                                <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{value}</span>}/>
                                <Bar dataKey="Support" fill="#3B82F6" radius={[12, 12, 12, 12]} barSize={40} />
                                <Bar dataKey="Oppose" fill="#F43F5E" radius={[12, 12, 12, 12]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Network Graph (ReactFlow) */}
            <Card className="p-0 overflow-hidden border-none shadow-premium">
                <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Network className="w-4 h-4 text-brand-600" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white">Argument Combat Map</h4>
                    </div>
                    <Badge variant="primary" className="text-[8px]">Live Topology</Badge>
                </div>
                <div style={{ height: '600px' }} className="bg-white dark:bg-zinc-900">
                    <ReactFlow nodes={nodes} edges={edges} fitView>
                        <Background color="#F1F5F9" gap={32} size={1} />
                        <Controls />
                    </ReactFlow>
                </div>
            </Card>
        </div>
    );
}
