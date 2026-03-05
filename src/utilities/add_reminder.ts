import { Reminder } from "~src/canvas/interfaces";

const CLOSE_BUTTON = `
<div id="mct-grader-close"
     style="cursor: pointer">
  X
</div>
`;

const REMINDER_BUTTON_HTML = `
<div id="mct-grader-reminder" 
    style="background-color: white; padding: 0.5rem; border-radius: 0.375rem; cursor: pointer;">
    Set Reminder
</div>
`;

const DATE_INPUT_HTML = `
<input id="mct-date-picker" type="date"/>
`;

const INPUT_CONTAINER_HTML = `
<div id="mct-input-container"
    style="position: fixed; height: 100%; width: 100%; backdrop-filter: blur(4px); background-color: rgba(255, 255, 255, 0.2); z-index: 99; top: 0; bottom: 0; right: 0; left: 0; display: flex; justify-content: center; align-items: center">
    <div style="width: 20rem; height: 15rem; background-color: #E5E7EB; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); padding: 0.5rem; border-radius: 0.375rem;">
        <div style="display: flex; justify-content: space-between; font-size: 1.5rem">
            <span>Set Your Reminder:</span>
            ${CLOSE_BUTTON}
        </div>
        <div style="display: flex; justify-content: center; align-items: center; height: 100%; width: 100%">
            ${DATE_INPUT_HTML}
        </div>
    </div>
</div>
`;

// Temp solution
function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function injectAddReminder(target: HTMLElement) {
  await sleep(2000);
  const topMenu = $('span[data-testid="student-navigation-container"]');
  $(topMenu).css({ display: "flex", "align-items": "center", gap: "20px" });
  $(topMenu).append(REMINDER_BUTTON_HTML);

  $("div#mct-grader-reminder").on("click", () => {
    $(target).append(INPUT_CONTAINER_HTML);

    const datePicker = $("input#mct-date-picker");
    $(datePicker).on("change", () => {
      const date = datePicker.val() as string;
      const [year, month, day] = date.split("-").map((val) => Number(val));
      const newDate = new Date(year, month - 1, day).toLocaleDateString();
      const reminders: Reminder[] = JSON.parse(
        localStorage.getItem("mct-reminders") ?? "[]",
      );
      reminders.push({
        targetDate: newDate,
        courseName: "course",
        assignmentName: "assignment",
      });
      localStorage.setItem("mct-reminders", JSON.stringify(reminders));
    });

    $("div#mct-grader-close").on("click", () => {
      $("div#mct-input-container").remove();
    });
  });
}
