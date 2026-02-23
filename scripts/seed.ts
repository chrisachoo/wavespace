import { readFileSync } from "fs";
import { resolve } from "path";
import postgres from "postgres";

const fileArg = process.argv[2];
const defaultSeed = "scripts/002_seed_stack_quiz.sql";
const filePath = fileArg
  ? resolve(process.cwd(), fileArg)
  : resolve(process.cwd(), defaultSeed);

const databaseUrl = process.env.POSTGRES_URL_NON_POOLING!;
if (!databaseUrl) {
  console.error(
    "Missing POSTGRES_URL_NON_POOLING. Add it to .env (Supabase: Project Settings → Database → Connection string)."
  );
  process.exit(1);
}

async function main() {
  let sql: postgres.Sql;
  try {
    sql = postgres(databaseUrl, { max: 1 });
  } catch (err) {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  }

  try {
    const content = readFileSync(filePath, "utf-8");
    if (!content.trim()) {
      console.error(`File is empty: ${filePath}`);
      process.exit(1);
    }
    console.log(`Running: ${filePath}`);
    await sql.unsafe(content);
    console.log("Seed completed successfully.");
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
