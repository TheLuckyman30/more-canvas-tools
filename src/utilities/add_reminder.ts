import { buildReminderInput } from "~src/helpers/reminder-helpers";

const REMINDER_BUTTON_HTML = `
<div id="mct-grader-reminder" 
    style="background-color: white; padding: 0.5rem; border-radius: 0.375rem; cursor: pointer;">
    Set Reminder
</div>
`;

export function injectAddReminder(target: HTMLElement) {
  const observer = new MutationObserver(() => {
    if (target) {
      observer.disconnect();

      const topMenu = $('span[data-testid="student-navigation-container"]');
      const courseName = $('span[data-testid="course-link-text"]').text();
      const assignmentName = $('a[data-testid="assignment-link"]').text();

      // Change top bar to a flexbox so it can contain the new reminder button
      $(topMenu).css({ display: "flex", "align-items": "center", gap: "20px" });
      $(topMenu).append(REMINDER_BUTTON_HTML);

      $("div#mct-grader-reminder").on("click", () => {
        buildReminderInput({ createOpts: { assignmentName, courseName } });
      });
    }
  });
  observer.observe($("body")[0], { childList: true, subtree: true });
}
