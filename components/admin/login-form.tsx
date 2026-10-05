"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = (await response.json().catch(() => null)) as { message?: string } | null;
    setLoading(false);
    if (!response.ok) {
      setError(data?.message || "E-mail ou senha incorretos.");
      return;
    }
    const from = searchParams.get("from");
    const destination = from && from.startsWith("/admin") && !from.startsWith("/admin/login") ? from : "/admin";
    router.push(destination);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-6 py-16">
      <div className="w-full max-w-md rounded-lg border border-stone-200 bg-white p-8 shadow-sm">
        <Logo className="h-28" />
        <h1 className="mt-8 font-serif text-3xl text-stone-800">Área da equipe</h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-500">
          Pedidos, endereços e o que segue para o fornecedor.
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-stone-500">E-mail</span>
            <Input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-stone-500">Senha</span>
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error && <p className="text-sm text-terracotta-600">{error}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Entrando…" : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
