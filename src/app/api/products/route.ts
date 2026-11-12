import { NextRequest, NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { MARKET_IDS } from "@/lib/markets";

const SIZES = new Set(["large", "medium", "small", "none"]);
const HEX64 = /^[0-9a-f]{64}$/;

export async function GET(req: NextRequest) {
  const market = req.nextUrl.searchParams.get("market");

  if (!market) {
    const rows = await db
      .select({ market: products.market, count: sql<number>`count(*)::int` })
      .from(products)
      .groupBy(products.market);
    const counts: Record<string, number> = {};
    for (const row of rows) counts[row.market] = row.count;
    return NextResponse.json({ counts });
  }

  const rows = await db
    .select({
      id: products.id,
      market: products.market,
      name: products.name,
      size: products.size,
      price: products.price,
      wholesalePrice: products.wholesalePrice,
      image: products.image,
      createdAt: products.createdAt,
    })
    .from(products)
    .where(eq(products.market, market))
    .orderBy(desc(products.createdAt));

  return NextResponse.json({ products: rows });
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { market, name, size, price, wholesalePrice, image, ahash, dhash, color } = body as {
    market?: unknown;
    name?: unknown;
    size?: unknown;
    price?: unknown;
    wholesalePrice?: unknown;
    image?: unknown;
    ahash?: unknown;
    dhash?: unknown;
    color?: unknown;
  };

  if (typeof market !== "string" || !MARKET_IDS.includes(market)) {
    return NextResponse.json({ error: "Unknown market" }, { status: 400 });
  }
  if (typeof name !== "string" || name.trim().length === 0 || name.length > 120) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }
  if (typeof size !== "string" || !SIZES.has(size)) {
    return NextResponse.json({ error: "Invalid size" }, { status: 400 });
  }
  if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
    return NextResponse.json({ error: "Invalid price" }, { status: 400 });
  }
  if (
    wholesalePrice !== null &&
    wholesalePrice !== undefined &&
    (typeof wholesalePrice !== "number" || !Number.isFinite(wholesalePrice) || wholesalePrice < 0)
  ) {
    return NextResponse.json({ error: "Invalid wholesale price" }, { status: 400 });
  }
  if (typeof image !== "string" || !image.startsWith("data:image/") || image.length > 900_000) {
    return NextResponse.json({ error: "Invalid image" }, { status: 400 });
  }
  if (typeof ahash !== "string" || !HEX64.test(ahash) || typeof dhash !== "string" || !HEX64.test(dhash)) {
    return NextResponse.json({ error: "Invalid fingerprint" }, { status: 400 });
  }
  const c = color as [number, number, number] | undefined;
  const colorOk =
    Array.isArray(c) && c.length === 3 && c.every((v) => typeof v === "number" && Number.isFinite(v));

  const [row] = await db
    .insert(products)
    .values({
      market,
      name: name.trim(),
      size,
      price,
      wholesalePrice: typeof wholesalePrice === "number" ? wholesalePrice : null,
      image,
      ahash,
      dhash,
      colorR: colorOk ? c[0] : 0,
      colorG: colorOk ? c[1] : 0,
      colorB: colorOk ? c[2] : 0,
    })
    .returning({
      id: products.id,
      market: products.market,
      name: products.name,
      size: products.size,
      price: products.price,
      wholesalePrice: products.wholesalePrice,
      image: products.image,
      createdAt: products.createdAt,
    });

  return NextResponse.json({ product: row }, { status: 201 });
}
