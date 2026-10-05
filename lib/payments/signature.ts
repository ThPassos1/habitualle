import { createHmac, timingSafeEqual } from "crypto";

export function webhookSignatureValid(request: Request, dataId: string) {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET?.trim();
  if (!secret) return false;

  const signature = request.headers.get("x-signature");
  const requestId = request.headers.get("x-request-id");
  if (!signature || !requestId) return false;

  const parts = Object.fromEntries(
    signature.split(",").map((part) => {
      const index = part.indexOf("=");
      if (index === -1) return ["", ""];
      return [part.slice(0, index).trim(), part.slice(index + 1).trim()];
    }),
  );
  const ts = parts.ts;
  const received = parts.v1;
  if (!ts || !received || !/^[a-f0-9]{64}$/i.test(received)) return false;

  const stamp = Number(ts);
  const millis = stamp > 1_000_000_000_000 ? stamp : stamp * 1000;
  if (!Number.isFinite(millis) || Math.abs(Date.now() - millis) > 15 * 60 * 1000) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  const left = Buffer.from(expected, "utf8");
  const right = Buffer.from(received, "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
