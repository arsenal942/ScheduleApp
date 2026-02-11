// ── Types ──

export type Category =
  | "sleep"
  | "gym"
  | "immutable"
  | "engineroom"
  | "fitfocus"
  | "commute_er"
  | "commute_ff"
  | "personal"
  | "meeting"
  | "life";

export interface Block {
  id?: string;
  day?: string;
  sort_order?: number;
  time_label: string;
  category: Category;
  description: string;
  hours: number;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  calendarId: string;
  calendarLabel: string;
  calendarColor: string;
  role: string;
  allDay: boolean;
}

export const CATEGORY_OPTIONS: Category[] = [
  "immutable",
  "engineroom",
  "fitfocus",
  "gym",
  "commute_er",
  "commute_ff",
  "meeting",
  "life",
  "personal",
  "sleep",
];

export const CATEGORIES: Record<
  Category,
  { color: string; text: string; icon: string; label: string }
> = {
  sleep:      { color: "#27272a", text: "#3f3f46", icon: "◌", label: "Sleep" },
  gym:        { color: "#3b82f6", text: "#93c5fd", icon: "◆", label: "Gym" },
  immutable:  { color: "#22c55e", text: "#86efac", icon: "■", label: "Immutable" },
  engineroom: { color: "#a855f7", text: "#d8b4fe", icon: "▲", label: "EngineRoom" },
  fitfocus:   { color: "#f97316", text: "#fdba74", icon: "●", label: "FitFocus" },
  commute_er: { color: "#a855f7", text: "#d8b4fe", icon: "→", label: "Commute · ER" },
  commute_ff: { color: "#f97316", text: "#fdba74", icon: "→", label: "Commute · FF" },
  personal:   { color: "#3f3f46", text: "#71717a", icon: "○", label: "Personal" },
  meeting:    { color: "#ec4899", text: "#f9a8d4", icon: "⚡", label: "ER Meeting" },
  life:       { color: "#06b6d4", text: "#67e8f9", icon: "◇", label: "Life" },
};

export function resolveCategory(c: Category): string {
  if (c === "commute_er" || c === "meeting") return "engineroom";
  if (c === "commute_ff") return "fitfocus";
  return c;
}

export const DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
] as const;

export type DayName = (typeof DAYS)[number];

export const DAY_TAGS: Record<string, "office" | "remote" | "weekend"> = {
  Monday: "office",
  Tuesday: "office",
  Wednesday: "remote",
  Thursday: "office",
  Friday: "remote",
  Saturday: "weekend",
  Sunday: "weekend",
};

// ── Seed Data ──
// Used by scripts/seed.ts to populate Supabase on first run

