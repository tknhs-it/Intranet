import { GraphClient } from '../GraphClient';
import { GraphCalendarEvent } from '../types/GraphTypes';

/**
 * Calendar Service
 * Handles calendar and event operations
 */
export class CalendarService {
  constructor(private graph: GraphClient) {}

  /**
   * Get user calendar events for date range
   */
  async getUserEvents(
    userId: string,
    start: string,
    end: string,
    timeZone: string = 'Australia/Melbourne'
  ): Promise<GraphCalendarEvent[]> {
    const response = await this.graph
      .api(`/users/${userId}/calendarView?startDateTime=${start}&endDateTime=${end}`)
      .header('Prefer', `outlook.timezone="${timeZone}"`)
      .get();

    return response.value || [];
  }

  /**
   * Get user's calendar for today
   */
  async getTodayEvents(userId: string, timeZone: string = 'Australia/Melbourne'): Promise<GraphCalendarEvent[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getUserEvents(
      userId,
      today.toISOString(),
      tomorrow.toISOString(),
      timeZone
    );
  }

  /**
   * Get user's next available time slot
   */
  async getNextAvailableTime(
    userId: string,
    durationMinutes: number = 30,
    startFrom?: Date
  ): Promise<Date | null> {
    const start = startFrom || new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + 7); // Look ahead 7 days

    const events = await this.getUserEvents(
      userId,
      start.toISOString(),
      end.toISOString()
    );

    // Sort events by start time
    const sortedEvents = events.sort(
      (a, b) => new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime()
    );

    // Find first gap that fits the duration
    let currentTime = start;

    for (const event of sortedEvents) {
      const eventStart = new Date(event.start.dateTime);
      const eventEnd = new Date(event.end.dateTime);

      // If there's a gap before this event
      if (currentTime.getTime() + durationMinutes * 60000 <= eventStart.getTime()) {
        return currentTime;
      }

      // Move current time to after this event
      currentTime = eventEnd > currentTime ? eventEnd : currentTime;
    }

    // Check if there's time after the last event
    const lastEvent = sortedEvents[sortedEvents.length - 1];
    if (lastEvent) {
      const lastEventEnd = new Date(lastEvent.end.dateTime);
      if (lastEventEnd.getTime() + durationMinutes * 60000 <= end.getTime()) {
        return lastEventEnd;
      }
    } else {
      // No events, available now
      return currentTime;
    }

    return null;
  }

  /**
   * Create calendar event
   */
  async createEvent(
    userId: string,
    subject: string,
    start: Date,
    end: Date,
    attendees?: string[]
  ): Promise<GraphCalendarEvent> {
    const event = {
      subject,
      start: {
        dateTime: start.toISOString(),
        timeZone: 'Australia/Melbourne',
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: 'Australia/Melbourne',
      },
      attendees: attendees?.map(email => ({
        emailAddress: {
          address: email,
        },
        type: 'required',
      })),
    };

    const response = await this.graph
      .api(`/users/${userId}/calendar/events`)
      .post(event);

    return response as GraphCalendarEvent;
  }
}

