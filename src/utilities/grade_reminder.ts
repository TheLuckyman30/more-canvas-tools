import { Reminder } from "~src/canvas/interfaces";
const REMINDER_COLOR = "rgb(211, 241, 185)";

const CLOSE_BUTTON = `
<div id="mct-reminder-close"
     style="cursor: pointer">
  X
</div>
`;

const NEXT_BUTTON_HTML = `
<button id="mct-next" style="margin-top: 1rem; background-color: ${REMINDER_COLOR}; border: none; padding: 0.5rem; width: 6vw; border-radius: 0.375rem; cursor: pointer">
  Next
</button>
`;

const PREV_BUTTON_HTML = `
<button id="mct-prev" style="margin-top: 1rem; background-color: ${REMINDER_COLOR}; border: none; width: 6vw; padding: 0.5rem; border-radius: 0.375rem; cursor: pointer">
  Prev
</button>
`;

function createReminderBox(
  reminders: Reminder[],
  index: number,
  length: number,
) {
  const { id, courseName, assignmentName, calendarId, url } = reminders[index];
  const canDisplayNext = index !== length - 1 && length > 1;
  const canDisplayPrev = index !== 0 && length > 1;

  const newReminder = `
    <div id="mct-reminder-box" 
        style="position: fixed; background-color: #ffffff; height: 150px; right: 0; bottom: 0; width: 400px; z-index: 99; border-left: 6px solid ${REMINDER_COLOR}; border-radius: 0.375rem; padding: 0.5rem; box-shadow: 10px 20px 30px rgba(0, 0, 0, 0.24);">
      <div id="reminder-header" style="display: flex; justify-content: space-between; font-size: 1.5rem">
        <div>Reminder</div>
        <div>${index + 1}/${length}</div>
        ${CLOSE_BUTTON}
      </div>
      <div style="margin-top: 1rem">
        Release the grades for assignment: '${assignmentName}' in course: '${courseName}'
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center">

        <button style="margin-top: 1rem; background-color: ${REMINDER_COLOR}; border: none; padding: 0.5rem; 
        border-radius: 0.375rem; cursor: pointer;  width: 6vw" id="go-to-assignment" >
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
    const storedReminders: Reminder[] = JSON.parse(
      localStorage.getItem("mct-reminders") ?? "[]",
    );
    const newReminders = storedReminders.filter(
      (reminder) => reminder.id !== id,
    );

    if (!newReminders.length) {
      localStorage.setItem("mct-reminder-nextId", "0");
    }
    localStorage.setItem("mct-reminders", JSON.stringify(newReminders));

    const token = GM_getValue("CANVAS_TOKEN");
    fetch(
      `https://canvas.instructure.com/api/v1/calendar_events/${calendarId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method: "DELETE",
      },
    );

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
  for (const reminder of reminders) {
    const targetDate = new Date(reminder.targetDate).getTime();

    if (targetDate <= currentDate) {
      expiredReminders.push(reminder);
    }
  }

  return expiredReminders;
}

export function injectGradeReminder() {
  const expieredReminders = getExpiredReminders();
  if (expieredReminders.length) {
    const startIndex = 0;
    createReminderBox(expieredReminders, startIndex, expieredReminders.length);
  }
}
