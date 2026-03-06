const UNPUBLISHED_COLOR = "#ffbdbd";
const PUBLISHED_COLOR = "rgb(211, 241, 185)";
let assignmentInUnpubMod = false;

const CLOSE_BUTTON = `
<div id="close-button"
     style="cursor: pointer">
  X
</div>
`;

const WARNING_BOX_HTML = `
<div id="warning-box" 
     style="position: fixed; background-color: #ffffff; height: 150px; right: 0; bottom: 0; width: 400px; z-index: 99; border-left: 6px solid ${UNPUBLISHED_COLOR}; border-radius: 0.375rem; padding: 0.5rem; box-shadow: 10px 20px 30px rgba(0, 0, 0, 0.24);">
  <div id="warning-header" style="display: flex; justify-content: space-between; font-size: 1.5rem">
    <div>Warning</div>
    ${CLOSE_BUTTON}
  </div>
  <div style="margin-top: 1rem">
    There are one or more published assignments in unpublished modules
  </div>
  <button style="margin-top: 1rem; background-color: ${UNPUBLISHED_COLOR}; border: none; padding: 0.5rem; border-radius: 0.375rem; cursor: pointer" id="go-to-assignments" onclick="window.location.href='/courses/${window.location.pathname.split("/")[2]}/modules'">
    Go to modules
  </button>
</div>
`;

const Indicator = `
<div id="published-indicator" style="border: 2px solid gray; padding: 0.5rem; border-radius: 0.375rem; justify-content: start; display: flex;"> Unpublished </div>
`;

// Temp solution
function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function modifyButtons(
  buttons: JQuery<HTMLElement>,
  moduleState: string | undefined,
) {
  for (const button of buttons) {
    if (moduleState === "unpublished") {
      $(button).css("background-color", UNPUBLISHED_COLOR);
    } else {
      $(button).css("background-color", PUBLISHED_COLOR);
    }
  }
}

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
        .css("border-left", `4px solid ${UNPUBLISHED_COLOR}`);
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
        .css("background-color", UNPUBLISHED_COLOR)
        .children(".prerequisites")
        .append(Indicator);
    } else {
      $(module).children(".ig-header").css("background-color", PUBLISHED_COLOR);
    }

    const assignmentList = $(module).find("div.content > ul.ig-list")[0];
    const assignments = $(assignmentList).children("li");
    modifyAssignments(assignments, state);

    sleep(1000).then(() => {
      const buttonAreas = $(module).find(
        "div.module-publish-icon > span > span > button > span",
      );
      modifyButtons(buttonAreas, state);
    });
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
