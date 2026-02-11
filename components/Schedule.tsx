"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { signOut } from "next-auth/react";
import {
  CATEGORIES, DAYS, DAY_TAGS, resolveCategory,
  type Category, type DayName, type Block,
} from "@/lib/schedule-data";
import type { UserRole } from "@/lib/roles";
import BlockEditor from "./BlockEditor";

// ── Constants ──

const TAG_META = {
  office: { label: "In Office", color: "#22c55e", bg: "#22c55e14" },
  remote: { label: "Remote", color: "#3b82f6", bg: "#3b82f614" },
  weekend: { label: "Weekend", color: "#eab308", bg: "#eab30814" },
} as const;

const ROLE_META: Record<UserRole, { label: string; color: string; bg: string }> = {
  owner: { label: "Owner", color: "#fafafa", bg: "#27272a" },
  ea: { label: "EA", color: "#a78bfa", bg: "#a855f714" },
};

const TRACKED = ["immutable", "engineroom", "fitfocus", "gym"] as const;
const PILL_KEYS = ["immutable", "engineroom", "fitfocus", "gym", "life"] as const;
const TARGETS: Record<string, number | null> = { immutable: 38, engineroom: 20, fitfocus: 21, gym: null };

function agg(blocks: { category: Category; hours: number }[]): Record<string, number> {
  const t: Record<string, number> = {};
  blocks.forEach(({ category: c, hours: h }) => { const k = resolveCategory(c); t[k] = (t[k] || 0) + h; });
  return t;
}
const f = (n: number) => (n % 1 === 0 ? n.toString() : n.toFixed(1));

function getTodayName(): DayName { const d = new Date().getDay(); return DAYS[d === 0 ? 6 : d - 1]; }

function getWeekStart(d = new Date()): string {
  const dt = new Date(d); const dow = dt.getDay();
  dt.setDate(dt.getDate() - dow + (dow === 0 ? -6 : 1));
  return dt.toISOString().split("T")[0];
}

// ── Component ──

interface Props { userName?: string; userEmail: string; role: UserRole; }

