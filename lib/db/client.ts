// ----------------------------------------------------------------------
// DB client — Postgres pool singleton para Shifty conversation logging
// ----------------------------------------------------------------------
// Postgres vive en el mismo VPS (localhost:5432) → conexión rapidísima
// (~0.1ms RTT) y blast radius compartido (si se cae Postgres se cae
// también la web, aceptable).
//
// Pool singleton: Next.js puede importar este módulo desde múltiples
// route handlers, pero queremos UN pool por proceso para no agotar
// connections. El globalThis trick mantiene el pool entre hot-reloads
// en dev — en producción Next.js corre cada route en el mismo process.

import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __shiftyPgPool: Pool | undefined;
}

function buildPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // En build time (no env) devolvemos un pool dummy que tira al
    // primer query. No bloqueamos el build — la app puede arrancar sin
    // DB y la integración HubSpot vía conversation persistence queda
    // disabled hasta que se setee DATABASE_URL en runtime.
    return new Pool({
      connectionString: "postgresql://shifty:placeholder@localhost:5432/shifty_conversations",
    });
  }

  return new Pool({
    connectionString,
    // VPS local, no necesita SSL. Si en el futuro Postgres se mueve a
    // managed (RDS/Supabase), agregar ssl: { rejectUnauthorized: false }
    ssl: false,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
}

export function getPool(): Pool {
  if (!global.__shiftyPgPool) {
    global.__shiftyPgPool = buildPool();
  }
  return global.__shiftyPgPool;
}

/**
 * Health check para `/api/health`. Hace SELECT 1 con timeout corto —
 * si DB está caído reportamos degraded sin tirar la app.
 */
export async function dbHealthy(): Promise<boolean> {
  try {
    const r = await getPool().query("SELECT 1 as ok");
    return r.rows[0]?.ok === 1;
  } catch {
    return false;
  }
}
