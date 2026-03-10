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
  const newOptions: string[] = [];

  for (const assignment of assignmentsOnPage) {
    const assingmentName = $(assignment).text().split("-")[0];
    let assignmentId = Number($(assignment).val());
    if (!assignmentId) {
      assignmentId = Number($(assignment).attr("id"));
    }
    const fetchedAssignment = fetchedAssignments.find(
      (a) => a.id === assignmentId,
    );
    console.log(assignmentId);

    if (fetchedAssignment) {
      const newOption = `
        <div id="${assignmentId}" style="display: flex;">
          <option value="${assignmentId}">${assingmentName}</option>
          <div>-----${fetchedAssignment.published ? "Published" : "Unpublished"}</div>
        </div>
      `;
      newOptions.push(newOption);
    }
  }

  return newOptions;
}

export function injectAssignmentIndicator() {
  $("button.add_module_item_link").on("click", () => {
    const observer = new MutationObserver(async () => {
      const optionsGroup = $('optgroup[label="Assignments"]');
      if (optionsGroup.length) {
        observer.disconnect();

        const assignmentsOnPage = $(optionsGroup).children();
        optionsGroup.children().remove();
        const newOptions = await modifyAssignments(assignmentsOnPage);
        for (const option of newOptions) {
          optionsGroup.append(option);
        }
      }
    });
    observer.observe($("body")[0], { childList: true, subtree: true });
  });
}
