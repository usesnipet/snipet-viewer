import * as React from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import { Card, CardHeader, CardContent } from "../../../components/card";
import { Badge } from "../../../components/badge";
import { ObservabilityService } from "../../../services/observability-service";
import { LLMCall, LLMMetrics } from "../../../types/observability";
import { formatDate } from "../../../lib/utils";
import { Activity, DollarSign, Zap, Clock, TrendingUp } from "lucide-react";

export function LLMDashboard() {
  const [calls, setCalls] = React.useState<LLMCall[]>([]);
  const [metrics, setMetrics] = React.useState<LLMMetrics | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      const [c, m] = await Promise.all([
        ObservabilityService.getCalls(),
        ObservabilityService.getMetrics()
      ]);
      setCalls(c);
      setMetrics(m);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-slate-100 dark:bg-slate-900 rounded-xl" />
        ))}
      </div>
    );
  }

  // Prepare data for charts
  const dailyData = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    
    const dayCalls = calls.filter(c => c.createdAt.startsWith(dateStr));
    return {
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      calls: dayCalls.length,
      tokens: dayCalls.reduce((acc, c) => acc + c.totalTokens, 0),
      cost: dayCalls.reduce((acc, c) => acc + (c.cost || 0), 0),
    };
  });

  const tokenDistribution = [
    { name: 'Prompt', value: calls.reduce((acc, c) => acc + c.promptTokens, 0) },
    { name: 'Completion', value: calls.reduce((acc, c) => acc + c.completionTokens, 0) },
  ];

  const COLORS = ['#6366f1', '#10b981'];

  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Calls" 
          value={metrics.totalCalls.toLocaleString()} 
          icon={Activity} 
          trend="+12% from last week"
          color="indigo"
        />
        <MetricCard 
          title="Total Cost" 
          value={`$${metrics.totalCost.toFixed(4)}`} 
          icon={DollarSign} 
          trend="+5% from last week"
          color="emerald"
        />
        <MetricCard 
          title="Total Tokens" 
          value={metrics.totalTokens.toLocaleString()} 
          icon={Zap} 
          trend="+8% from last week"
          color="amber"
        />
        <MetricCard 
          title="Avg Latency" 
          value={`${Math.round(metrics.avgDuration)}ms`} 
          icon={Clock} 
          trend="-2% from last week"
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Usage Over Time */}
        <Card className="lg:col-span-2">
          <CardHeader 
            title="Usage Over Time" 
            description="Daily token consumption and request volume."
          />
          <CardContent className="h-[350px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="tokens" 
                  stroke="#6366f1" 
                  fillOpacity={1} 
                  fill="url(#colorTokens)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Token Distribution */}
        <Card>
          <CardHeader 
            title="Token Distribution" 
            description="Prompt vs Completion tokens."
          />
          <CardContent className="h-[350px] flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={tokenDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {tokenDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-6 mt-4">
              {tokenDistribution.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Calls Table */}
      <Card>
        <CardHeader 
          title="Recent LLM Calls" 
          description="Detailed log of the most recent model interactions."
        />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tokens</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cost</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {calls.slice(0, 10).map((call) => (
                  <tr key={call.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {formatDate(call.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{call.totalTokens}</span>
                        <span className="text-[10px] text-slate-400">{call.promptTokens}p / {call.completionTokens}c</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="success">${call.cost.toFixed(5)}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {call.duration}ms
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-[10px] text-slate-400">
                      {call.id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend, color }: any) {
  const colorClasses = {
    indigo: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
    rose: "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400",
  }[color as "indigo" | "emerald" | "amber" | "rose"];

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <h4 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h4>
          <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </div>
        </div>
        <div className={cn("p-3 rounded-xl", colorClasses)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
