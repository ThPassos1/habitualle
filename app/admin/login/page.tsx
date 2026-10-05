import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="px-6 py-20 text-center text-sm text-stone-500">Abrindo o acesso…</p>}>
      <LoginForm />
    </Suspense>
  );
}
