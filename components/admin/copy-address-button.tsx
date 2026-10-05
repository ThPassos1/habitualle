"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatShippingBlock } from "@/lib/format";
import type { Customer } from "@/lib/types";

function copyWithTextarea(text: string) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.left = "-9999px";
  document.body.appendChild(area);
  area.select();
  const copied = document.execCommand("copy");
  area.remove();
  return copied;
}

export function CopyAddressButton({
  customer,
  size = "sm",
  label = "Copiar endereço completo",
}: {
  customer: Customer;
  size?: "sm" | "default";
  label?: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");

  async function onCopy() {
    const text = formatShippingBlock(customer);
    let copied = false;

    try {
      const write = navigator.clipboard.writeText(text);
      const timeout = new Promise<never>((_, reject) => {
        window.setTimeout(() => reject(new Error("clipboard-timeout")), 700);
      });
      await Promise.race([write, timeout]);
      copied = true;
    } catch {
      copied = copyWithTextarea(text);
    }

    setState(copied ? "copied" : "error");
    window.setTimeout(() => setState("idle"), 4000);
  }

  const text =
    state === "copied" ? "Endereço copiado" : state === "error" ? "Não foi possível copiar" : label;

  return (
    <Button type="button" size={size} onClick={onCopy}>
      {state === "copied" ? <Check /> : <Copy />}
      {text}
    </Button>
  );
}
