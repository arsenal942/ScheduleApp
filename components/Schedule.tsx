"use client";

import { useState, useMemo } from "react";
import { signOut } from "next-auth/react";
import {
  CATEGORIES,
  SCHEDULE,
  DAYS,
  resolveCategory,
  type Category,
  type DayName,
} from "@/lib/schedule-data";
import type { UserRole } from "@/lib/roles";

const TAG_META = {
  office: { label: "In Office", color: "#22c55e", bg: "#22c55e14" },
  remote: { label: "Remote", color: "#3b82f6", bg: "#3b82f614" },
  weekend: { label: "Weekend", color: "#eab308", bg: "#eab30814" },
} as const;

const ROLE_META: Record<UserRole, { label: string; color: string; bg: string }> = {
  owner: { label: "Owner", color: "#fafafa", bg: "#27272a" },
  ea: { label: "EA", color: "#a78bfa", bg: "#a855f714" },
};

const TRACKED_KEYS = ["immutable", "engineroom", "fitfocus", "gym"] as const;
const DAILY_PILLS = ["immutable", "engineroom", "fitfocus", "gym", "life"] as const;
const TARGETS: Record<string, number | null> = {
  immutable: 38,
  engineroom: 20,
  fitfocus: 21,
  gym: null,
};

function aggregate(blocks: { c: Category; h: number }[]): Record<string, number> {
  const t: Record<string, number> = {};
  blocks.forEach(({ c, h }) => {
    const k = resolveCategory(c);
    t[k] = (t[k] || 0) + h;
  });
  return t;
}

const f = (n: number) => (n % 1 === 0 ? n.toString() : n.toFixed(1));

function getTodayName(): DayName {
  const d = new Date().getDay();
  return DAYS[d === 0 ? 6 : d - 1];
}

interface Props {
  userName?: string;
  userEmail: string;
  role: UserRole;
}

