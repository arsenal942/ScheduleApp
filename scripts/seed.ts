import { createClient } from "@supabase/supabase-js";
import { SEED_DATA, DAYS } from "../lib/schedule-data";

// Load env vars from .env.local
import { config } from "dotenv";
config({ path: ".env.local" });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function seed() {
  console.log("🌱 Seeding schedule data...\n");

  // Check if data already exists
  const { count } = await supabase
    .from("template_blocks")
    .select("*", { count: "exact", head: true });

  if (count && count > 0) {
    console.log(`⚠️  template_blocks already has ${count} rows.`);
    console.log("   Run with --force to clear and re-seed.\n");

    if (!process.argv.includes("--force")) {
      process.exit(0);
    }

    console.log("   --force detected. Clearing existing data...");
    await supabase.from("template_blocks").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    console.log("   ✓ Cleared.\n");
  }

  let total = 0;

  for (const day of DAYS) {
    const blocks = SEED_DATA[day];
    if (!blocks) continue;

    const rows = blocks.map((b, i) => ({
      day,
      sort_order: i,
      time_label: b.time_label,
      category: b.category,
      description: b.description,
      hours: b.hours,
    }));

    const { error } = await supabase.from("template_blocks").insert(rows);

    if (error) {
      console.error(`✗ ${day}: ${error.message}`);
    } else {
      console.log(`  ✓ ${day}: ${rows.length} blocks`);
      total += rows.length;
    }
  }

  console.log(`\n✅ Seeded ${total} blocks across ${DAYS.length} days.`);
  console.log("   Your schedule is now in Supabase.\n");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
