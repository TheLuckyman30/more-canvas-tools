import { CreateCalendarEvent, Reminder } from "~src/canvas/interfaces";

const CLOSE_BUTTON = `
<div id="mct-grader-close"
     style="cursor: pointer; font-family: arial; color: #a1a1a1; font-size: 1.5rem">
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
            <span style= "font-family: arial">Set Your Reminder:</span>
            ${CLOSE_BUTTON}
        </div>
        <div style="display: flex; justify-content: center; align-items: center; height: 100%; width: 100%; font-family: arial; font-size: 1rem; gap: 0.5rem; flex-direction: column; padding: 0.5rem;">
          Choose Date for Release Reminder:
          <p></p>
            ${DATE_INPUT_HTML}
        </div>
        <div style="width: 100%; display: flex; justify-content: center">
            ${SUBMIT_BUTTON_HTML}
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
  const courseName = $('span[data-testid="course-link-text"]').text();
  const assignmentName = $('a[data-testid="assignment-link"]').text();

  // Change top bar to a flexbox so it can contain the new reminder button
  $(topMenu).css({ display: "flex", "align-items": "center", gap: "20px" });
  $(topMenu).append(REMINDER_BUTTON_HTML);

  $("div#mct-grader-reminder").on("click", () => {
    $("body").append(INPUT_CONTAINER_HTML);

    $("button#mct-submit-reminder").on("click", async () => {
      const datePicker = $("input#mct-date-picker");
      const date = datePicker.val() as string;

      if (date) {
        const token = GM_getValue("CANVAS_TOKEN");
        const courseId = window.location.pathname.split("/")[2];

        const [year, month, day] = date.split("-").map((val) => Number(val));
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
        const response = await fetch(
          "https://canvas.instructure.com/api/v1/calendar_events",
          {
            body: JSON.stringify(newCalendarEvent),
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            method: "POST",
          },
        );
        const calEvent = await response.json();

        let nextId = Number(localStorage.getItem("mct-reminder-nextId")) ?? 0;
        const reminders: Reminder[] = JSON.parse(
          localStorage.getItem("mct-reminders") ?? "[]",
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

      $("div#mct-input-container").remove();
    });

    $("div#mct-grader-close").on("click", () => {
      $("div#mct-input-container").remove();
    });
  });
}
