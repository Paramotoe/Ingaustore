"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        setError("Email atau kata sandi tidak sesuai.");
      } else {
        router.push("/admin/products");
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-border bg-surface p-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Login Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Masuk untuk mengelola katalog Ingaustore.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              className="mt-1 h-11 w-full rounded-xl border border-border bg-surface-elevated px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-focus-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="h-11 w-full rounded-xl border border-border bg-surface-elevated px-3 pr-16 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-focus-ring"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                {showPassword ? "Sembunyikan" : "Tampilkan"}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Memverifikasi…" : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}