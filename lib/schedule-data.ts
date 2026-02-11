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
  t: string;
  c: Category;
  d: string;
  h: number;
}

export interface DaySchedule {
  tag: "office" | "remote" | "weekend";
  blocks: Block[];
}

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

// ER WEEKLY: 20.00h ✓  |  FF WEEKLY: 21.00h ✓

export const SCHEDULE: Record<string, DaySchedule> = {
  Monday: {
    tag: "office",
    blocks: [
      { t: "11:00 PM – 5:00 AM", c: "sleep", d: "Sleep", h: 6 },
      { t: "5:00 – 6:30 AM", c: "gym", d: "Gym", h: 1.5 },
      { t: "6:30 – 7:15 AM", c: "personal", d: "Ready", h: 0.75 },
      { t: "7:15 – 8:00 AM", c: "commute_er", d: "Commute → office — ER BAU (emails, Slack, PR reviews)", h: 0.75 },
      { t: "8:00 – 11:00 AM", c: "immutable", d: "Morning deep focus", h: 3 },
      { t: "11:00 – 11:30 AM", c: "meeting", d: "ER standup (Immutable overlap)", h: 0.5 },
      { t: "11:30 AM – 12:30 PM", c: "immutable", d: "Pre-lunch block", h: 1 },
      { t: "12:30 – 1:15 PM", c: "fitfocus", d: "Lunch + FF BAU — client follow-ups, invoicing", h: 0.75 },
      { t: "1:15 – 5:00 PM", c: "immutable", d: "Afternoon block", h: 3.75 },
      { t: "5:00 – 5:45 PM", c: "commute_ff", d: "Commute → home — FF BAU (client messages, scheduling)", h: 0.75 },
      { t: "5:45 – 6:15 PM", c: "personal", d: "Dinner", h: 0.5 },
      { t: "6:15 – 6:45 PM", c: "fitfocus", d: "FF BAU — contracts, platform checks", h: 0.5 },
      { t: "6:45 – 10:00 PM", c: "engineroom", d: "Deep work session", h: 3.25 },
      { t: "10:00 – 11:00 PM", c: "personal", d: "Wind down", h: 1 },
    ],
  },
  Tuesday: {
    tag: "office",
    blocks: [
      { t: "11:00 PM – 5:00 AM", c: "sleep", d: "Sleep", h: 6 },
      { t: "5:00 – 6:30 AM", c: "gym", d: "Gym", h: 1.5 },
      { t: "6:30 – 7:15 AM", c: "personal", d: "Ready", h: 0.75 },
      { t: "7:15 – 8:00 AM", c: "commute_er", d: "Commute → office — ER BAU (emails, async replies)", h: 0.75 },
      { t: "8:00 – 11:00 AM", c: "immutable", d: "Morning deep focus", h: 3 },
      { t: "11:00 – 11:15 AM", c: "meeting", d: "ER standup (Immutable overlap)", h: 0.25 },
      { t: "11:15 AM – 12:30 PM", c: "immutable", d: "Pre-lunch block", h: 1.25 },
      { t: "12:30 – 1:15 PM", c: "fitfocus", d: "Lunch + FF BAU — contracts, onboarding docs", h: 0.75 },
      { t: "1:15 – 5:00 PM", c: "immutable", d: "Afternoon block", h: 3.75 },
      { t: "5:00 – 5:45 PM", c: "commute_ff", d: "Commute → home — FF BAU (client comms, scheduling)", h: 0.75 },
      { t: "5:45 – 6:15 PM", c: "personal", d: "Dinner", h: 0.5 },
      { t: "6:15 – 6:45 PM", c: "fitfocus", d: "FF BAU — platform checks, content queue", h: 0.5 },
      { t: "6:45 – 10:00 PM", c: "engineroom", d: "Deep work session", h: 3.25 },
      { t: "10:00 – 11:00 PM", c: "personal", d: "Wind down", h: 1 },
    ],
  },
  Wednesday: {
    tag: "remote",
    blocks: [
      { t: "11:00 PM – 5:00 AM", c: "sleep", d: "Sleep", h: 6 },
      { t: "5:00 – 6:30 AM", c: "gym", d: "Gym", h: 1.5 },
      { t: "6:30 – 7:00 AM", c: "personal", d: "Breakfast", h: 0.5 },
      { t: "7:00 – 7:30 AM", c: "fitfocus", d: "FF BAU — client scheduling, admin", h: 0.5 },
      { t: "7:30 – 9:00 AM", c: "engineroom", d: "Morning focus block", h: 1.5 },
      { t: "9:00 AM – 12:30 PM", c: "immutable", d: "Morning block — remote", h: 3.5 },
      { t: "12:30 – 1:15 PM", c: "fitfocus", d: "Lunch + FF BAU (bi-weekly: ER advisory 12:30–12:45)", h: 0.75 },
      { t: "1:15 – 5:00 PM", c: "immutable", d: "Afternoon block — remote", h: 3.75 },
      { t: "5:00 – 5:15 PM", c: "personal", d: "Break", h: 0.25 },
      { t: "5:15 – 6:00 PM", c: "fitfocus", d: "FF BAU — mid-week check-in, wrap-up", h: 0.75 },
      { t: "6:00 – 7:00 PM", c: "personal", d: "Dinner + change", h: 1 },
      { t: "7:00 – 9:30 PM", c: "life", d: "Soccer training ⚽", h: 2.5 },
      { t: "9:30 – 10:30 PM", c: "engineroom", d: "Post-training ER session", h: 1 },
      { t: "10:30 – 11:00 PM", c: "personal", d: "Wind down", h: 0.5 },
    ],
  },
  Thursday: {
    tag: "office",
    blocks: [
      { t: "11:00 PM – 5:00 AM", c: "sleep", d: "Sleep", h: 6 },
      { t: "5:00 – 6:30 AM", c: "gym", d: "Gym", h: 1.5 },
      { t: "6:30 – 7:15 AM", c: "personal", d: "Ready", h: 0.75 },
      { t: "7:15 – 8:00 AM", c: "commute_er", d: "Commute → office — ER BAU (standup prep, Slack)", h: 0.75 },
      { t: "8:00 – 11:00 AM", c: "immutable", d: "Morning deep focus", h: 3 },
      { t: "11:00 – 11:15 AM", c: "meeting", d: "ER standup (Immutable overlap)", h: 0.25 },
      { t: "11:15 AM – 12:30 PM", c: "immutable", d: "Pre-lunch block", h: 1.25 },
      { t: "12:30 – 1:15 PM", c: "fitfocus", d: "Lunch + FF BAU — invoicing, follow-ups", h: 0.75 },
      { t: "1:15 – 5:00 PM", c: "immutable", d: "Afternoon block", h: 3.75 },
      { t: "5:00 – 5:45 PM", c: "commute_ff", d: "Commute → home — FF BAU (client messages, admin)", h: 0.75 },
      { t: "5:45 – 6:15 PM", c: "personal", d: "Dinner", h: 0.5 },
      { t: "6:15 – 6:45 PM", c: "fitfocus", d: "FF BAU — platform maintenance", h: 0.5 },
      { t: "6:45 – 10:00 PM", c: "engineroom", d: "Deep work session", h: 3.25 },
      { t: "10:00 – 11:00 PM", c: "personal", d: "Wind down", h: 1 },
    ],
  },
  Friday: {
    tag: "remote",
    blocks: [
      { t: "11:00 PM – 5:00 AM", c: "sleep", d: "Sleep", h: 6 },
      { t: "5:00 – 6:30 AM", c: "gym", d: "Gym", h: 1.5 },
      { t: "6:30 – 7:00 AM", c: "personal", d: "Breakfast", h: 0.5 },
      { t: "7:00 – 7:30 AM", c: "fitfocus", d: "FF BAU — week review, client wrap-ups", h: 0.5 },
      { t: "7:30 – 9:00 AM", c: "engineroom", d: "Morning focus block", h: 1.5 },
      { t: "9:00 AM – 12:30 PM", c: "immutable", d: "Morning block — remote", h: 3.5 },
      { t: "12:30 – 1:15 PM", c: "fitfocus", d: "Lunch + FF BAU — weekly numbers, next week prep", h: 0.75 },
      { t: "1:15 – 5:00 PM", c: "immutable", d: "Afternoon block — remote", h: 3.75 },
      { t: "5:00 – 5:15 PM", c: "personal", d: "Break", h: 0.25 },
      { t: "5:15 – 6:00 PM", c: "fitfocus", d: "FF BAU — close out the week", h: 0.75 },
      { t: "6:00 – 6:30 PM", c: "engineroom", d: "ER — quick wrap-up, week close", h: 0.5 },
      { t: "6:30 – 7:00 PM", c: "personal", d: "Get ready", h: 0.5 },
      { t: "7:00 PM – 12:00 AM", c: "life", d: "Date night", h: 5 },
    ],
  },
  Saturday: {
    tag: "weekend",
    blocks: [
      { t: "12:00 – 5:00 AM", c: "sleep", d: "Sleep (Fri late night)", h: 5 },
      { t: "5:00 – 6:30 AM", c: "gym", d: "Gym", h: 1.5 },
      { t: "6:30 – 7:00 AM", c: "personal", d: "Breakfast", h: 0.5 },
      { t: "7:00 – 8:15 AM", c: "engineroom", d: "Morning sprint", h: 1.25 },
      { t: "8:15 AM – 12:00 PM", c: "fitfocus", d: "Deep work — product, content creation, strategy", h: 3.75 },
      { t: "12:00 – 12:30 PM", c: "personal", d: "Lunch + prep", h: 0.5 },
      { t: "12:30 – 4:30 PM", c: "life", d: "Soccer ⚽", h: 4 },
      { t: "4:30 – 5:30 PM", c: "personal", d: "Recovery", h: 1 },
      { t: "5:30 – 7:15 PM", c: "fitfocus", d: "Deep work — content, client prep, platform build", h: 1.75 },
      { t: "7:15 – 11:00 PM", c: "personal", d: "Free — dinner, social, rest", h: 3.75 },
    ],
  },
  Sunday: {
    tag: "weekend",
    blocks: [
      { t: "11:00 PM – 5:00 AM", c: "sleep", d: "Sleep", h: 6 },
      { t: "5:00 – 6:30 AM", c: "gym", d: "Gym", h: 1.5 },
      { t: "6:30 – 7:00 AM", c: "personal", d: "Breakfast", h: 0.5 },
      { t: "7:00 AM – 12:30 PM", c: "fitfocus", d: "Deep work — week ahead prep, content batch, strategy", h: 5.5 },
      { t: "12:30 – 3:30 PM", c: "personal", d: "Lunch + free time", h: 3 },
      { t: "3:30 – 7:30 PM", c: "life", d: "Church", h: 4 },
      { t: "7:30 – 8:00 PM", c: "personal", d: "Dinner", h: 0.5 },
      { t: "8:00 – 9:15 PM", c: "engineroom", d: "Evening session — week ahead planning", h: 1.25 },
      { t: "9:15 – 11:00 PM", c: "personal", d: "Rest + wind down", h: 1.75 },
    ],
  },
};

export const DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
] as const;

export type DayName = (typeof DAYS)[number];
