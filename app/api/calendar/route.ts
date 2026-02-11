import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import {
  getCalendars,
  fetchCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  type CalendarEvent,
} from "@/lib/calendar";

function unauthorised() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// GET /api/calendar?start=ISO&end=ISO
// Fetches events from all configured calendars
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return unauthorised();

  const { searchParams } = new URL(req.url);
  const now = new Date();

  // Default to current week (Mon–Sun)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const timeMin = searchParams.get("start") || startOfWeek.toISOString();
  const timeMax = searchParams.get("end") || endOfWeek.toISOString();

  const calendars = getCalendars();

  if (calendars.length === 0) {
    return NextResponse.json({
      events: [],
      message: "No calendar IDs configured. Add GCAL_ID_* env vars.",
    });
  }

  try {
    const allEvents: CalendarEvent[] = [];

    await Promise.all(
      calendars.map(async (cal) => {
        try {
          const items = await fetchCalendarEvents(
            session.accessToken!,
            cal.id,
            timeMin,
            timeMax
          );

          items.forEach((item: any) => {
            allEvents.push({
              id: item.id,
              summary: item.summary || "(No title)",
              start: item.start?.dateTime || item.start?.date,
              end: item.end?.dateTime || item.end?.date,
              calendarId: cal.id,
              calendarLabel: cal.label,
              calendarColor: cal.color,
              role: cal.role,
              allDay: !item.start?.dateTime,
            });
          });
        } catch (err) {
          console.error(`Failed to fetch ${cal.label} calendar:`, err);
        }
      })
    );

    // Sort by start time
    allEvents.sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );

    return NextResponse.json({ events: allEvents });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch calendars" },
      { status: 500 }
    );
  }
}

// POST /api/calendar
// Create a new event
// Body: { calendarId, summary, start, end, description?, location?, timeZone? }
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return unauthorised();

  try {
    const body = await req.json();
    const { calendarId, summary, start, end, description, location, timeZone } =
      body;

    if (!calendarId || !summary || !start || !end) {
      return NextResponse.json(
        { error: "Missing required fields: calendarId, summary, start, end" },
        { status: 400 }
      );
    }

    const event = await createCalendarEvent(
      session.accessToken,
      calendarId,
      {
        summary,
        start: { dateTime: start, timeZone },
        end: { dateTime: end, timeZone },
        description,
        location,
      }
    );

    return NextResponse.json({ event }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create event" },
      { status: 500 }
    );
  }
}

// PATCH /api/calendar
// Update an existing event
// Body: { calendarId, eventId, ...updates }
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return unauthorised();

  try {
    const body = await req.json();
    const { calendarId, eventId, ...updates } = body;

    if (!calendarId || !eventId) {
      return NextResponse.json(
        { error: "Missing required fields: calendarId, eventId" },
        { status: 400 }
      );
    }

    const event = await updateCalendarEvent(
      session.accessToken,
      calendarId,
      eventId,
      updates
    );

    return NextResponse.json({ event });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update event" },
      { status: 500 }
    );
  }
}

// DELETE /api/calendar?calendarId=X&eventId=Y
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) return unauthorised();

  const { searchParams } = new URL(req.url);
  const calendarId = searchParams.get("calendarId");
  const eventId = searchParams.get("eventId");

  if (!calendarId || !eventId) {
    return NextResponse.json(
      { error: "Missing calendarId or eventId" },
      { status: 400 }
    );
  }

  try {
    await deleteCalendarEvent(session.accessToken, calendarId, eventId);
    return NextResponse.json({ deleted: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete event" },
      { status: 500 }
    );
  }
}
