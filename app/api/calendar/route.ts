import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getCalendars, fetchCalendarEvents, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent, type CalendarEvent } from "@/lib/calendar";

function json(data: any, status = 200) { return NextResponse.json(data, { status }); }

async function auth() {
  const s = await getServerSession(authOptions);
  return s?.accessToken ? s : null;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return json({ error: "Unauthorized" }, 401);
  const { searchParams } = new URL(req.url);
  const now = new Date();
  const sow = new Date(now); sow.setDate(now.getDate() - ((now.getDay() + 6) % 7)); sow.setHours(0,0,0,0);
  const eow = new Date(sow); eow.setDate(sow.getDate() + 7);
  const timeMin = searchParams.get("start") || sow.toISOString();
  const timeMax = searchParams.get("end") || eow.toISOString();
  const calendars = getCalendars();
  if (!calendars.length) return json({ events: [], message: "No calendar IDs configured." });
  try {
    const events: CalendarEvent[] = [];
    await Promise.all(calendars.map(async (cal) => {
      try {
        const items = await fetchCalendarEvents(session.accessToken!, cal.id, timeMin, timeMax);
        items.forEach((item: any) => events.push({
          id: item.id, summary: item.summary || "(No title)",
          start: item.start?.dateTime || item.start?.date, end: item.end?.dateTime || item.end?.date,
          calendarId: cal.id, calendarLabel: cal.label, calendarColor: cal.color, role: cal.role,
          allDay: !item.start?.dateTime,
        }));
      } catch {}
    }));
    events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    return json({ events });
  } catch { return json({ error: "Failed to fetch calendars" }, 500); }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return json({ error: "Unauthorized" }, 401);
  try {
    const { calendarId, summary, start, end, description, location, timeZone } = await req.json();
    if (!calendarId || !summary || !start || !end) return json({ error: "Missing required fields" }, 400);
    const event = await createCalendarEvent(session.accessToken!, calendarId, { summary, start: { dateTime: start, timeZone }, end: { dateTime: end, timeZone }, description, location });
    return json({ event }, 201);
  } catch (err: any) { return json({ error: err.message }, 500); }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return json({ error: "Unauthorized" }, 401);
  try {
    const { calendarId, eventId, ...updates } = await req.json();
    if (!calendarId || !eventId) return json({ error: "Missing calendarId or eventId" }, 400);
    const event = await updateCalendarEvent(session.accessToken!, calendarId, eventId, updates);
    return json({ event });
  } catch (err: any) { return json({ error: err.message }, 500); }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return json({ error: "Unauthorized" }, 401);
  const { searchParams } = new URL(req.url);
  const calendarId = searchParams.get("calendarId"), eventId = searchParams.get("eventId");
  if (!calendarId || !eventId) return json({ error: "Missing params" }, 400);
  try { await deleteCalendarEvent(session.accessToken!, calendarId, eventId); return json({ deleted: true }); }
  catch (err: any) { return json({ error: err.message }, 500); }
}
