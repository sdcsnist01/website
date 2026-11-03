import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const raw = readFileSync(envPath, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    /* ignore */
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  let year = 2026;
  let file = resolve(process.cwd(), "scripts/data/members-2026.json");

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--year" && args[i + 1]) {
      year = Number(args[++i]);
    } else if (args[i] === "--file" && args[i + 1]) {
      file = resolve(process.cwd(), args[++i]);
    }
  }

  if (!Number.isInteger(year) || year < 2020 || year > 2100) {
    throw new Error("Invalid --year (use e.g. 2025 or 2026)");
  }

  return { year, file };
}

loadEnv();

const { year: membershipYear, file: dataFile } = parseArgs();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let MEMBERS;
try {
  MEMBERS = JSON.parse(readFileSync(dataFile, "utf8"));
} catch (e) {
  console.error(`Could not read ${dataFile}:`, e.message);
  process.exit(1);
}

if (!Array.isArray(MEMBERS) || MEMBERS.length === 0) {
  console.error(`No members in ${dataFile}. Add rows, then run again.`);
  process.exit(1);
}

async function generateMemberId() {
  for (let i = 0; i < 30; i++) {
    const id = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("");
    const { data } = await admin.from("sdc_members").select("id").eq("member_id", id).maybeSingle();
    if (!data) return id;
  }
  throw new Error("Could not generate member id");
}

async function main() {
  console.log(`Importing ${MEMBERS.length} members → cohort ${membershipYear} (${dataFile})\n`);

  const results = [];

  for (const m of MEMBERS) {
    const email = m.email.trim().toLowerCase();
    const roll = m.roll_number.trim().toUpperCase();

    const { data: existing } = await admin
      .from("sdc_members")
      .select("member_id, email, roll_number, membership_year")
      .or(`email.eq.${email},roll_number.eq.${roll}`)
      .maybeSingle();

    if (existing) {
      results.push({
        ...m,
        status: "skipped",
        member_id: existing.member_id,
        note: `already exists (${existing.membership_year} cohort)`,
      });
      continue;
    }

    const tempPassword = `SDC-${Math.random().toString(36).slice(2, 10)}!1A`;

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: m.full_name, roll_number: roll, phone: m.phone, membership_year: membershipYear },
    });

    if (authError || !authData.user) {
      results.push({ ...m, status: "error", note: authError?.message ?? "auth failed" });
      continue;
    }

    const memberId = await generateMemberId();

    const { error: insertError } = await admin.from("sdc_members").insert({
      id: authData.user.id,
      member_id: memberId,
      roll_number: roll,
      email,
      phone: m.phone,
      full_name: m.full_name,
      membership_year: membershipYear,
      amount_paise: 19900,
      currency: "INR",
      status: "active",
    });

    if (insertError) {
      results.push({ ...m, status: "error", note: insertError.message });
      await admin.auth.admin.deleteUser(authData.user.id);
      continue;
    }

    await admin.from("profiles").update({ full_name: m.full_name }).eq("id", authData.user.id);

    results.push({ ...m, status: "imported", member_id: memberId, membership_year: membershipYear });
  }

  console.log(JSON.stringify(results, null, 2));
  const imported = results.filter((r) => r.status === "imported").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  const errors = results.filter((r) => r.status === "error").length;
  console.log(`\nDone (${membershipYear}): ${imported} imported, ${skipped} skipped, ${errors} errors`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
