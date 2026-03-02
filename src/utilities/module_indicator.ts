const UNPUBLISHED_COLOR = "red";
const PUBLISHED_COLOR = "green";

function modifyAssignments(assignments: JQuery<HTMLLIElement>) {
  for (const assignment of assignments) {
    const state = $(assignment)
      .find("div.ig-admin > span[data-published]")
      .attr("data-published");
    if (state === "false") {
      $(assignment)
        .children("div.ig-row")
        .css("border-left", `3px solid ${UNPUBLISHED_COLOR}`);
    }
  }
}

function modifyModules(modules: JQuery<HTMLElement>, color: string) {
  for (const module of modules) {
    $(module).children(".ig-header").css("background-color", color);

    const assignmentList = $(module).find("div.content > ul.ig-list")[0];
    const assignments = $(assignmentList).children("li");
    modifyAssignments(assignments);
  }
}

export async function injectModuleIndicator(target: HTMLElement) {
  const unpublishedModules = $(target).children(
    '[data-workflow-state="unpublished"]',
  );
  const publishedModules = $(target).children('[data-workflow-state="active"]');

  modifyModules(unpublishedModules, UNPUBLISHED_COLOR);
  modifyModules(publishedModules, PUBLISHED_COLOR);
}
