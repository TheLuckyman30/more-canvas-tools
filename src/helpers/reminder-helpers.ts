import {
  CalendarEventOut,
  CreateCalendarEvent,
  Reminder,
} from "~src/canvas/interfaces";
import { mutationFetcher } from "./fetch";

export async function createReminder(
  courseId: string,
  assignmentName: string,
  courseName: string,
  day: number,
  month: number,
  year: number,
) {
  const newDate = new Date(year, month - 1, day).toLocaleDateString();
  const newCalendarEvent: CreateCalendarEvent = {
    calendar_event: {
      context_code: `course_${courseId}`,
      title: `Release Grades for ${assignmentName}`,
      description: `Release Grades for ${assignmentName} in ${courseName}`,
      all_day: true,
      start_at: `${day}/${month}/${year}`,
    },
  };
  const nextId = Number(localStorage.getItem("mct-reminder-nextId")) ?? 0;
  const reminders: Reminder[] = JSON.parse(
    localStorage.getItem("mct-reminders") ?? "[]",
  );

  const calEvent = await mutationFetcher<CreateCalendarEvent, CalendarEventOut>(
    {
      endpoint: "https://canvas.instructure.com/api/v1/calendar_events",
      method: "POST",
      body: newCalendarEvent,
    },
  );

  reminders.push({
    id: nextId,
    url: `https://canvas.instructure.com/courses/${courseId}/gradebook`,
    calendarId: calEvent.id,
    targetDate: newDate,
    courseName: courseName,
    assignmentName: assignmentName,
  });

  localStorage.setItem("mct-reminders", JSON.stringify(reminders));
  localStorage.setItem("mct-reminder-nextId", JSON.stringify(nextId + 1));
}

export function updateReminder(
  updateReminderId: number,
  newDate: string,
  calendarId: number,
) {
  const storedReminders: Reminder[] = JSON.parse(
    localStorage.getItem("mct-reminders") ?? "[]",
  );
  const updatedReminders = storedReminders.map((reminder) => {
    if (reminder.id === updateReminderId) {
      return { ...reminder, targetDate: newDate };
    }
    return { ...reminder };
  });

  const updateCalendarEvent = {
    calendar_event: {
      start_at: newDate,
      end_at: newDate,
    },
  };

  mutationFetcher({
    endpoint: `https://canvas.instructure.com/api/v1/calendar_events/${calendarId}`,
    method: "PUT",
    body: updateCalendarEvent,
  });
  localStorage.setItem("mct-reminders", JSON.stringify(updatedReminders));
}

export function deleteReminder(deleteReminderId: number, calendarId: number) {
  const storedReminders: Reminder[] = JSON.parse(
    localStorage.getItem("mct-reminders") ?? "[]",
  );
  const newReminders = storedReminders.filter(
    (reminder) => reminder.id !== deleteReminderId,
  );

  if (!newReminders.length) {
    localStorage.setItem("mct-reminder-nextId", "0");
  }
  localStorage.setItem("mct-reminders", JSON.stringify(newReminders));
  mutationFetcher({
    endpoint: `https://canvas.instructure.com/api/v1/calendar_events/${calendarId}`,
    method: "DELETE",
  });
}
