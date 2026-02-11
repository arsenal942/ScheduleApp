export type UserRole = "owner" | "ea";

export interface AppUser {
  email: string;
  role: UserRole;
  name?: string;
}

export function resolveRole(email: string | null | undefined): UserRole | null {
  if (!email) return null;
  const lower = email.toLowerCase();
  if (lower === process.env.OWNER_EMAIL?.toLowerCase()) return "owner";
  if (lower === process.env.EA_EMAIL?.toLowerCase()) return "ea";
  return null;
}

export function isAuthorised(email: string | null | undefined): boolean {
  return resolveRole(email) !== null;
}

export const PERMISSIONS = {
  owner: {
    viewSchedule: true,
    editSchedule: true,
    viewCalendar: true,
    editCalendar: true,
    manageSettings: true,
    manageUsers: true,
  },
  ea: {
    viewSchedule: true,
    editSchedule: true,
    viewCalendar: true,
    editCalendar: true,
    manageSettings: false,
    manageUsers: false,
  },
} as const;

export type Permission = keyof (typeof PERMISSIONS)["owner"];

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return PERMISSIONS[role][permission];
}
