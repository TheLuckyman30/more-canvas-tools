const UNPUBLISHED_COLOR = "red";
const PUBLISHED_COLOR = "green";
let assignmentInUnpubMod = false;

const WARNING_BOX_HTML = "";

function modifyAssignments(
  assignments: JQuery<HTMLLIElement>,
  moduleState: string | undefined,
) {
  for (const assignment of assignments) {
    const state = $(assignment)
      .find("div.ig-admin > span[data-published]")
      .attr("data-published");
    if (state === "false") {
      $(assignment)
        .children("div.ig-row")
        .css("border-left", `3px solid ${UNPUBLISHED_COLOR}`);
    }
    if (moduleState === "unpublished" && state === "true") {
      assignmentInUnpubMod = true;
    }
  }
}

function modifyModules(modules: JQuery<HTMLElement>) {
  for (const module of modules) {
    const state = $(module).attr("data-workflow-state");
    if (state === "unpublished") {
      $(module)
        .children(".ig-header")
        .css("background-color", UNPUBLISHED_COLOR);
    } else {
      $(module).children(".ig-header").css("background-color", PUBLISHED_COLOR);
    }

    const assignmentList = $(module).find("div.content > ul.ig-list")[0];
    const assignments = $(assignmentList).children("li");
    modifyAssignments(assignments, state);
  }
}

export async function injectModuleIndicator(target: HTMLElement) {
  const modules = $(target).children("[data-workflow-state]");
  modifyModules(modules);
}
