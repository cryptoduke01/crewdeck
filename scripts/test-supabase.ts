/**
 * Test script to verify Supabase connection
 * Run with: pnpm tsx scripts/test-supabase.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local file
config({ path: resolve(process.cwd(), ".env.local") });

import { createSupabaseClient } from "../lib/supabase/client";

async function testConnection() {
  console.log("🔍 Testing Supabase connection...\n");

  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing environment variables!");
    console.log("Make sure you have:");
    console.log("  - NEXT_PUBLIC_SUPABASE_URL");
    console.log("  - NEXT_PUBLIC_SUPABASE_ANON_KEY");
    console.log("\nIn your .env.local file");
    process.exit(1);
  }

  if (supabaseUrl === "your_supabase_project_url" || supabaseKey === "your_supabase_anon_key") {
    console.error("❌ Please update your .env.local with actual Supabase credentials!");
    process.exit(1);
  }

  console.log("✅ Environment variables found");
  console.log(`   URL: ${supabaseUrl}\n`);

  try {
    const supabase = createSupabaseClient();

    // Test 1: Check connection
    console.log("📡 Testing connection...");
    const { data: healthCheck, error: healthError } = await supabase
      .from("agencies")
      .select("count")
      .limit(1);

    if (healthError) {
      if (healthError.message.includes("relation") || healthError.message.includes("does not exist")) {
        console.error("❌ Tables not found!");
        console.log("\n💡 Run the SQL from Step 5 in SUPABASE_SETUP.md to create tables");
      } else {
        console.error("❌ Connection failed:", healthError.message);
      }
      process.exit(1);
    }

    console.log("✅ Connection successful!\n");

    // Test 2: Count agencies
    console.log("📊 Counting agencies...");
    const { count, error: countError } = await supabase
      .from("agencies")
      .select("*", { count: "exact", head: true })
      .eq("verified", true);

    if (countError) {
      console.error("❌ Error counting agencies:", countError.message);
      process.exit(1);
    }

    console.log(`✅ Found ${count || 0} verified agencies\n`);

    // Test 3: Fetch sample agency
    console.log("🔍 Fetching sample agency...");
    const { data: agencies, error: fetchError } = await supabase
      .from("agencies")
      .select("*")
      .eq("verified", true)
      .limit(1);

    if (fetchError) {
      console.error("❌ Error fetching agencies:", fetchError.message);
      process.exit(1);
    }

    if (agencies && agencies.length > 0) {
      console.log("✅ Sample agency found:");
      console.log(`   Name: ${agencies[0].name}`);
      console.log(`   Niche: ${agencies[0].niche}`);
      console.log(`   Location: ${agencies[0].location || "N/A"}`);
    } else {
      console.log("⚠️  No agencies found (this is okay if you haven't added data yet)");
    }

    console.log("\n🎉 All tests passed! Your Supabase setup is working correctly.");
    console.log("\n💡 Next steps:");
    console.log("   1. Add more agencies via Supabase dashboard or SQL");
    console.log("   2. Visit http://localhost:3000/agencies to see them");
    console.log("   3. Set up authentication if needed");

  } catch (error) {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  }
}

testConnection();
