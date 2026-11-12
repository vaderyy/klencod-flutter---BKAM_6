import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";

const HEX64 = /^[0-9a-f]{64}$/;
const MATCH_THRESHOLD = 0.31;

const POPCOUNT = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4];

function hammingHex(a: string, b: string): number {
  let count = 0;
  for (let i = 0; i < a.length; i++) {
    const x = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    count += POPCOUNT[x];
  }
  return count;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { ahash, dhash, color } = body as {
    ahash?: unknown;
    dhash?: unknown;
    color?: unknown;
  };

  if (typeof ahash !== "string" || !HEX64.test(ahash) || typeof dhash !== "string" || !HEX64.test(dhash)) {
    return NextResponse.json({ error: "Invalid fingerprint" }, { status: 400 });
  }
  const c = color as [number, number, number] | undefined;
  const qColor: [number, number, number] =
    Array.isArray(c) && c.length === 3 && c.every((v) => typeof v === "number")
      ? [c[0], c[1], c[2]]
      : [0, 0, 0];

  const rows = await db.select().from(products);

  let best: { row: (typeof rows)[number]; score: number } | null = null;
  for (const row of rows) {
    const aDist = hammingHex(ahash, row.ahash) / 256;
    const dDist = hammingHex(dhash, row.dhash) / 256;
    const dr = row.colorR - qColor[0];
    const dg = row.colorG - qColor[1];
    const db_ = row.colorB - qColor[2];
    const cDist = Math.sqrt(dr * dr + dg * dg + db_ * db_) / 441.673;
    const score = 0.42 * aDist + 0.42 * dDist + 0.16 * cDist;
    if (!best || score < best.score) best = { row, score };
  }

  if (!best || best.score > MATCH_THRESHOLD) {
    return NextResponse.json({ product: null });
  }

  const r = best.row;
  return NextResponse.json({
    product: {
      id: r.id,
      market: r.market,
      name: r.name,
      size: r.size,
      price: r.price,
      wholesalePrice: r.wholesalePrice,
      image: r.image,
      createdAt: r.createdAt,
    },
    confidence: Math.max(0, Math.min(1, 1 - best.score / MATCH_THRESHOLD)),
  });
}
