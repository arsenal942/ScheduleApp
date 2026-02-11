"use client";

import { useState, useEffect } from "react";
import { CATEGORIES, CATEGORY_OPTIONS, type Category, type Block } from "@/lib/schedule-data";

interface Props {
  block: Block | null;          // null = creating new block
  onSave: (block: Omit<Block, "id" | "day" | "sort_order">) => void;
  onDelete?: () => void;
  onClose: () => void;
}

const s = {
  overlay: {
    position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
    zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center",
    padding: 20,
  },
  panel: {
    width: "100%", maxWidth: 480, background: "#111113",
    border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14,
    padding: 20, maxHeight: "85vh", overflowY: "auto" as const,
  },
  label: {
    fontSize: 11, fontWeight: 600 as const, color: "#52525b",
    textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 6, display: "block",
  },
  input: {
    width: "100%", padding: "10px 12px", background: "#0a0a0b",
    border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8,
    color: "#e4e4e7", fontSize: 14, fontFamily: "inherit",
    outline: "none", marginBottom: 16, boxSizing: "border-box" as const,
  },
  select: {
    width: "100%", padding: "10px 12px", background: "#0a0a0b",
    border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8,
    color: "#e4e4e7", fontSize: 14, fontFamily: "inherit",
    outline: "none", marginBottom: 16, boxSizing: "border-box" as const,
    cursor: "pointer",
  },
  row: { display: "flex", gap: 10 },
  btnPrimary: {
    flex: 1, padding: "11px 16px", background: "#fafafa", color: "#0a0a0b",
    border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600 as const,
    cursor: "pointer", fontFamily: "inherit",
  },
  btnSecondary: {
    flex: 1, padding: "11px 16px", background: "#1e1e21", color: "#71717a",
    border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8,
    fontSize: 13, fontWeight: 500 as const, cursor: "pointer", fontFamily: "inherit",
  },
  btnDanger: {
    padding: "11px 16px", background: "transparent", color: "#ef4444",
    border: "1px solid #7f1d1d44", borderRadius: 8,
    fontSize: 13, fontWeight: 500 as const, cursor: "pointer", fontFamily: "inherit",
    marginTop: 8, width: "100%",
  },
};

export default function BlockEditor({ block, onSave, onDelete, onClose }: Props) {
  const [timeLabel, setTimeLabel] = useState(block?.time_label || "");
  const [category, setCategory] = useState<Category>(block?.category || "personal");
  const [description, setDescription] = useState(block?.description || "");
  const [hours, setHours] = useState(block?.hours?.toString() || "1");

  const isNew = !block;
  const cat = CATEGORIES[category];

  function handleSave() {
    const h = parseFloat(hours);
    if (!timeLabel || !description || isNaN(h) || h <= 0) return;
    onSave({ time_label: timeLabel, category, description, hours: h });
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.panel} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fafafa", margin: 0, letterSpacing: "-0.02em" }}>
            {isNew ? "Add Block" : "Edit Block"}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#3f3f46", fontSize: 20, cursor: "pointer", padding: 4, lineHeight: 1 }}>×</button>
        </div>

        <label style={s.label}>Time</label>
        <input
          style={s.input}
          value={timeLabel}
          onChange={(e) => setTimeLabel(e.target.value)}
          placeholder="e.g. 7:00 – 8:30 AM"
        />

        <label style={s.label}>Category</label>
        <select
          style={s.select}
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
        >
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c}>{CATEGORIES[c].icon} {CATEGORIES[c].label}</option>
          ))}
        </select>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: -10, marginBottom: 16 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: cat.color }} />
          <span style={{ fontSize: 11, color: "#52525b" }}>{cat.label}</span>
        </div>

        <label style={s.label}>Description</label>
        <input
          style={s.input}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Deep work — product strategy"
        />

        <label style={s.label}>Hours</label>
        <input
          style={{ ...s.input, width: 120 }}
          type="number"
          step="0.25"
          min="0.25"
          max="12"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
        />

        <div style={s.row}>
          <button style={s.btnSecondary} onClick={onClose}>Cancel</button>
          <button style={s.btnPrimary} onClick={handleSave}>
            {isNew ? "Add Block" : "Save Changes"}
          </button>
        </div>

        {!isNew && onDelete && (
          <button style={s.btnDanger} onClick={onDelete}>
            Delete Block
          </button>
        )}
      </div>
    </div>
  );
}
