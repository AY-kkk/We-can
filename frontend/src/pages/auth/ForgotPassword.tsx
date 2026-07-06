import { KeyRound } from "lucide-react";
import * as React from "react";
import { Link } from "react-router-dom";
import { authApi } from "@/api/auth";
import { Button } from "@/components/Button";
import { Input, Label } from "@/components/Field";

export default function ForgotPassword() {
  const [email, setEmail] = React.useState("");
  const [resetToken, setResetToken] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [step, setStep] = React.useState<"request" | "reset" | "done">("request");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const requestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      setResetToken(res.reset_token);
      setStep("reset");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const doReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.resetPassword(resetToken, newPassword);
      setStep("done");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--text)]">找回密码</h1>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        {step === "request"
          ? "输入注册邮箱获取重置令牌（演示环境直接返回）"
          : step === "reset"
            ? "设置你的新密码"
            : "密码已重置"}
      </p>

      {step === "request" && (
        <form onSubmit={requestToken} className="mt-8 space-y-4">
          <div>
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" variant="primary" loading={loading} className="w-full">
            <KeyRound className="h-4 w-4" /> 获取重置令牌
          </Button>
        </form>
      )}

      {step === "reset" && (
        <form onSubmit={doReset} className="mt-8 space-y-4">
          <div>
            <Label htmlFor="token">重置令牌</Label>
            <Input
              id="token"
              required
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="np">新密码</Label>
            <Input
              id="np"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="至少 8 位，含字母和数字"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" variant="primary" loading={loading} className="w-full">
            重置密码
          </Button>
        </form>
      )}

      {step === "done" && (
        <p className="mt-8 rounded-btn bg-brand-50 px-4 py-3 text-sm text-brand-700 dark:bg-ink-800 dark:text-brand-200">
          密码已重置成功，请返回登录。
        </p>
      )}

      <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
        <Link to="/auth/login" className="text-brand-600 hover:underline">
          返回登录
        </Link>
      </p>
    </div>
  );
}
