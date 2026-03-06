import { Reminder } from "~src/canvas/interfaces";

const NO_REMINDER_HTML = `
<div>
    You have no active reminders
</div>
`;

const REMINDER_SECTION_HTML = `
<div id="mct-reminder-section"
     style="display: flex; flex-direction: column">
    <h4 style="font-weight: bold;">Reminders</h4>
    <h5>Release Grades</h5>
    <hr style="margin: 10px, 0">
    <div id="mct-reminder-section-container" style="display: flex; flex-direction: column; gap: 2rem"></div>
</div>
`;

function getActiveReminders() {
  const reminders: Reminder[] = JSON.parse(
    localStorage.getItem("mct-reminders") ?? "[]",
  );

  const currentDate = new Date().getTime();
  const remaingReminders: Reminder[] = [];
  for (const reminder of reminders) {
    const targetDate = new Date(reminder.targetDate).getTime();

    if (targetDate > currentDate) {
      remaingReminders.push(reminder);
    }
  }

  return remaingReminders;
}

export function injectReminderSideBar(target: HTMLElement) {
  const reminders = getActiveReminders();
  $(target).append(REMINDER_SECTION_HTML);

  if (reminders.length) {
    const reminderSection = $("div#mct-reminder-section-container");
    for (const reminder of reminders) {
      const reminderHtml = `
        <div id="mct-reminder-${reminder.id}">
            <div style="display: flex; justify-content: space-between">
              <div>${reminder.targetDate} - ${reminder.assignmentName}</div>
              <div id="mct-reminder-cancel-${reminder.id}" style="cursor: pointer">X</div>
            </div>
            <div>${reminder.courseName}</div>
        </div>
      `;

      $(reminderSection).append(reminderHtml);
      $(`div#mct-reminder-cancel-${reminder.id}`).on("click", () => {
        const token = GM_getValue("CANVAS_TOKEN");
        const newReminders = getActiveReminders().filter(
          (r) => r.id !== reminder.id,
        );
        $(`div#mct-reminder-${reminder.id}`).remove();
        localStorage.setItem("mct-reminders", JSON.stringify(newReminders));

        fetch(
          `https://canvas.instructure.com/api/v1/calendar_events/${reminder.calendarId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            method: "DELETE",
          },
        );

        if (!newReminders.length) {
          $(reminderSection).append(NO_REMINDER_HTML);
          localStorage.setItem("mct-reminder-nextId", "0");
        }
      });
    }
  } else {
    $("div#mct-reminder-section-container").append(NO_REMINDER_HTML);
  }
}