export default function Schedule({ userName, userEmail, role }: Props) {
  const [active, setActive] = useState<DayName>(getTodayName);
  const roleMeta = ROLE_META[role];

  const weekly = useMemo(() => {
    const all = Object.values(SCHEDULE).flatMap((d) => d.blocks);
    return aggregate(all);
  }, []);

  const daily = useMemo(() => aggregate(SCHEDULE[active].blocks), [active]);
  const day = SCHEDULE[active];
  const tag = TAG_META[day.tag];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0b" }}>
      {/* ── Header ── */}
      <header
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "0 20px",
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          background: "rgba(10,10,11,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              background:
                "linear-gradient(135deg, #a855f7, #22c55e 60%, #f97316)",
            }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "#fafafa",
            }}
          >
            Schedule
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: tag.color,
              background: tag.bg,
              padding: "3px 10px",
              borderRadius: 99,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
            }}
          >
            {tag.label}
          </span>
          {/* User pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#111113",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 99,
              padding: "3px 10px 3px 8px",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: roleMeta.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 9,
                fontWeight: 700,
                color: roleMeta.color,
              }}
            >
              {(userName || userEmail)[0].toUpperCase()}
            </div>
            <span style={{ fontSize: 11, color: "#71717a", fontWeight: 500 }}>
              {userName?.split(" ")[0] || userEmail.split("@")[0]}
            </span>
            <span
              style={{
                fontSize: 9,
                color: roleMeta.color,
                background: roleMeta.bg,
                padding: "1px 5px",
                borderRadius: 4,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {roleMeta.label}
            </span>
          </div>
          <button
            onClick={() => signOut()}
            style={{
              background: "none",
              border: "none",
              color: "#27272a",
              fontSize: 11,
              cursor: "pointer",
              fontFamily: "inherit",
              padding: "4px 0",
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      <main style={{ padding: "18px 20px", maxWidth: 640, margin: "0 auto" }}>
        {/* ── Weekly Summary ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 6,
            marginBottom: 20,
          }}
        >
          {TRACKED_KEYS.map((key) => {
            const c = CATEGORIES[key];
            const hrs = weekly[key] || 0;
            const tgt = TARGETS[key];
            const hit = tgt !== null && Math.abs(hrs - tgt) < 1;
            return (
              <div
                key={key}
                style={{
                  background: "#111113",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 10,
                  padding: "12px 10px 10px",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 10,
                    right: 10,
                    height: 1.5,
                    background: c.color,
                    opacity: 0.4,
                    borderRadius: 1,
                  }}
                />
                <div
                  style={{
                    fontSize: 10,
                    color: "#52525b",
                    fontWeight: 500,
                    marginBottom: 6,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span style={{ color: c.color, fontSize: 7 }}>{c.icon}</span>
                  {c.label}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                    color: "#fafafa",
                    lineHeight: 1,
                  }}
                >
                  {f(hrs)}
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 400,
                      color: "#3f3f46",
                    }}
                  >
                    h
                  </span>
                </div>
                {tgt !== null && (
                  <div
                    style={{
                      fontSize: 9.5,
                      marginTop: 3,
                      color: hit ? "#22c55e" : "#52525b",
                      fontWeight: 500,
                    }}
                  >
                    {hit ? "✓ " : ""}target {tgt}h
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Day Selector ── */}
        <div
          style={{
            display: "flex",
            background: "#111113",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 10,
            padding: 3,
            marginBottom: 20,
          }}
        >
          {DAYS.map((d) => {
            const sel = d === active;
            return (
              <button
                key={d}
                onClick={() => setActive(d)}
                style={{
                  flex: 1,
                  padding: "7px 2px 5px",
                  border: "none",
                  borderRadius: 7,
                  background: sel ? "#1e1e21" : "transparent",
                  color: sel ? "#fafafa" : "#3f3f46",
                  cursor: "pointer",
                  fontSize: 11.5,
                  fontWeight: sel ? 600 : 400,
                  fontFamily: "inherit",
                  textAlign: "center",
                  transition: "all 0.1s ease",
                }}
              >
                {d.slice(0, 3)}
                {sel && (
                  <div
                    style={{
                      width: 3.5,
                      height: 3.5,
                      borderRadius: "50%",
                      background: TAG_META[SCHEDULE[d].tag].color,
                      margin: "3px auto 0",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Day Header ── */}
        <h2
          style={{
            fontSize: 17,
            fontWeight: 700,
            margin: "0 0 6px",
            letterSpacing: "-0.025em",
            color: "#fafafa",
          }}
        >
          {active}
        </h2>
        <div
          style={{
            display: "flex",
            gap: 5,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          {DAILY_PILLS.map((k) => {
            const val = daily[k];
            if (!val) return null;
            const c = CATEGORIES[k as Category];
            if (!c) return null;
            return (
              <span
                key={k}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  background: "#111113",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 5,
                  padding: "2px 8px",
                  fontSize: 10.5,
                  color: "#71717a",
                  fontWeight: 500,
                }}
              >
                <span style={{ color: c.color, fontSize: 6 }}>{c.icon}</span>
                {f(val)}h
              </span>
            );
          })}
        </div>

        {/* ── Timeline ── */}
        <div style={{ position: "relative", paddingLeft: 18 }}>
          <div
            style={{
              position: "absolute",
              left: 5.5,
              top: 14,
              bottom: 14,
              width: 1,
              background: "rgba(255,255,255,0.04)",
            }}
          />

          {day.blocks.map((block, i) => {
            const c = CATEGORIES[block.c];
            const isSleep = block.c === "sleep";
            const isPersonal = block.c === "personal";
            const isMeeting = block.c === "meeting";
            const isLife = block.c === "life";
            const isCommute =
              block.c === "commute_er" || block.c === "commute_ff";
            const muted = isSleep || isPersonal;

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  marginBottom: 2,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: -12.5,
                    top: muted ? 10 : 14,
                    zIndex: 2,
                    width: muted ? 4 : isMeeting ? 8 : 6,
                    height: muted ? 4 : isMeeting ? 8 : 6,
                    borderRadius: "50%",
                    background: isMeeting
                      ? "transparent"
                      : muted
                      ? "#1e1e21"
                      : c.color,
                    border: isMeeting
                      ? `1.5px solid ${c.color}`
                      : `2px solid #0a0a0b`,
                    boxShadow: muted ? "none" : `0 0 8px ${c.color}18`,
                  }}
                />

                <div
                  style={{
                    flex: 1,
                    padding: muted ? "5px 12px" : "9px 12px",
                    background: muted
                      ? "transparent"
                      : isMeeting
                      ? `${c.color}06`
                      : isCommute
                      ? "#0e0e10"
                      : "#111113",
                    border: muted
                      ? "none"
                      : isMeeting
                      ? `1px solid ${c.color}25`
                      : isCommute
                      ? "1px dashed rgba(255,255,255,0.06)"
                      : "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 9,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: muted ? 0 : 2,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10.5,
                        fontVariantNumeric: "tabular-nums",
                        color: muted ? "#1e1e21" : "#3f3f46",
                        fontWeight: 500,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {block.t}
                    </span>
                    {!muted && (
                      <span
                        style={{
                          fontSize: 9.5,
                          fontWeight: 600,
                          color: c.color,
                          opacity: 0.85,
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        <span style={{ fontSize: 6 }}>{c.icon}</span>
                        {c.label}
                        <span style={{ color: "#27272a", fontWeight: 400 }}>
                          {" "}· {f(block.h)}h
                        </span>
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: muted ? 11.5 : 13,
                      color: muted
                        ? "#1e1e21"
                        : isLife
                        ? c.text
                        : "#d4d4d8",
                      fontWeight: isLife ? 500 : 400,
                      lineHeight: 1.4,
                    }}
                  >
                    {block.d}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Invariants ── */}
        <div
          style={{
            marginTop: 24,
            background: "#111113",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 10,
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#3f3f46",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 12,
            }}
          >
            Invariants
          </div>
          {[
            { i: "■", col: "#22c55e", t: "Immutable owns 9–5 weekdays. Protected." },
            { i: "▲", col: "#a855f7", t: "EngineRoom = 20h/wk exact. Weekday-heavy: commute BAU + evening deep work + remote mornings." },
            { i: "●", col: "#f97316", t: "FitFocus = 21h/wk. Light weekday BAU (2h/day), heavy weekend deep work (5.5h/day)." },
            { i: "→", col: "#64748b", t: "Commute = productive. Morning train → ER. Evening train → FF." },
            { i: "◇", col: "#06b6d4", t: "Life blocks non-negotiable: Wed & Sat soccer, Fri date night, Sun church." },
            { i: "◆", col: "#3b82f6", t: "5 AM gym. 11 PM sleep. Every day." },
          ].map((r, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 9,
                marginBottom: i < 5 ? 9 : 0,
                fontSize: 11.5,
                lineHeight: 1.5,
                color: "#71717a",
              }}
            >
              <span
                style={{
                  color: r.col,
                  fontSize: 8,
                  flexShrink: 0,
                  paddingTop: 4,
                }}
              >
                {r.i}
              </span>
              <span>{r.t}</span>
            </div>
          ))}
        </div>

        <div
          style={{
            textAlign: "center",
            fontSize: 9.5,
            color: "#1e1e21",
            marginTop: 20,
            paddingBottom: 24,
            letterSpacing: "0.04em",
          }}
        >
          ER 20h · FF 21h · Immutable {f(weekly.immutable || 0)}h · Gym 10.5h
        </div>
      </main>
    </div>
  );
}