export default function Schedule({ userName, userEmail, role }: Props) {
  const [active, setActive] = useState<DayName>(getTodayName);
  const [blocks, setBlocks] = useState<Record<string, Block[]>>({});
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editorBlock, setEditorBlock] = useState<Block | null | "new">(null);
  const [addAfterIdx, setAddAfterIdx] = useState<number>(-1);
  const [saving, setSaving] = useState(false);
  const [weekStart] = useState(getWeekStart);
  const [overrideDays, setOverrideDays] = useState<string[]>([]);
  const [isOverride, setIsOverride] = useState(false);

  const roleMeta = ROLE_META[role];
  const tag = TAG_META[DAY_TAGS[active]];
  const dayBlocks = blocks[active] || [];

  // ── Data Fetching ──

  const fetchAllBlocks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/blocks");
      const data = await res.json();
      if (data.blocks) {
        const grouped: Record<string, Block[]> = {};
        for (const b of data.blocks) {
          if (!grouped[b.day]) grouped[b.day] = [];
          grouped[b.day].push(b);
        }
        for (const day of DAYS) {
          if (grouped[day]) grouped[day].sort((a: Block, b: Block) => (a.sort_order || 0) - (b.sort_order || 0));
        }
        setBlocks(grouped);
      }
    } catch (err) { console.error("Failed to load blocks:", err); }
    setLoading(false);
  }, []);

  const fetchOverrideInfo = useCallback(async () => {
    try {
      const res = await fetch(`/api/overrides?week=${weekStart}`);
      const data = await res.json();
      if (data.overrideDays) setOverrideDays(data.overrideDays);
    } catch {}
  }, [weekStart]);

  const fetchDayBlocks = useCallback(async (day: DayName) => {
    try {
      const res = await fetch(`/api/overrides?week=${weekStart}&day=${day}`);
      const data = await res.json();
      if (data.blocks) {
        setBlocks(prev => ({ ...prev, [day]: data.blocks }));
        setIsOverride(data.isOverride);
      }
    } catch {}
  }, [weekStart]);

  useEffect(() => { fetchAllBlocks(); fetchOverrideInfo(); }, [fetchAllBlocks, fetchOverrideInfo]);
  useEffect(() => { fetchDayBlocks(active); }, [active, fetchDayBlocks]);

  // ── Weekly Totals ──

  const weekly = useMemo(() => {
    const all = Object.values(blocks).flat();
    return agg(all as any);
  }, [blocks]);

  const daily = useMemo(() => agg(dayBlocks as any), [dayBlocks]);

  // ── Block CRUD ──

  async function handleSaveBlock(data: Omit<Block, "id" | "day" | "sort_order">) {
    setSaving(true);
    try {
      if (editorBlock === "new") {
        // Creating new block
        const sortOrder = addAfterIdx >= 0 ? addAfterIdx + 1 : dayBlocks.length;
        // Shift subsequent blocks
        if (addAfterIdx >= 0 && addAfterIdx < dayBlocks.length - 1) {
          const ordered = [...dayBlocks];
          ordered.splice(sortOrder, 0, { ...data, sort_order: sortOrder } as Block);
          const ids = ordered.filter(b => b.id).map(b => b.id!);
          // We'll do create then reorder
        }
        await fetch("/api/blocks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ day: active, sort_order: sortOrder, ...data }),
        });
      } else if (editorBlock && typeof editorBlock === "object" && editorBlock.id) {
        // Updating existing
        await fetch("/api/blocks", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editorBlock.id, ...data }),
        });
      }
      await fetchDayBlocks(active);
      await fetchAllBlocks();
    } catch (err) { console.error("Save failed:", err); }
    setSaving(false);
    setEditorBlock(null);
  }

  async function handleDeleteBlock() {
    if (!editorBlock || editorBlock === "new" || !editorBlock.id) return;
    setSaving(true);
    try {
      await fetch(`/api/blocks?id=${editorBlock.id}`, { method: "DELETE" });
      await fetchDayBlocks(active);
      await fetchAllBlocks();
    } catch (err) { console.error("Delete failed:", err); }
    setSaving(false);
    setEditorBlock(null);
  }

  async function handleMove(idx: number, direction: -1 | 1) {
    const target = idx + direction;
    if (target < 0 || target >= dayBlocks.length) return;
    const reordered = [...dayBlocks];
    [reordered[idx], reordered[target]] = [reordered[target], reordered[idx]];
    // Optimistic update
    setBlocks(prev => ({ ...prev, [active]: reordered }));
    try {
      await fetch("/api/blocks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reorder",
          day: active,
          orderedIds: reordered.map(b => b.id),
        }),
      });
    } catch (err) { console.error("Reorder failed:", err); }
  }

  // ── Override Actions ──

  async function createWeekOverride() {
    setSaving(true);
    try {
      const templateBlocks = dayBlocks.map(b => ({
        time_label: b.time_label, category: b.category,
        description: b.description, hours: b.hours,
      }));
      await fetch("/api/overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekStart, day: active, blocks: templateBlocks }),
      });
      await fetchDayBlocks(active);
      await fetchOverrideInfo();
      setIsOverride(true);
    } catch (err) { console.error("Override creation failed:", err); }
    setSaving(false);
  }

  async function revertOverride() {
    setSaving(true);
    try {
      await fetch(`/api/overrides?week=${weekStart}&day=${active}`, { method: "DELETE" });
      await fetchDayBlocks(active);
      await fetchOverrideInfo();
      setIsOverride(false);
    } catch (err) { console.error("Revert failed:", err); }
    setSaving(false);
  }

  // ── Render ──

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0b" }}>
      {/* Header */}
      <header style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 20px", height: 48,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, background: "rgba(10,10,11,0.92)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 18, height: 18, borderRadius: 4, background: "linear-gradient(135deg, #a855f7, #22c55e 60%, #f97316)" }} />
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.02em", color: "#fafafa" }}>Schedule</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: tag.color, background: tag.bg, padding: "3px 10px", borderRadius: 99, letterSpacing: "0.02em", textTransform: "uppercase" }}>{tag.label}</span>
          {/* Edit toggle */}
          <button
            onClick={() => setEditMode(!editMode)}
            style={{
              padding: "3px 10px", borderRadius: 99, fontSize: 10, fontWeight: 600,
              letterSpacing: "0.02em", textTransform: "uppercase", cursor: "pointer",
              fontFamily: "inherit", border: editMode ? "1px solid #f9731644" : "1px solid rgba(255,255,255,0.08)",
              background: editMode ? "#f9731614" : "transparent",
              color: editMode ? "#f97316" : "#3f3f46",
            }}
          >
            {editMode ? "Editing" : "Edit"}
          </button>
          {/* User pill */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#111113", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 99, padding: "3px 10px 3px 8px" }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: roleMeta.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: roleMeta.color }}>
              {(userName || userEmail)[0].toUpperCase()}
            </div>
            <span style={{ fontSize: 11, color: "#71717a", fontWeight: 500 }}>{userName?.split(" ")[0] || userEmail.split("@")[0]}</span>
            <span style={{ fontSize: 9, color: roleMeta.color, background: roleMeta.bg, padding: "1px 5px", borderRadius: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{roleMeta.label}</span>
          </div>
          <button onClick={() => signOut()} style={{ background: "none", border: "none", color: "#27272a", fontSize: 11, cursor: "pointer", fontFamily: "inherit", padding: "4px 0" }}>Sign out</button>
        </div>
      </header>

      <main style={{ padding: "18px 20px", maxWidth: 640, margin: "0 auto" }}>
        {/* Weekly Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 20 }}>
          {TRACKED.map((key) => {
            const c = CATEGORIES[key]; const hrs = weekly[key] || 0; const tgt = TARGETS[key];
            const hit = tgt !== null && Math.abs(hrs - tgt) < 1;
            return (
              <div key={key} style={{ background: "#111113", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 10px 10px", position: "relative" }}>
                <div style={{ position: "absolute", top: 0, left: 10, right: 10, height: 1.5, background: c.color, opacity: 0.4, borderRadius: 1 }} />
                <div style={{ fontSize: 10, color: "#52525b", fontWeight: 500, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ color: c.color, fontSize: 7 }}>{c.icon}</span>{c.label}
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.04em", color: "#fafafa", lineHeight: 1 }}>
                  {f(hrs)}<span style={{ fontSize: 11, fontWeight: 400, color: "#3f3f46" }}>h</span>
                </div>
                {tgt !== null && <div style={{ fontSize: 9.5, marginTop: 3, color: hit ? "#22c55e" : "#52525b", fontWeight: 500 }}>{hit ? "✓ " : ""}target {tgt}h</div>}
              </div>
            );
          })}
        </div>

        {/* Day Selector */}
        <div style={{ display: "flex", background: "#111113", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: 3, marginBottom: 20 }}>
          {DAYS.map((d) => {
            const sel = d === active; const hasOverride = overrideDays.includes(d);
            return (
              <button key={d} onClick={() => setActive(d)} style={{
                flex: 1, padding: "7px 2px 5px", border: "none", borderRadius: 7,
                background: sel ? "#1e1e21" : "transparent", color: sel ? "#fafafa" : "#3f3f46",
                cursor: "pointer", fontSize: 11.5, fontWeight: sel ? 600 : 400, fontFamily: "inherit", textAlign: "center", transition: "all 0.1s ease", position: "relative",
              }}>
                {d.slice(0, 3)}
                <div style={{ display: "flex", gap: 2, justifyContent: "center", marginTop: 3 }}>
                  {sel && <div style={{ width: 3.5, height: 3.5, borderRadius: "50%", background: TAG_META[DAY_TAGS[d]].color }} />}
                  {hasOverride && <div style={{ width: 3.5, height: 3.5, borderRadius: "50%", background: "#f97316" }} />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Day Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, letterSpacing: "-0.025em", color: "#fafafa" }}>{active}</h2>
          {editMode && (
            <div style={{ display: "flex", gap: 6 }}>
              {!isOverride ? (
                <button onClick={createWeekOverride} disabled={saving} style={{
                  padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600,
                  background: "#f9731614", border: "1px solid #f9731633", color: "#f97316",
                  cursor: "pointer", fontFamily: "inherit",
                }}>
                  Override this week
                </button>
              ) : (
                <button onClick={revertOverride} disabled={saving} style={{
                  padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600,
                  background: "#3b82f614", border: "1px solid #3b82f633", color: "#3b82f6",
                  cursor: "pointer", fontFamily: "inherit",
                }}>
                  Revert to template
                </button>
              )}
            </div>
          )}
        </div>

        {isOverride && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#f9731614", border: "1px solid #f9731633", borderRadius: 5, padding: "2px 8px", fontSize: 10, color: "#f97316", fontWeight: 600, marginBottom: 8 }}>
            ◆ Week override active
          </div>
        )}

        {/* Daily pills */}
        <div style={{ display: "flex", gap: 5, marginBottom: 16, flexWrap: "wrap" }}>
          {PILL_KEYS.map((k) => {
            const val = daily[k]; if (!val) return null;
            const c = CATEGORIES[k as Category]; if (!c) return null;
            return (
              <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#111113", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 5, padding: "2px 8px", fontSize: 10.5, color: "#71717a", fontWeight: 500 }}>
                <span style={{ color: c.color, fontSize: 6 }}>{c.icon}</span>{f(val)}h
              </span>
            );
          })}
        </div>

        {/* Loading state */}
        {loading && <div style={{ textAlign: "center", padding: 40, color: "#3f3f46", fontSize: 13 }}>Loading schedule…</div>}

        {/* Timeline */}
        {!loading && (
          <div style={{ position: "relative", paddingLeft: 18 }}>
            <div style={{ position: "absolute", left: 5.5, top: 14, bottom: 14, width: 1, background: "rgba(255,255,255,0.04)" }} />

            {dayBlocks.map((block, i) => {
              const c = CATEGORIES[block.category as Category] || CATEGORIES.personal;
              const isSleep = block.category === "sleep";
              const isPersonal = block.category === "personal";
              const isMeeting = block.category === "meeting";
              const isLife = block.category === "life";
              const isCommute = block.category === "commute_er" || block.category === "commute_ff";
              const muted = isSleep || isPersonal;

              return (
                <div key={block.id || i}>
                  <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 2, position: "relative" }}>
                    {/* Dot */}
                    <div style={{
                      position: "absolute", left: -12.5, top: muted ? 10 : 14, zIndex: 2,
                      width: muted ? 4 : isMeeting ? 8 : 6, height: muted ? 4 : isMeeting ? 8 : 6,
                      borderRadius: "50%",
                      background: isMeeting ? "transparent" : muted ? "#1e1e21" : c.color,
                      border: isMeeting ? `1.5px solid ${c.color}` : `2px solid #0a0a0b`,
                      boxShadow: muted ? "none" : `0 0 8px ${c.color}18`,
                    }} />

                    <div
                      onClick={() => editMode ? setEditorBlock(block) : undefined}
                      style={{
                        flex: 1, padding: muted ? "5px 12px" : "9px 12px",
                        background: muted ? "transparent" : isMeeting ? `${c.color}06` : isCommute ? "#0e0e10" : "#111113",
                        border: muted ? "none" : isMeeting ? `1px solid ${c.color}25` : isCommute ? "1px dashed rgba(255,255,255,0.06)" : "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 9, cursor: editMode ? "pointer" : "default",
                        transition: "all 0.1s ease",
                        ...(editMode && !muted ? { borderColor: "rgba(255,255,255,0.12)" } : {}),
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: muted ? 0 : 2 }}>
                        <span style={{ fontSize: 10.5, fontVariantNumeric: "tabular-nums", color: muted ? "#1e1e21" : "#3f3f46", fontWeight: 500, letterSpacing: "-0.01em" }}>{block.time_label}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {!muted && (
                            <span style={{ fontSize: 9.5, fontWeight: 600, color: c.color, opacity: 0.85, display: "flex", alignItems: "center", gap: 3 }}>
                              <span style={{ fontSize: 6 }}>{c.icon}</span>{c.label}
                              <span style={{ color: "#27272a", fontWeight: 400 }}> · {f(block.hours)}h</span>
                            </span>
                          )}
                          {editMode && (
                            <div style={{ display: "flex", gap: 2 }}>
                              <button disabled={i === 0} onClick={(e) => { e.stopPropagation(); handleMove(i, -1); }}
                                style={{ background: "none", border: "none", color: i === 0 ? "#1e1e21" : "#52525b", fontSize: 12, cursor: i === 0 ? "default" : "pointer", padding: "0 2px", lineHeight: 1 }}>↑</button>
                              <button disabled={i === dayBlocks.length - 1} onClick={(e) => { e.stopPropagation(); handleMove(i, 1); }}
                                style={{ background: "none", border: "none", color: i === dayBlocks.length - 1 ? "#1e1e21" : "#52525b", fontSize: 12, cursor: i === dayBlocks.length - 1 ? "default" : "pointer", padding: "0 2px", lineHeight: 1 }}>↓</button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{
                        fontSize: muted ? 11.5 : 13,
                        color: muted ? "#1e1e21" : isLife ? c.text : "#d4d4d8",
                        fontWeight: isLife ? 500 : 400, lineHeight: 1.4,
                      }}>
                        {block.description}
                      </div>
                    </div>
                  </div>

                  {/* Add block button between blocks (edit mode only) */}
                  {editMode && (
                    <div style={{ display: "flex", justifyContent: "center", margin: "1px 0", paddingLeft: 18 }}>
                      <button
                        onClick={() => { setAddAfterIdx(i); setEditorBlock("new"); }}
                        style={{
                          background: "none", border: "none", color: "#27272a", fontSize: 16,
                          cursor: "pointer", padding: "0 12px", lineHeight: 1,
                          transition: "color 0.1s",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "#52525b"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "#27272a"}
                      >+</button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add block at end */}
            {editMode && !loading && (
              <div style={{ paddingLeft: 0, marginTop: 8 }}>
                <button
                  onClick={() => { setAddAfterIdx(dayBlocks.length - 1); setEditorBlock("new"); }}
                  style={{
                    width: "100%", padding: "10px", background: "#111113",
                    border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 9,
                    color: "#3f3f46", fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  + Add block
                </button>
              </div>
            )}
          </div>
        )}

        {/* Invariants (view mode only) */}
        {!editMode && (
          <div style={{ marginTop: 24, background: "#111113", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#3f3f46", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Invariants</div>
            {[
              { i: "■", col: "#22c55e", t: "Immutable owns 9–5 weekdays. Protected." },
              { i: "▲", col: "#a855f7", t: "EngineRoom = 20h/wk exact. Weekday-heavy: commute BAU + evening deep work + remote mornings." },
              { i: "●", col: "#f97316", t: "FitFocus = 21h/wk. Light weekday BAU (2h/day), heavy weekend deep work (5.5h/day)." },
              { i: "→", col: "#64748b", t: "Commute = productive. Morning train → ER. Evening train → FF." },
              { i: "◇", col: "#06b6d4", t: "Life blocks non-negotiable: Wed & Sat soccer, Fri date night, Sun church." },
              { i: "◆", col: "#3b82f6", t: "5 AM gym. 11 PM sleep. Every day." },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 9, marginBottom: i < 5 ? 9 : 0, fontSize: 11.5, lineHeight: 1.5, color: "#71717a" }}>
                <span style={{ color: r.col, fontSize: 8, flexShrink: 0, paddingTop: 4 }}>{r.i}</span>
                <span>{r.t}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: "center", fontSize: 9.5, color: "#1e1e21", marginTop: 20, paddingBottom: 24, letterSpacing: "0.04em" }}>
          ER {f(weekly.engineroom || 0)}h · FF {f(weekly.fitfocus || 0)}h · Immutable {f(weekly.immutable || 0)}h · Gym {f(weekly.gym || 0)}h
        </div>
      </main>

      {/* Block Editor Modal */}
      {editorBlock !== null && (
        <BlockEditor
          block={editorBlock === "new" ? null : editorBlock}
          onSave={handleSaveBlock}
          onDelete={editorBlock !== "new" ? handleDeleteBlock : undefined}
          onClose={() => setEditorBlock(null)}
        />
      )}
    </div>
  );
}
