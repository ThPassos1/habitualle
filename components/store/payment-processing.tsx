"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function PaymentProcessing({
  settled,
  onComplete,
}: {
  settled: boolean;
  onComplete: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  const onCompleteRef = useRef(onComplete);
  const settledRef = useRef(settled);
  onCompleteRef.current = onComplete;
  settledRef.current = settled;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let frame = 0;
    let finished = false;
    const started = performance.now();
    let finishFrom = 0;
    let finishStart = 0;
    let finishMs = 700;
    let mode: "cruise" | "finish" | "hold" = "cruise";

    const tick = (now: number) => {
      if (finished) return;
      if (mode === "cruise") {
        const elapsed = now - started;
        finishFrom = 0.9 * (1 - Math.exp(-elapsed / 1100));
        setProgress(finishFrom);
        if (settledRef.current) {
          mode = "finish";
          finishStart = now;
          finishMs = Math.max(700, 1900 - elapsed);
        }
      } else if (mode === "finish") {
        const t = Math.min(1, (now - finishStart) / finishMs);
        const eased = 1 - (1 - t) ** 3;
        setProgress(finishFrom + (1 - finishFrom) * eased);
        if (t >= 1) {
          mode = "hold";
          finishStart = now;
        }
      } else if (now - finishStart >= 360) {
        finished = true;
        onCompleteRef.current();
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      finished = true;
      window.cancelAnimationFrame(frame);
    };
  }, []);

  if (!mounted) return null;

  const complete = progress >= 0.995;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-white px-6" role="status" aria-live="polite">
      <div className="flex flex-col items-center text-center">
        <div
          className="relative size-28"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          aria-label="Processando seu pagamento"
        >
          <svg viewBox="0 0 100 100" className="size-28" aria-hidden>
            <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="#ededed" strokeWidth="5" />
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              stroke={complete ? "#00a650" : "#009ee3"}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
              transform="rotate(-90 50 50)"
            />
          </svg>
        </div>
        <p className="mt-8 text-lg text-stone-800">Processando seu pagamento</p>
        <p className="mt-2 text-sm text-stone-500">Aguarde um instante.</p>
      </div>
    </div>,
    document.body,
  );
}
