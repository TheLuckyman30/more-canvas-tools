const UNPUBLISHED_COLOR = "red";
const PUBLISHED_COLOR = "green";
let assignmentInUnpubMod = false;

const CLOSE_BUTTON = `
<div id="close-button"
     style="cursor: pointer">
  X
</div>
`;

const WARNING_BOX_HTML = `
<div id="warning-box" 
     style="position: absolute; background-color: #E5E7EB; height: 150px; right: 0; bottom: 0; width: 400px; z-index: 99; border: 2px solid red; border-radius: 0.375rem; padding: 0.5rem;">
  <div id="warning-header" style="display: flex; justify-content: space-between; font-size: 1.5rem">
    <div>Warning</div>
    ${CLOSE_BUTTON}
  </div>
  <div style="margin-top: 1rem">
    There are one or more published assignments in unpublished modules
  </div>
</div>
`;

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

  if (assignmentInUnpubMod) {
    $("div#application > div#wrapper").append(WARNING_BOX_HTML);
    $("#close-button").on("click", () => {
      $("div#application > div#wrapper > div#warning-box").remove();
    });
  }
}
