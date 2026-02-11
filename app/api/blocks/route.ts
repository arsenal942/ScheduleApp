import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { resolveRole } from "@/lib/roles";
import {
  getTemplateBlocks,
  createBlock,
  updateBlock,
  deleteBlock,
  reorderBlocks,
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

// GET /api/blocks?day=Monday
export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user) return json({ error: "Unauthorized" }, 401);

  const day = req.nextUrl.searchParams.get("day") as any;

  try {
    const blocks = await getTemplateBlocks(day || undefined);
    return json({ blocks });
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
}

// POST /api/blocks — create new block
// Body: { day, sort_order, time_label, category, description, hours }
export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return json({ error: "Unauthorized" }, 401);

  try {
    const body = await req.json();
    const { day, sort_order, time_label, category, description, hours } = body;

    if (!day || sort_order == null || !time_label || !category || !description || hours == null) {
      return json({ error: "Missing required fields" }, 400);
    }

    const block = await createBlock({
      day, sort_order, time_label, category, description, hours,
    });

    await logAudit({
      action: "create",
      table_name: "template_blocks",
      record_id: block.id,
      day,
      details: body,
      performed_by: user.email,
    });

    return json({ block }, 201);
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
}

// PATCH /api/blocks — update block or reorder
// Body: { id, ...updates } OR { action: "reorder", day, orderedIds: [...] }
export async function PATCH(req: NextRequest) {
  const user = await getSession();
  if (!user) return json({ error: "Unauthorized" }, 401);

  try {
    const body = await req.json();

    if (body.action === "reorder") {
      const { day, orderedIds } = body;
      if (!day || !orderedIds?.length) {
        return json({ error: "Missing day or orderedIds" }, 400);
      }

      await reorderBlocks(day, orderedIds);

      await logAudit({
        action: "reorder",
        table_name: "template_blocks",
        day,
        details: { orderedIds },
        performed_by: user.email,
      });

      return json({ success: true });
    }

    // Regular update
    const { id, ...updates } = body;
    if (!id) return json({ error: "Missing block id" }, 400);

    const block = await updateBlock(id, updates);

    await logAudit({
      action: "update",
      table_name: "template_blocks",
      record_id: id,
      details: updates,
      performed_by: user.email,
    });

    return json({ block });
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
}

// DELETE /api/blocks?id=X
export async function DELETE(req: NextRequest) {
  const user = await getSession();
  if (!user) return json({ error: "Unauthorized" }, 401);

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return json({ error: "Missing block id" }, 400);

  try {
    await deleteBlock(id);

    await logAudit({
      action: "delete",
      table_name: "template_blocks",
      record_id: id,
      performed_by: user.email,
    });

    return json({ deleted: true });
  } catch (err: any) {
    return json({ error: err.message }, 500);
  }
}