export const SEED_DATA: Record<string, Omit<Block, "id" | "day" | "sort_order">[]> = {
  Monday: [
    { time_label: "11:00 PM – 5:00 AM", category: "sleep", description: "Sleep", hours: 6 },
    { time_label: "5:00 – 6:30 AM", category: "gym", description: "Gym", hours: 1.5 },
    { time_label: "6:30 – 7:15 AM", category: "personal", description: "Ready", hours: 0.75 },
    { time_label: "7:15 – 8:00 AM", category: "commute_er", description: "Commute → office — ER BAU (emails, Slack, PR reviews)", hours: 0.75 },
    { time_label: "8:00 – 11:00 AM", category: "immutable", description: "Morning deep focus", hours: 3 },
    { time_label: "11:00 – 11:30 AM", category: "meeting", description: "ER standup (Immutable overlap)", hours: 0.5 },
    { time_label: "11:30 AM – 12:30 PM", category: "immutable", description: "Pre-lunch block", hours: 1 },
    { time_label: "12:30 – 1:15 PM", category: "fitfocus", description: "Lunch + FF BAU — client follow-ups, invoicing", hours: 0.75 },
    { time_label: "1:15 – 5:00 PM", category: "immutable", description: "Afternoon block", hours: 3.75 },
    { time_label: "5:00 – 5:45 PM", category: "commute_ff", description: "Commute → home — FF BAU (client messages, scheduling)", hours: 0.75 },
    { time_label: "5:45 – 6:15 PM", category: "personal", description: "Dinner", hours: 0.5 },
    { time_label: "6:15 – 6:45 PM", category: "fitfocus", description: "FF BAU — contracts, platform checks", hours: 0.5 },
    { time_label: "6:45 – 10:00 PM", category: "engineroom", description: "Deep work session", hours: 3.25 },
    { time_label: "10:00 – 11:00 PM", category: "personal", description: "Wind down", hours: 1 },
  ],
  Tuesday: [
    { time_label: "11:00 PM – 5:00 AM", category: "sleep", description: "Sleep", hours: 6 },
    { time_label: "5:00 – 6:30 AM", category: "gym", description: "Gym", hours: 1.5 },
    { time_label: "6:30 – 7:15 AM", category: "personal", description: "Ready", hours: 0.75 },
    { time_label: "7:15 – 8:00 AM", category: "commute_er", description: "Commute → office — ER BAU (emails, async replies)", hours: 0.75 },
    { time_label: "8:00 – 11:00 AM", category: "immutable", description: "Morning deep focus", hours: 3 },
    { time_label: "11:00 – 11:15 AM", category: "meeting", description: "ER standup (Immutable overlap)", hours: 0.25 },
    { time_label: "11:15 AM – 12:30 PM", category: "immutable", description: "Pre-lunch block", hours: 1.25 },
    { time_label: "12:30 – 1:15 PM", category: "fitfocus", description: "Lunch + FF BAU — contracts, onboarding docs", hours: 0.75 },
    { time_label: "1:15 – 5:00 PM", category: "immutable", description: "Afternoon block", hours: 3.75 },
    { time_label: "5:00 – 5:45 PM", category: "commute_ff", description: "Commute → home — FF BAU (client comms, scheduling)", hours: 0.75 },
    { time_label: "5:45 – 6:15 PM", category: "personal", description: "Dinner", hours: 0.5 },
    { time_label: "6:15 – 6:45 PM", category: "fitfocus", description: "FF BAU — platform checks, content queue", hours: 0.5 },
    { time_label: "6:45 – 10:00 PM", category: "engineroom", description: "Deep work session", hours: 3.25 },
    { time_label: "10:00 – 11:00 PM", category: "personal", description: "Wind down", hours: 1 },
  ],
  Wednesday: [
    { time_label: "11:00 PM – 5:00 AM", category: "sleep", description: "Sleep", hours: 6 },
    { time_label: "5:00 – 6:30 AM", category: "gym", description: "Gym", hours: 1.5 },
    { time_label: "6:30 – 7:00 AM", category: "personal", description: "Breakfast", hours: 0.5 },
    { time_label: "7:00 – 7:30 AM", category: "fitfocus", description: "FF BAU — client scheduling, admin", hours: 0.5 },
    { time_label: "7:30 – 9:00 AM", category: "engineroom", description: "Morning focus block", hours: 1.5 },
    { time_label: "9:00 AM – 12:30 PM", category: "immutable", description: "Morning block — remote", hours: 3.5 },
    { time_label: "12:30 – 1:15 PM", category: "fitfocus", description: "Lunch + FF BAU (bi-weekly: ER advisory 12:30–12:45)", hours: 0.75 },
    { time_label: "1:15 – 5:00 PM", category: "immutable", description: "Afternoon block — remote", hours: 3.75 },
    { time_label: "5:00 – 5:15 PM", category: "personal", description: "Break", hours: 0.25 },
    { time_label: "5:15 – 6:00 PM", category: "fitfocus", description: "FF BAU — mid-week check-in, wrap-up", hours: 0.75 },
    { time_label: "6:00 – 7:00 PM", category: "personal", description: "Dinner + change", hours: 1 },
    { time_label: "7:00 – 9:30 PM", category: "life", description: "Soccer training ⚽", hours: 2.5 },
    { time_label: "9:30 – 10:30 PM", category: "engineroom", description: "Post-training ER session", hours: 1 },
    { time_label: "10:30 – 11:00 PM", category: "personal", description: "Wind down", hours: 0.5 },
  ],
  Thursday: [
    { time_label: "11:00 PM – 5:00 AM", category: "sleep", description: "Sleep", hours: 6 },
    { time_label: "5:00 – 6:30 AM", category: "gym", description: "Gym", hours: 1.5 },
    { time_label: "6:30 – 7:15 AM", category: "personal", description: "Ready", hours: 0.75 },
    { time_label: "7:15 – 8:00 AM", category: "commute_er", description: "Commute → office — ER BAU (standup prep, Slack)", hours: 0.75 },
    { time_label: "8:00 – 11:00 AM", category: "immutable", description: "Morning deep focus", hours: 3 },
    { time_label: "11:00 – 11:15 AM", category: "meeting", description: "ER standup (Immutable overlap)", hours: 0.25 },
    { time_label: "11:15 AM – 12:30 PM", category: "immutable", description: "Pre-lunch block", hours: 1.25 },
    { time_label: "12:30 – 1:15 PM", category: "fitfocus", description: "Lunch + FF BAU — invoicing, follow-ups", hours: 0.75 },
    { time_label: "1:15 – 5:00 PM", category: "immutable", description: "Afternoon block", hours: 3.75 },
    { time_label: "5:00 – 5:45 PM", category: "commute_ff", description: "Commute → home — FF BAU (client messages, admin)", hours: 0.75 },
    { time_label: "5:45 – 6:15 PM", category: "personal", description: "Dinner", hours: 0.5 },
    { time_label: "6:15 – 6:45 PM", category: "fitfocus", description: "FF BAU — platform maintenance", hours: 0.5 },
    { time_label: "6:45 – 10:00 PM", category: "engineroom", description: "Deep work session", hours: 3.25 },
    { time_label: "10:00 – 11:00 PM", category: "personal", description: "Wind down", hours: 1 },
  ],
  Friday: [
    { time_label: "11:00 PM – 5:00 AM", category: "sleep", description: "Sleep", hours: 6 },
    { time_label: "5:00 – 6:30 AM", category: "gym", description: "Gym", hours: 1.5 },
    { time_label: "6:30 – 7:00 AM", category: "personal", description: "Breakfast", hours: 0.5 },
    { time_label: "7:00 – 7:30 AM", category: "fitfocus", description: "FF BAU — week review, client wrap-ups", hours: 0.5 },
    { time_label: "7:30 – 9:00 AM", category: "engineroom", description: "Morning focus block", hours: 1.5 },
    { time_label: "9:00 AM – 12:30 PM", category: "immutable", description: "Morning block — remote", hours: 3.5 },
    { time_label: "12:30 – 1:15 PM", category: "fitfocus", description: "Lunch + FF BAU — weekly numbers, next week prep", hours: 0.75 },
    { time_label: "1:15 – 5:00 PM", category: "immutable", description: "Afternoon block — remote", hours: 3.75 },
    { time_label: "5:00 – 5:15 PM", category: "personal", description: "Break", hours: 0.25 },
    { time_label: "5:15 – 6:00 PM", category: "fitfocus", description: "FF BAU — close out the week", hours: 0.75 },
    { time_label: "6:00 – 6:30 PM", category: "engineroom", description: "ER — quick wrap-up, week close", hours: 0.5 },
    { time_label: "6:30 – 7:00 PM", category: "personal", description: "Get ready", hours: 0.5 },
    { time_label: "7:00 PM – 12:00 AM", category: "life", description: "Date night", hours: 5 },
  ],
  Saturday: [
    { time_label: "12:00 – 5:00 AM", category: "sleep", description: "Sleep (Fri late night)", hours: 5 },
    { time_label: "5:00 – 6:30 AM", category: "gym", description: "Gym", hours: 1.5 },
    { time_label: "6:30 – 7:00 AM", category: "personal", description: "Breakfast", hours: 0.5 },
    { time_label: "7:00 – 8:15 AM", category: "engineroom", description: "Morning sprint", hours: 1.25 },
    { time_label: "8:15 AM – 12:00 PM", category: "fitfocus", description: "Deep work — product, content creation, strategy", hours: 3.75 },
    { time_label: "12:00 – 12:30 PM", category: "personal", description: "Lunch + prep", hours: 0.5 },
    { time_label: "12:30 – 4:30 PM", category: "life", description: "Soccer ⚽", hours: 4 },
    { time_label: "4:30 – 5:30 PM", category: "personal", description: "Recovery", hours: 1 },
    { time_label: "5:30 – 7:15 PM", category: "fitfocus", description: "Deep work — content, client prep, platform build", hours: 1.75 },
    { time_label: "7:15 – 11:00 PM", category: "personal", description: "Free — dinner, social, rest", hours: 3.75 },
  ],
  Sunday: [
    { time_label: "11:00 PM – 5:00 AM", category: "sleep", description: "Sleep", hours: 6 },
    { time_label: "5:00 – 6:30 AM", category: "gym", description: "Gym", hours: 1.5 },
    { time_label: "6:30 – 7:00 AM", category: "personal", description: "Breakfast", hours: 0.5 },
    { time_label: "7:00 AM – 12:30 PM", category: "fitfocus", description: "Deep work — week ahead prep, content batch, strategy", hours: 5.5 },
    { time_label: "12:30 – 3:30 PM", category: "personal", description: "Lunch + free time", hours: 3 },
    { time_label: "3:30 – 7:30 PM", category: "life", description: "Church", hours: 4 },
    { time_label: "7:30 – 8:00 PM", category: "personal", description: "Dinner", hours: 0.5 },
    { time_label: "8:00 – 9:15 PM", category: "engineroom", description: "Evening session — week ahead planning", hours: 1.25 },
    { time_label: "9:15 – 11:00 PM", category: "personal", description: "Rest + wind down", hours: 1.75 },
  ],
};
