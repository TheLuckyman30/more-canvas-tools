const UNPUBLISHED_COLOR = "#ffbdbd";
const PUBLISHED_COLOR = "rgb(211, 241, 185)";
let assignmentInUnpubMod = false;

const CLOSE_BUTTON = `
<div id="mct-close-button"
     style="cursor: pointer">
  X
</div>
`;

const WARNING_BOX_HTML = `
<div id="mct-warning-box" 
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

const UNPUBLISHED_INDICATOR = `
<div id="mct-unpublished-indicator" style="border: 2px solid gray; padding: 0.5rem; border-radius: 0.375rem; justify-content: start; display: flex;"> 
  Unpublished 
</div>
`;
const PUBLISHED_INDICATOR = `
<div id="mct-published-indicator" style="border: 2px solid gray; padding: 0.5rem; border-radius: 0.375rem; justify-content: start; display: flex;"> 
  Published 
</div>
`;

function modifyButtonArea(
  buttonArea: JQuery<HTMLElement>,
  moduleState: string | undefined,
) {
  if (moduleState === "unpublished") {
    $(buttonArea).css("background-color", UNPUBLISHED_COLOR);
  } else {
    $(buttonArea).css("background-color", PUBLISHED_COLOR);
  }
}

function modifyAssignments(
  assignments: JQuery<HTMLLIElement>,
  moduleState: string | undefined,
) {
  for (const assignment of assignments) {
    const state = $(assignment).find("div.ig-row").hasClass("ig-published");

    if (!state) {
      $(assignment)
        .children("div.ig-row")
        .css("border-left", `4px solid ${UNPUBLISHED_COLOR}`);
    } else {
      $(assignment).children("div.ig-row").css("border-left", "");
      if (moduleState === "unpublished") assignmentInUnpubMod = true;
    }
  }
}

function modifyModules(modules: JQuery<HTMLElement>) {
  for (const module of modules) {
    const state = $(module).attr("data-workflow-state");

    $(module).find("#mct-unpublished-indicator").remove();
    $(module).find("#mct-published-indicator").remove();
    $(module)
      .children(".ig-header")
      .css(
        "background-color",
        state === "active" ? PUBLISHED_COLOR : UNPUBLISHED_COLOR,
      )
      .children(".prerequisites")
      .append(state === "active" ? PUBLISHED_INDICATOR : UNPUBLISHED_INDICATOR);

    const assignmentList = $(module).find("div.content > ul.ig-list")[0];
    const assignments = $(assignmentList).children("li");
    const buttonArea = $(module).find(
      "div.module-publish-icon > span > span > button > span",
    );

    modifyAssignments(assignments, state);
    modifyButtonArea(buttonArea, state);
  }
}

export function injectModuleIndicator(target: HTMLElement) {
  const observer = new MutationObserver(() => {
    observer.disconnect();

    const modules = $(target).children("[data-workflow-state]");
    modifyModules(modules);

    if (assignmentInUnpubMod) {
      $("div#application > div#wrapper").append(WARNING_BOX_HTML);
      $("#mct-close-button").on("click", () => {
        $("div#application > div#wrapper > #mct-warning-box").remove();
      });
    }

    observer.observe(target, { childList: true, subtree: true });
  });

  observer.observe(target, { childList: true, subtree: true });
}
