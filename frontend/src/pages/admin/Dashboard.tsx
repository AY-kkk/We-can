import { Activity, ShieldCheck, UserPlus, Users } from "lucide-react";
import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { adminApi } from "@/api/auth";
import type { DashboardStats } from "@/api/authTypes";
import { Card, CardBody, CardHeader } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { ErrorState, Spinner } from "@/components/States";

const COLUMN_LABELS: Record<string, string> = {
  resume: "简历打磨",
  prep: "笔面准备",
  review: "面试复盘",
  landing: "秋招Landing",
  experience: "经验帖",
};
const PIE_COLORS = ["#1f8f74", "#ff7a45", "#42ab90", "#9aa5b1", "#f06134"];

export default function AdminDashboard() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setStats(await adminApi.dashboard());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);
  React.useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Spinner label="加载看板" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!stats) return null;

  const cards = [
    { label: "注册用户", value: stats.total_users, icon: Users },
    { label: "活跃用户", value: stats.active_users, icon: Activity },
    { label: "管理员", value: stats.admin_users, icon: ShieldCheck },
    { label: "近7日新增", value: stats.new_users_7d, icon: UserPlus },
  ];
  const usage = Object.entries(stats.column_usage).map(([k, v]) => ({
    name: COLUMN_LABELS[k] || k,
    value: v,
  }));

  return (
    <div>
      <PageHeader title="数据看板" subtitle="平台注册、活跃与各栏目使用概览。" />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardBody className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-btn bg-brand-50 text-brand-600 dark:bg-ink-800">
                <c.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[var(--text)]">
                  {c.value}
                </p>
                <p className="text-xs text-[var(--text-muted)]">{c.label}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="近 7 日注册趋势" />
          <CardBody>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.signups_by_day}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e9ee" />
                  <XAxis dataKey="day" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1f8f74" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="各栏目使用量" />
          <CardBody>
            {usage.length === 0 ? (
              <p className="py-16 text-center text-sm text-[var(--text-muted)]">
                暂无使用数据
              </p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={usage}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      label
                    >
                      {usage.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
