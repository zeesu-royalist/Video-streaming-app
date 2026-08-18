import type { Config } from "drizzle-kit";

const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "./data/app.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

export default (process.env.TURSO_DATABASE_URL
  ? {
      schema: "./src/db/schema.ts",
      out: "./drizzle",
      dialect: "turso",
      dbCredentials: {
        url,
        authToken,
      },
    }
  : {
      schema: "./src/db/schema.ts",
      out: "./drizzle",
      dialect: "sqlite",
      dbCredentials: {
        url,
      },
    }) satisfies Config;
