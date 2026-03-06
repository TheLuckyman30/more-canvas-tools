import { Assignment } from "~src/canvas/interfaces";

async function modifyAssignments(assignmentsOnPage: JQuery<HTMLElement>) {
  const token = GM_getValue("CANVAS_TOKEN");
  const courseId = window.location.pathname.split("/")[2];
  const response = await fetch(
    `https://canvas.instructure.com/api/v1/courses/${courseId}/assignments`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const fetchedAssignments: Assignment[] = await response.json();

  for (const assignment of assignmentsOnPage) {
    const assignmentId = Number($(assignment).val());
    const fetchedAssignment = fetchedAssignments.find(
      (a) => a.id === assignmentId,
    );

    if (fetchedAssignment) {
      if (fetchedAssignment.published) {
        $(assignment).append("<div>-----Unpublished</div>");
      } else {
        $(assignment).append("<div>-----Published</div>");
      }
    }
  }
}

export function injectAssignmentIndicator() {
  $("button.add_module_item_link").on("click", () => {
    const observer = new MutationObserver(async (_, obs) => {
      const target = $('div[aria-labelledby="ui-id-2"]');
      if (target.length) {
        obs.disconnect();

        const assignmentsOnPage = $(target)
          .find('optgroup[label="Assignments"]')
          .children();
        modifyAssignments(assignmentsOnPage);

        $(target)
          .find('button[aria-label="Close"]')
          .on("click", () => {
            $(target).remove();
          });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
}
