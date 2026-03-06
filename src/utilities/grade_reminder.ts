import { Reminder } from "~src/canvas/interfaces";

const CLOSE_BUTTON = `
<div id="mct-reminder-close"
     style="cursor: pointer">
  X
</div>
`;

const NEXT_BUTTON_HTML = `
<button id="mct-next">
  Next
</button>
`;

const PREV_BUTTON_HTML = `
<button id="mct-prev">
  Prev
</button>
`;

function createReminderBox(
  reminders: Reminder[],
  index: number,
  length: number,
) {
  const { courseName, assignmentName, url } = reminders[index];
  const canDisplayNext = index !== length - 1 && length > 1;
  const canDisplayPrev = index !== 0 && length > 1;

  const newReminder = `
    <div id="mct-reminder-box" 
        style="position: fixed; background-color: #E5E7EB; height: 150px; right: 0; bottom: 0; width: 400px; z-index: 99; border: 2px solid red; border-radius: 0.375rem; padding: 0.5rem;">
      <div id="reminder-header" style="display: flex; justify-content: space-between; font-size: 1.5rem">
        <div>Warning</div>
        <div>${index + 1}/${length}</div>
        ${CLOSE_BUTTON}
      </div>
      <div style="margin-top: 1rem">
        Release the grades for ${assignmentName} in ${courseName}
      </div>
      <div style="display: flex; justify-content: space-between;">
        <button>
          <a href="${url}" target="_blank">Go To</a>
        </button>
        ${canDisplayPrev ? PREV_BUTTON_HTML : ""}
        ${canDisplayNext ? NEXT_BUTTON_HTML : ""}
      </div>
    </div>
  `;

  $("div#mct-reminder-box").remove();
  $("div#application > div#wrapper").append(newReminder);

  if (canDisplayNext) {
    $("button#mct-next").on("click", () => {
      createReminderBox(reminders, index + 1, length);
    });
  }

  if (canDisplayPrev) {
    $("button#mct-prev").on("click", () => {
      createReminderBox(reminders, index - 1, length);
    });
  }

  $("div#mct-reminder-close").on("click", () => {
    reminders.splice(index, 1);

    if (!canDisplayNext && canDisplayPrev) {
      createReminderBox(reminders, index - 1, reminders.length);
    } else if (canDisplayNext) {
      createReminderBox(reminders, index, reminders.length);
    } else {
      $("div#mct-reminder-box").remove();
    }
  });
}

function getExpiredReminders() {
  const reminders: Reminder[] = JSON.parse(
    localStorage.getItem("mct-reminders") ?? "[]",
  );

  const currentDate = new Date().getTime();
  const expiredReminders: Reminder[] = [];
  const remaingReminders: Reminder[] = [];
  for (const reminder of reminders) {
    const targetDate = new Date(reminder.targetDate).getTime();

    if (targetDate <= currentDate) {
      expiredReminders.push(reminder);

      const token = GM_getValue("CANVAS_TOKEN");
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
    } else {
      remaingReminders.push(reminder);
    }
  }

  if (!remaingReminders.length) {
    localStorage.setItem("mct-reminder-nextId", "0");
  }

  localStorage.setItem("mct-reminders", JSON.stringify(remaingReminders));
  return expiredReminders;
}

export function injectGradeReminder(target: HTMLElement) {
  const expieredReminders = getExpiredReminders();
  if (expieredReminders.length) {
    const startIndex = 0;
    createReminderBox(expieredReminders, startIndex, expieredReminders.length);
  }
}
