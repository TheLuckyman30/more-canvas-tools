import { Reminder } from "~src/canvas/interfaces";

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

export function injectGradeReminder(target: HTMLElement) {}
