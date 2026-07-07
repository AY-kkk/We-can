import { LogIn } from "lucide-react";
import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/Button";
import { Input, Label } from "@/components/Field";
import { mascotPose } from "@/assets";
import { useAuthStore } from "@/store/auth";

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation() as { state?: { from?: string } };
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      nav(loc.state?.from || "/resume", { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <img
        src={mascotPose.welcome}
        alt="We-can 吉祥物"
        className="mb-4 h-16 w-16 rounded-card bg-brand-50 object-contain shadow-card lg:hidden dark:bg-ink-800"
      />
      <h1 className="text-2xl font-semibold text-[var(--text)]">欢迎回来</h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        登录 We-can，继续你的秋招之旅
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="email">邮箱</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <Label htmlFor="password">密码</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        {error && (
          <p className="rounded-btn bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10">
            {error}
          </p>
        )}
        <Button type="submit" variant="primary" loading={loading} className="w-full">
          <LogIn className="h-4 w-4" /> 登录
        </Button>
      </form>

      <div className="mt-4 flex items-center justify-between text-sm">
        <Link to="/auth/forgot" className="text-brand-600 hover:underline">
          忘记密码？
        </Link>
        <span className="text-[var(--text-muted)]">
          还没有账号？{" "}
          <Link to="/auth/register" className="text-brand-600 hover:underline">
            注册
          </Link>
        </span>
      </div>

      <p className="mt-6 rounded-btn bg-brand-50 px-3 py-2 text-xs text-brand-700 dark:bg-ink-800 dark:text-brand-200">
        演示管理员：admin@wecan.dev / Admin@12345（登录后可进入后台）
      </p>
    </div>
  );
}
