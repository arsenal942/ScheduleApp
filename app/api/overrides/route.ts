import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { resolveRole } from "@/lib/roles";
import {
  getEffectiveBlocks,
  getOverrideDays,
  createOverride,
  deleteOverride,
  logAudit,
} from "@/lib/schedule-db";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

async function getSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const role = resolveRole(session.user.email);
  if (!role) return null;
  return { email: session.user.email, role };
}

// GET /api/overrides?week=2026-03-09&day=Monday
// Returns effective blocks (override if exists, else template)
// Also returns which days have overrides for the week
export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) return json({ error: "Unauthorized" }, 401);

  const weekStart = req.nextUrl.searchParams.get("week");
  const day = req.nextUrl.searchParams.get("day") as any;

  if (!weekStart) return json({ error: "Missing week param" }, 400);

  try {
    if (day) {
      const result = await getEffectiveBlocks(day, weekStart);
      return json(result);
    }

    // Return override days for the whole week
    const overrideDays = await getOverrideDays(weekStart);
    return json({ overrideDays });
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
}

// POST /api/overrides — create override for a week+day
// Body: { weekStart, day, blocks: [...], note? }
export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return json({ error: "Unauthorized" }, 401);

  try {
    const body = await req.json();
    const { weekStart, day, blocks, note } = body;

    if (!weekStart || !day || !blocks?.length) {
      return json({ error: "Missing weekStart, day, or blocks" }, 400);
    }

    const result = await createOverride(weekStart, day, blocks, user.email, note);

    await logAudit({
      action: "override_create",
      table_name: "week_overrides",
      day,
      details: { weekStart, blockCount: blocks.length, note },
      performed_by: user.email,
    });

    return json({ blocks: result }, 201);
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
}

// DELETE /api/overrides?week=2026-03-09&day=Monday
// Reverts to template
export async function DELETE(req: NextRequest) {
  const user = await getSession();
  if (!user) return json({ error: "Unauthorized" }, 401);

  const weekStart = req.nextUrl.searchParams.get("week");
  const day = req.nextUrl.searchParams.get("day");

  if (!weekStart || !day) {
    return json({ error: "Missing week or day" }, 400);
  }

  try {
    await deleteOverride(weekStart, day);

    await logAudit({
      action: "override_delete",
      table_name: "week_overrides",
      day,
      details: { weekStart },
      performed_by: user.email,
    });

    return json({ reverted: true });
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
}
