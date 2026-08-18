import { db } from "./index";
import { users } from "./schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function main() {
  const email = "admin@platform.com";
  const password = "Admin@123";

  const existing = db.select().from(users).where(eq(users.email, email)).get();
  if (existing) {
    console.log("Super admin already exists:", email);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  db.insert(users)
    .values({
      name: "Super Admin",
      email,
      passwordHash,
      role: "SUPER_ADMIN",
    })
    .run();

  console.log("✅ Super admin created!");
  console.log("Email:", email);
  console.log("Password:", password);
  console.log("⚠️  Please log in and this password should be changed (feature can be added later).");
}

main();
