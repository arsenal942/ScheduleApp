// Calendar IDs mapped to roles — configured via env vars
export interface CalendarConfig {
  id: string;
  label: string;
  color: string;
  role: "immutable" | "engineroom" | "fitfocus" | "personal";
}

export function getCalendars(): CalendarConfig[] {
  const calendars: CalendarConfig[] = [];

  if (process.env.GCAL_ID_IMMUTABLE) {
    calendars.push({
      id: process.env.GCAL_ID_IMMUTABLE,
      label: "Immutable",
      color: "#22c55e",
      role: "immutable",
    });
  }
  if (process.env.GCAL_ID_ENGINEROOM) {
    calendars.push({
      id: process.env.GCAL_ID_ENGINEROOM,
      label: "EngineRoom",
      color: "#a855f7",
      role: "engineroom",
    });
  }
  if (process.env.GCAL_ID_FITFOCUS) {
    calendars.push({
      id: process.env.GCAL_ID_FITFOCUS,
      label: "FitFocus",
      color: "#f97316",
      role: "fitfocus",
    });
  }
  if (process.env.GCAL_ID_PERSONAL) {
    calendars.push({
      id: process.env.GCAL_ID_PERSONAL,
      label: "Personal",
      color: "#06b6d4",
      role: "personal",
    });
  }

  return calendars;
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

export async function fetchCalendarEvents(
  accessToken: string,
  calendarId: string,
  timeMin: string,
  timeMax: string
): Promise<any[]> {
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "250",
  });

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Calendar API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.items || [];
}

export async function createCalendarEvent(
  accessToken: string,
  calendarId: string,
  event: {
    summary: string;
    start: { dateTime: string; timeZone?: string };
    end: { dateTime: string; timeZone?: string };
    description?: string;
    location?: string;
  }
): Promise<any> {
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Calendar API error (${res.status}): ${err}`);
  }

  return res.json();
}

export async function updateCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  updates: Record<string, any>
): Promise<any> {
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Calendar API error (${res.status}): ${err}`);
  }

  return res.json();
}

export async function deleteCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string
): Promise<void> {
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok && res.status !== 404) {
    const err = await res.text();
    throw new Error(`Calendar API error (${res.status}): ${err}`);
  }
}
