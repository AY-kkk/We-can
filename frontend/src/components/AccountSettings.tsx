import { KeyRound, X } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/Button";
import { Input, Label } from "@/components/Field";
import { useAuthStore } from "@/store/auth";
import { toast } from "@/store/toast";

export function AccountSettings({ onClose }: { onClose: () => void }) {
  const user = useAuthStore((s) => s.user);
  const changePassword = useAuthStore((s) => s.changePassword);

  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const submit = async () => {
    setError("");
    if (!current || !next) {
      setError("请填写当前密码与新密码");
      return;
    }
    if (next !== confirm) {
      setError("两次输入的新密码不一致");
      return;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(next)) {
      setError("新密码至少 8 位，且同时包含字母和数字");
      return;
    }
    setLoading(true);
    try {
      await changePassword(current, next);
      toast.success("密码已修改，其他设备需重新登录");
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-md rounded-card border border-[var(--border)] bg-[var(--surface)] shadow-float"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-brand-600" />
            <h2 className="text-sm font-semibold text-[var(--text)]">账号设置 · 修改密码</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭"
            className="rounded-btn p-1 text-[var(--text-muted)] hover:bg-ink-100 dark:hover:bg-ink-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 px-5 py-5">
          <div className="rounded-btn bg-ink-50 px-3 py-2 text-xs text-[var(--text-muted)] dark:bg-ink-800">
            当前账号：{user?.username}（{user?.email}）
          </div>
          <div>
            <Label>当前密码</Label>
            <Input
              type="password"
              value={current}
              autoComplete="current-password"
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="输入当前密码"
            />
          </div>
          <div>
            <Label>新密码</Label>
            <Input
              type="password"
              value={next}
              autoComplete="new-password"
              onChange={(e) => setNext(e.target.value)}
              placeholder="至少 8 位，含字母和数字"
            />
          </div>
          <div>
            <Label>确认新密码</Label>
            <Input
              type="password"
              value={confirm}
              autoComplete="new-password"
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="再次输入新密码"
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button variant="brand" loading={loading} onClick={submit}>
              保存修改
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
