import { KeyRound, Search, Trash2 } from "lucide-react";
import * as React from "react";
import { adminApi } from "@/api/auth";
import type { AdminUser } from "@/api/authTypes";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card, CardBody } from "@/components/Card";
import { Input } from "@/components/Field";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState, Spinner } from "@/components/States";
import { useAuthStore } from "@/store/auth";

const PAGE_SIZE = 10;

export default function AdminUsers() {
  const me = useAuthStore((s) => s.user);
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [items, setItems] = React.useState<AdminUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [msg, setMsg] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.users(q, page, PAGE_SIZE);
      setItems(res.items);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [q, page]);

  React.useEffect(() => {
    load();
  }, [load]);

  const toggleActive = async (u: AdminUser) => {
    try {
      await adminApi.updateUser(u.id, { is_active: !u.is_active });
      await load();
    } catch (e) {
      setMsg((e as Error).message);
    }
  };
  const toggleRole = async (u: AdminUser) => {
    try {
      await adminApi.updateUser(u.id, {
        role: u.role === "admin" ? "user" : "admin",
      });
      await load();
    } catch (e) {
      setMsg((e as Error).message);
    }
  };
  const resetPw = async (u: AdminUser) => {
    const np = prompt(`为 ${u.username} 设置新密码（≥8 位，含字母和数字）`);
    if (!np) return;
    try {
      await adminApi.resetPassword(u.id, np);
      setMsg("密码已重置");
    } catch (e) {
      setMsg((e as Error).message);
    }
  };
  const del = async (u: AdminUser) => {
    if (!confirm(`确认删除用户 ${u.username}？`)) return;
    try {
      await adminApi.deleteUser(u.id);
      await load();
    } catch (e) {
      setMsg((e as Error).message);
    }
  };

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <PageHeader title="用户管理" subtitle={`共 ${total} 名用户`} />

      <Card className="mb-4">
        <CardBody className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(1);
                  load();
                }
              }}
              placeholder="搜索邮箱或用户名"
              className="pl-9"
            />
          </div>
          <Button
            variant="primary"
            onClick={() => {
              setPage(1);
              load();
            }}
          >
            搜索
          </Button>
        </CardBody>
      </Card>

      {msg && (
        <p className="mb-3 rounded-btn bg-brand-50 px-3 py-2 text-sm text-brand-700 dark:bg-ink-800 dark:text-brand-200">
          {msg}
        </p>
      )}

      <Card>
        <CardBody className="p-0">
          {loading ? (
            <Spinner />
          ) : items.length === 0 ? (
            <EmptyState title="没有用户" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--text-muted)]">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">用户名</th>
                    <th className="px-4 py-3">邮箱</th>
                    <th className="px-4 py-3">角色</th>
                    <th className="px-4 py-3">状态</th>
                    <th className="px-4 py-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-[var(--border)] last:border-0"
                    >
                      <td className="px-4 py-3 text-[var(--text-muted)]">{u.id}</td>
                      <td className="px-4 py-3 font-medium text-[var(--text)]">
                        {u.username}
                        {me?.id === u.id && (
                          <span className="ml-1 text-xs text-brand-600">(你)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[var(--text-muted)]">{u.email}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleRole(u)} disabled={me?.id === u.id}>
                          <Badge tone={u.role === "admin" ? "accent" : "muted"}>
                            {u.role}
                          </Badge>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleActive(u)} disabled={me?.id === u.id}>
                          <Badge tone={u.is_active ? "brand" : "muted"}>
                            {u.is_active ? "启用" : "禁用"}
                          </Badge>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => resetPw(u)}
                            className="rounded-btn p-2 text-[var(--text-muted)] hover:bg-ink-100 dark:hover:bg-ink-800"
                            title="重置密码"
                          >
                            <KeyRound className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => del(u)}
                            disabled={me?.id === u.id}
                            className="rounded-btn p-2 text-red-500 hover:bg-red-50 disabled:opacity-30 dark:hover:bg-red-500/10"
                            title="删除"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            上一页
          </Button>
          <span className="text-sm text-[var(--text-muted)]">
            {page} / {pages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  );
}
