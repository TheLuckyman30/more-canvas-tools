import {
  CalendarEventOut,
  CreateCalendarEvent,
  Reminder,
} from "~src/canvas/interfaces";
import { mutationFetcher } from "./fetch";
import { updateOnScreenReminder } from "~src/utilities/grade_reminder";
import { isOnDashboard } from "~src/canvas/page_checks";
import { injectReminderSideBar } from "~src/utilities/reminder_sidebar";

export async function createReminder(
  courseId: string,
  assignmentName: string,
  courseName: string,
  day: number,
  month: number,
  year: number,
  hour: number,
  minute: number,
  useTime: boolean,
) {
  const newDate = new Date(year, month - 1, day, hour, minute).toLocaleString();
  const newCalendarEvent: CreateCalendarEvent = {
    calendar_event: {
      context_code: `course_${courseId}`,
      title: `Release Grades for ${assignmentName}`,
      description: `Release Grades for ${assignmentName} in ${courseName}`,
      all_day: !useTime,
      start_at: `${day}/${month}/${year}T${hour}:${minute}`,
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
  reminder: Reminder,
  day: number,
  month: number,
  year: number,
  hour: number,
  minute: number,
  useTime: boolean,
) {
  const { id, calendarId } = reminder;
  const newDate = new Date(year, month - 1, day, hour, minute).toLocaleString();
  const storedReminders: Reminder[] = JSON.parse(
    localStorage.getItem("mct-reminders") ?? "[]",
  );
  const updatedReminders = storedReminders.map((reminder) => {
    if (reminder.id === id) {
      return { ...reminder, targetDate: newDate };
    }
    return { ...reminder };
  });

  const updateCalendarEvent = {
    calendar_event: {
      all_day: !useTime,
      start_at: `${day}/${month}/${year}T${hour}:${minute}`,
      end_at: `${day}/${month}/${year}T${hour}:${minute}`,
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

export function buildReminderInput(opts: {
  createOpts?: {
    assignmentName: string;
    courseName: string;
  };
  updateOpts?: {
    reminders: Reminder[];
    index: number;
    canDisplayNext: boolean;
    canDisplayPrev: boolean;
  };
}) {
  const { createOpts, updateOpts } = opts;
  const CLOSE_BUTTON = `
    <div id="mct-grader-close"
        style="cursor: pointer; font-family: arial; color: #a1a1a1; font-size: 1.5rem">
    X
    </div>
   `;

  const DATE_INPUT_HTML = `
    <input id="mct-date-picker" type="date"/>
  `;

  const TIME_INPUT_HTML = `
    <input id="mct-time-picker" type="time"/>
  `;

  const SUBMIT_BUTTON_HTML = `
    <button id="mct-submit-reminder" style="background-color: #bef1c0; padding: 0.5rem; width: 8vw; border-radius: 0.375rem; border: 0px solid #bef1c0;box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); cursor: pointer;">
        Submit
    </button>
  `;

  const INPUT_CONTAINER_HTML = `
    <div id="mct-input-container"
        style="position: fixed; height: 100%; width: 100%; backdrop-filter: blur(4px); background-color: rgba(167, 163, 163, 0.2); z-index: 99; top: 0; bottom: 0; right: 0; left: 0; display: flex; justify-content: center; align-items: center">
        <div style="display: flex; flex-direction: column; width: 20rem; height: 15rem; background-color: #ffffff; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.14), 0 10px 10px -5px rgba(0, 0, 0, 0.04) ; padding-bottom: 0.5rem; border-radius: 0.375rem;">
            <div style="display: flex; justify-content: space-between; font-size: 1.5rem; background-color: #bef1c0; padding: 0.5rem; border-radius: 0.375rem 0.375rem 0 0;">
                <span style= "font-family: arial">${createOpts ? "Set" : "Update"} Your Reminder:</span>
                ${CLOSE_BUTTON}
            </div>
            <div style="display: flex; justify-content: center; align-items: center; height: 100%; width: 100%; font-family: arial; font-size: 1rem; gap: 0.5rem; flex-direction: column; padding: 0.5rem;">
            Choose Date for Release Reminder:
            <p></p>
                ${DATE_INPUT_HTML}
                ${TIME_INPUT_HTML}
            </div>
            <div style="width: 100%; display: flex; justify-content: center">
                ${SUBMIT_BUTTON_HTML}
            </div>
        </div>
    </div>
  `;

  $("body").append(INPUT_CONTAINER_HTML);
  $("button#mct-submit-reminder").on("click", async () => {
    const datePicker = $("input#mct-date-picker");
    const timePicker = $("input#mct-time-picker");
    const date = datePicker.val() as string;
    let time = timePicker.val() as string;
    let useTime = true;
    if (!time) {
      time = "00:00";
      useTime = false;
    }

    if (date) {
      const courseId = window.location.pathname.split("/")[2];
      const [year, month, day] = date.split("-").map((val) => Number(val));
      const [hour, minute] = time.split(":").map((val) => Number(val));

      if (createOpts) {
        const { assignmentName, courseName } = createOpts;
        createReminder(
          courseId,
          assignmentName,
          courseName,
          day,
          month,
          year,
          hour,
          minute,
          useTime,
        );
      } else if (updateOpts) {
        const { reminders, index, canDisplayNext, canDisplayPrev } = updateOpts;
        updateReminder(
          reminders[index],
          day,
          month,
          year,
          hour,
          minute,
          useTime,
        );
        updateOnScreenReminder(
          reminders,
          index,
          canDisplayNext,
          canDisplayPrev,
        );

        if (isOnDashboard) {
          $("#mct-reminder-section").remove();
          injectReminderSideBar($("div#right-side-wrapper")[0]);
        }
      }
    }

    $("div#mct-input-container").remove();
  });

  $("div#mct-grader-close").on("click", () => {
    $("div#mct-input-container").remove();
  });
}
