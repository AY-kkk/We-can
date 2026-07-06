import { UserPlus } from "lucide-react";
import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/Button";
import { Input, Label } from "@/components/Field";
import { useAuthStore } from "@/store/auth";

export default function Register() {
  const nav = useNavigate();
  const register = useAuthStore((s) => s.register);
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const strong = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!strong) {
      setError("密码至少 8 位，且同时包含字母和数字");
      return;
    }
    setLoading(true);
    try {
      await register(email, username, password);
      nav("/resume", { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--text)]">创建账号</h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        注册 We-can，开启求职全链路陪跑
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="email">邮箱</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <Label htmlFor="username">用户名</Label>
          <Input
            id="username"
            required
            minLength={2}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="你的昵称"
          />
        </div>
        <div>
          <Label htmlFor="password">密码</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="至少 8 位，含字母和数字"
          />
          {password && (
            <p
              className={`mt-1 text-xs ${
                strong ? "text-brand-600" : "text-accent-600"
              }`}
            >
              {strong ? "密码强度合格 ✓" : "密码需至少 8 位且含字母和数字"}
            </p>
          )}
        </div>
        {error && (
          <p className="rounded-btn bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10">
            {error}
          </p>
        )}
        <Button type="submit" variant="primary" loading={loading} className="w-full">
          <UserPlus className="h-4 w-4" /> 注册
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
        已有账号？{" "}
        <Link to="/auth/login" className="text-brand-600 hover:underline">
          去登录
        </Link>
      </p>
    </div>
  );
}
