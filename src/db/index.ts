import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __bikamPool?: Pool;
  __bikamDb?: NodePgDatabase;
};

function createDb(): NodePgDatabase {
  if (!databaseUrl) {
    // لا نرمي الخطأ عند الاستيراد حتى يعمل التطبيق في وضع العرض (Demo) بدون قاعدة بيانات
    throw new Error("DATABASE_URL is required");
  }
  const pool =
    globalForDb.__bikamPool ??
    new Pool({ connectionString: databaseUrl });
  if (process.env.NODE_ENV !== "production") {
    globalForDb.__bikamPool = pool;
  }
  return drizzle(pool);
}

// تهيئة كسولة: لا يتم الاتصال بقاعدة البيانات إلا عند أول استخدام فعلي
export const db = new Proxy({} as NodePgDatabase, {
  get(_target, prop) {
    const real =
      globalForDb.__bikamDb ??
      (globalForDb.__bikamDb = createDb());
    const value = (real as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function" ? value.bind(real) : value;
  },
});
