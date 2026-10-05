import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: "Painel",
  robots: { index: false, follow: false },
};

export default function PanelLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
