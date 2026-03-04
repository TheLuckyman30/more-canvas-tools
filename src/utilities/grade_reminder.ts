import { Reminder } from "~src/canvas/interfaces";

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
  const { courseName, assignmentName } = reminders[index];
  const canDisplayNext = index !== length - 1 && length > 1;
  const canDisplayPrev = index !== 0 && length > 1;

  const newReminder = `
    <div id="mct-reminder-box" 
        style="position: fixed; background-color: #E5E7EB; height: 150px; right: 0; bottom: 0; width: 400px; z-index: 99; border: 2px solid red; border-radius: 0.375rem; padding: 0.5rem;">
      <div id="reminder-header" style="display: flex; justify-content: space-between; font-size: 1.5rem">
        <div>Warning</div>
      </div>
      <div style="margin-top: 1rem">
        Release the grades for ${assignmentName} in ${courseName}
      </div>
      <div style="display: flex">
        ${canDisplayNext ? NEXT_BUTTON_HTML : ""}
        ${canDisplayPrev ? PREV_BUTTON_HTML : ""}
      </div>
    </div>
  `;

  $("div#application > div#wrapper").remove("div#mct-reminder-box");
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
}

function getExpiredReminders() {
  const reminders: Reminder[] = JSON.parse(
    localStorage.getItem("mct-reminders") ?? "[]",
  );
  const currentDate = new Date().toLocaleDateString();
  const expiredReminders: Reminder[] = [];
  const remaingReminders: Reminder[] = [];
  for (const reminder of reminders) {
    const targetDate = new Date(reminder.targetDate).toLocaleDateString();

    if (targetDate === currentDate) {
      expiredReminders.push(reminder);
    } else {
      remaingReminders.push(reminder);
    }
  }

  localStorage.setItem("mct-reminders", JSON.stringify(remaingReminders));
  return expiredReminders;
}

export function injectGradeReminder(target: HTMLElement) {
  const reminder1: Reminder = {
    targetDate: "3/4/2026",
    courseName: "sus",
    assignmentName: "test",
  };
  const reminder2: Reminder = {
    targetDate: "3/4/2026",
    courseName: "ssuss",
    assignmentName: "testss",
  };

  localStorage.setItem("mct-reminders", JSON.stringify([reminder1, reminder2]));

  const expieredReminders = getExpiredReminders();
  if (expieredReminders.length) {
    const startIndex = 0;
    createReminderBox(expieredReminders, startIndex, expieredReminders.length);
  }
}
