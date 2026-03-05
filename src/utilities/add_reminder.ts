import { CreateCalendarEvent, Reminder } from "~src/canvas/interfaces";

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

const SUBMIT_BUTTON_HTML = `
<button id="mct-submit-reminder">
    Submit
</button>
`;

const INPUT_CONTAINER_HTML = `
<div id="mct-input-container"
    style="position: fixed; height: 100%; width: 100%; backdrop-filter: blur(4px); background-color: rgba(255, 255, 255, 0.2); z-index: 99; top: 0; bottom: 0; right: 0; left: 0; display: flex; justify-content: center; align-items: center">
    <div style="display: flex; flex-direction: column; width: 20rem; height: 15rem; background-color: #E5E7EB; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); padding: 0.5rem; border-radius: 0.375rem;">
        <div style="display: flex; justify-content: space-between; font-size: 1.5rem">
            <span>Set Your Reminder:</span>
            ${CLOSE_BUTTON}
        </div>
        <div style="display: flex; justify-content: center; align-items: center; height: 100%; width: 100%">
            ${DATE_INPUT_HTML}
        </div>
        <div style="width: 100%; display: flex; justify-content: center">
            ${SUBMIT_BUTTON_HTML}
        </div>
    </div>
</div>
`;

export async function injectAddReminder(target: HTMLElement) {
  const courseName = $('span[data-testid="course-link-text"]').text();
  const assignmentName = $('a[data-testid="assignment-link"]').text();

  // Change top bar to a flexbox so it can contain the new reminder button
  $(target).css({ display: "flex", "align-items": "center", gap: "20px" });
  $(target).append(REMINDER_BUTTON_HTML);

  $("div#mct-grader-reminder").on("click", () => {
    $("body").append(INPUT_CONTAINER_HTML);

    $("button#mct-submit-reminder").on("click", () => {
      const datePicker = $("input#mct-date-picker");
      const date = datePicker.val() as string;

      if (date) {
        const token = GM_getValue("CANVAS_TOKEN");
        const courseId = $('a[data-testid="course-link"]')
          .attr("href")
          ?.split("/")[2];

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
        fetch("https://canvas.instructure.com/api/v1/calendar_events", {
          body: JSON.stringify(newCalendarEvent),
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          method: "POST",
        });

        let nextId = Number(localStorage.getItem("mct-reminder-nextId")) ?? 0;
        const reminders: Reminder[] = JSON.parse(
          localStorage.getItem("mct-reminders") ?? "[]",
        );
        reminders.push({
          id: nextId,
          url: `https://canvas.instructure.com/courses/${courseId}/gradebook`,
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
