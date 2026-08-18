import * as schema from "./schema";
import path from "path";
import fs from "fs";

const tursoUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

function createDbInstance() {
  if (tursoUrl) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require("@libsql/client");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle } = require("drizzle-orm/libsql");
    const client = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });
    return drizzle(client, { schema });
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require("better-sqlite3");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { drizzle } = require("drizzle-orm/better-sqlite3");

  const isVercel = !!process.env.VERCEL;
  const dbDir = isVercel ? "/tmp" : path.join(process.cwd(), "data");
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const dbPath = path.join(dbDir, "app.db");
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  return drizzle(sqlite, { schema });
}

export const db = createDbInstance();
