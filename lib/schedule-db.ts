import { supabase } from "./supabase";
import type { Block, DayName } from "./schedule-data";

// ── Template Blocks ──

export async function getTemplateBlocks(day?: DayName): Promise<Block[]> {
  let query = supabase
    .from("template_blocks")
    .select("*")
    .order("sort_order", { ascending: true });

  if (day) query = query.eq("day", day);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(row => ({
    id: row.id,
    day: row.day,
    sort_order: row.sort_order,
    time_label: row.time_label,
    category: row.category,
    description: row.description,
    hours: Number(row.hours),
  }));
}

export async function createBlock(block: {
  day: string;
  sort_order: number;
  time_label: string;
  category: string;
  description: string;
  hours: number;
}): Promise<Block> {
  const { data, error } = await supabase
    .from("template_blocks")
    .insert(block)
    .select()
    .single();
  if (error) throw error;
  return { ...data, hours: Number(data.hours) };
}

export async function updateBlock(
  id: string,
  updates: Partial<{
    time_label: string;
    category: string;
    description: string;
    hours: number;
    sort_order: number;
  }>
): Promise<Block> {
  const { data, error } = await supabase
    .from("template_blocks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return { ...data, hours: Number(data.hours) };
}

export async function deleteBlock(id: string): Promise<void> {
  const { error } = await supabase
    .from("template_blocks")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function reorderBlocks(
  day: string,
  orderedIds: string[]
): Promise<void> {
  // Update sort_order for each block
  const updates = orderedIds.map((id, i) =>
    supabase
      .from("template_blocks")
      .update({ sort_order: i })
      .eq("id", id)
  );
  const results = await Promise.all(updates);
  const failed = results.find(r => r.error);
  if (failed?.error) throw failed.error;
}

// ── Week Overrides ──

export function getWeekStart(date: Date): string {
  const d = new Date(date);
  const dayOfWeek = d.getDay();
  const diff = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

export async function getOverrideBlocks(
  weekStart: string,
  day: DayName
): Promise<Block[] | null> {
  const { data, error } = await supabase
    .from("week_overrides")
    .select("*")
    .eq("week_start", weekStart)
    .eq("day", day)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  if (!data || data.length === 0) return null; // No override — use template
  return data.map(row => ({
    id: row.id,
    day: row.day,
    sort_order: row.sort_order,
    time_label: row.time_label,
    category: row.category,
    description: row.description,
    hours: Number(row.hours),
  }));
}

export async function createOverride(
  weekStart: string,
  day: string,
  blocks: Omit<Block, "id" | "day" | "sort_order">[],
  createdBy: string,
  note?: string
): Promise<Block[]> {
  // Delete any existing override for this week+day first
  await supabase
    .from("week_overrides")
    .delete()
    .eq("week_start", weekStart)
    .eq("day", day);

  const rows = blocks.map((b, i) => ({
    week_start: weekStart,
    day,
    sort_order: i,
    time_label: b.time_label,
    category: b.category,
    description: b.description,
    hours: b.hours,
    note: note || null,
    created_by: createdBy,
  }));

  const { data, error } = await supabase
    .from("week_overrides")
    .insert(rows)
    .select();

  if (error) throw error;
  return (data || []).map(row => ({
    id: row.id,
    day: row.day,
    sort_order: row.sort_order,
    time_label: row.time_label,
    category: row.category,
    description: row.description,
    hours: Number(row.hours),
  }));
}

export async function deleteOverride(
  weekStart: string,
  day: string
): Promise<void> {
  const { error } = await supabase
    .from("week_overrides")
    .delete()
    .eq("week_start", weekStart)
    .eq("day", day);
  if (error) throw error;
}

export async function getOverrideDays(
  weekStart: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from("week_overrides")
    .select("day")
    .eq("week_start", weekStart);

  if (error) throw error;
  return Array.from(new Set((data || []).map(r => r.day)));
}

// ── Audit ──

export async function logAudit(entry: {
  action: string;
  table_name: string;
  record_id?: string;
  day?: string;
  details?: Record<string, any>;
  performed_by: string;
}): Promise<void> {
  await supabase.from("schedule_audit").insert(entry);
}

// ── Effective Schedule ──
// Returns the blocks for a given day, respecting overrides

export async function getEffectiveBlocks(
  day: DayName,
  weekStart?: string
): Promise<{ blocks: Block[]; isOverride: boolean }> {
  if (weekStart) {
    const overrides = await getOverrideBlocks(weekStart, day);
    if (overrides) {
      return { blocks: overrides, isOverride: true };
    }
  }

  const template = await getTemplateBlocks(day);
  return { blocks: template, isOverride: false };
}
