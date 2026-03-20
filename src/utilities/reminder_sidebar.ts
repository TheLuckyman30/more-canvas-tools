import { Reminder } from "~src/canvas/interfaces";
import { deleteReminder } from "~src/helpers/reminder-helpers";

const NO_REMINDER_HTML = `
<div>
    You have no active reminders
</div>
`;

const REMINDER_SECTION_HTML = `
<div id="mct-reminder-section"
     style="display: flex; flex-direction: column">
    <h2 style=" font-size: 1rem; overflow: hidden; border-bottom: 1px solid #e8eaec; padding-bottom: 6px; margin: 0 0 6px; font-weight: bold; margin-top: 1.0625rem;">
    Grade Release Reminders</h2>
    <div id="mct-reminder-section-container" style="display: flex; flex-direction: column;"></div>
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
      <div style="display:flex;">
        <div id="mct-reminder-${reminder.id}" style="display: block; unicode-bidi: isolate; min-width: 70%">
          
          <ul style="display: block; list-style-type: disc; margin-block-start: 0.5em; margin-block-end: 0.5em; padding-inline-start: 10px; unicode-bidi: isolate;">
            <li style="list-style: none;">
              <div style="padding-right: 12px; flex: 1; min-width: 5px; overflow: hidden; position: relative;">
                  <a href="${reminder.url}" target="_blank" style="font-size: 0.875rem; display: flex;">
                    ${reminder.assignmentName}
                  </a>
                  <div style="color: #777; font-size: 0.775rem;">${reminder.courseName}</div>
                  <div style="display: flex; justify-content: space-between">
                    <div style="font-size: 0.775rem; color: #777;">${reminder.targetDate}</div>
                      
                  </div>
              </div>
                
            </li>
          </ul>
          

          </div>
          <div id="mct-reminder-cancel-${reminder.id}" style=" display: flex; justify-content: flex-end; width: 100%; cursor: pointer; color: #777;">x</div>
      </div>
        
      `;

      $(reminderSection).append(reminderHtml);
      $(`div#mct-reminder-cancel-${reminder.id}`).on("click", () => {
        deleteReminder(reminder.id, reminder.calendarId);
        $(`div#mct-reminder-${reminder.id}`).remove();
        const currentReminders = JSON.parse(
          localStorage.getItem("mct-reminders") ?? "[]",
        );

        if (!currentReminders.length) {
          $(reminderSection).append(NO_REMINDER_HTML);
        }
      });
    }
  } else {
    $("div#mct-reminder-section-container").append(NO_REMINDER_HTML);
  }
}
