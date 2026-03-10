const UNPUBLISHED_COLOR = "#ffbdbd";
const PUBLISHED_COLOR = "rgb(211, 241, 185)";

interface Warning {
  id: string;
  moduleName: string;
  assignmentName: string;
  showWarning: boolean;
}

const CLOSE_BUTTON_HTML = `
<div id="mct-warning-close"
     style="cursor: pointer">
  X
</div>
`;

const NEXT_BUTTON_HTML = `
<button id="mct-next-warning" style="margin-top: 1rem; background-color: ${UNPUBLISHED_COLOR}; border: none; padding: 0.5rem; width: 6vw; border-radius: 0.375rem; cursor: pointer">
  Next
</button>
`;

const PREV_BUTTON_HTML = `
<button id="mct-prev-warning" style="margin-top: 1rem; background-color: ${UNPUBLISHED_COLOR}; border: none; width: 6vw; padding: 0.5rem; border-radius: 0.375rem; cursor: pointer">
  Prev
</button>
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

function createWarningBox(
  warningsMap: Map<string, Warning>,
  warnings: Warning[],
  index: number,
  length: number,
) {
  const { id, moduleName, assignmentName, showWarning } = warnings[index];
  const canDisplayNext = index !== length - 1 && length > 1;
  const canDisplayPrev = index !== 0 && length > 1;

  if (showWarning) {
    const newWarning = `
      <div id="mct-warning-box" 
          style="position: fixed; background-color: #ffffff; height: 150px; right: 0; bottom: 0; width: 400px; z-index: 99; border-left: 6px solid ${UNPUBLISHED_COLOR}; border-radius: 0.375rem; padding: 0.5rem; box-shadow: 10px 20px 30px rgba(0, 0, 0, 0.24);">
        <div id="warning-header" style="display: flex; justify-content: space-between; font-size: 1.5rem">
          <div>Warning</div>
          <div>${index + 1}/${length}</div>
          ${CLOSE_BUTTON_HTML}
        </div>
        <div style="margin-top: 1rem">
          ${moduleName} - ${assignmentName}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center">
          <button style="margin-top: 1rem; background-color: ${UNPUBLISHED_COLOR}; border: none; padding: 0.5rem; border-radius: 0.375rem; cursor: pointer" id="go-to-assignments" onclick="window.location.href='/courses/${window.location.pathname.split("/")[2]}/modules'">
            Go to modules
          </button>
            ${canDisplayPrev ? PREV_BUTTON_HTML : ""}
            ${canDisplayNext ? NEXT_BUTTON_HTML : ""}
          </div>
      </div>
    `;

    $("#mct-warning-box").remove();
    $("div#application > div#wrapper").append(newWarning);

    if (canDisplayNext) {
      $("#mct-next-warning").on("click", () => {
        createWarningBox(warningsMap, warnings, index + 1, length);
      });
    }

    if (canDisplayPrev) {
      $("#mct-prev-warning").on("click", () => {
        createWarningBox(warningsMap, warnings, index - 1, length);
      });
    }

    $("#mct-warning-close").on("click", () => {
      const warning = warningsMap.get(id);
      if (warning) {
        const newWarning = { ...warning, showWarning: false };
        warningsMap.set(id, newWarning);
      }
      warnings.splice(index, 1);

      if (!canDisplayNext && canDisplayPrev) {
        createWarningBox(warningsMap, warnings, index - 1, warnings.length);
      } else if (canDisplayNext) {
        createWarningBox(warningsMap, warnings, index, warnings.length);
      } else {
        $("#mct-warning-box").remove();
      }
    });
  }
}

function modifyAssignments(
  assignments: JQuery<HTMLLIElement>,
  moduleState: string | undefined,
  moduleName: string,
  warnings: Map<string, Warning>,
) {
  for (const assignment of assignments) {
    const state = $(assignment).find("div.ig-row").hasClass("ig-published");
    const assignmentName = $(assignment).find("a.ig-title").attr("title") ?? "";
    const id =
      $(assignment)
        .find("a.ig-title")
        .attr("aria-describedby")
        ?.split("-")[2] ?? "";

    if (moduleState == "active") {
      warnings.delete(id);
    }

    if (!state) {
      $(assignment)
        .children("div.ig-row")
        .css("border-left", `4px solid ${UNPUBLISHED_COLOR}`);
      warnings.delete(id);
    } else {
      $(assignment).children("div.ig-row").css("border-left", "");
      if (
        moduleState === "unpublished" &&
        !warnings.has(id) &&
        moduleName &&
        assignmentName
      ) {
        warnings.set(id, { id, moduleName, assignmentName, showWarning: true });
      }
    }
  }
}

function modifyModules(
  modules: JQuery<HTMLElement>,
  warnings: Map<string, Warning>,
) {
  for (const module of modules) {
    const state = $(module).attr("data-workflow-state");
    const buttonArea = $(module).find(
      "div.module-publish-icon > span > span > button > span",
    );
    const moduleName =
      $(module).find("div.ig-header > span > span.name").attr("title") ?? "";

    // Modify Module Header and label
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

    // Modify publish icon bg color
    $(buttonArea).css(
      "background-color",
      state === "active" ? PUBLISHED_COLOR : UNPUBLISHED_COLOR,
    );

    const assignments = $(module)
      .find("div.content > ul.ig-list")
      .children("li");

    modifyAssignments(assignments, state, moduleName, warnings);
  }
}

export function injectModuleIndicator(target: HTMLElement) {
  const warnings = new Map<string, Warning>();
  const observer = new MutationObserver(() => {
    observer.disconnect();

    const modules = $(target).children("[data-workflow-state]");
    modifyModules(modules, warnings);

    const filteredWarnings = warnings
      .values()
      .filter((warning) => warning.showWarning)
      .toArray();
    $("#mct-warning-box").remove();
    if (filteredWarnings.length) {
      createWarningBox(warnings, filteredWarnings, 0, filteredWarnings.length);
    }

    observer.observe(target, { childList: true, subtree: true });
  });

  observer.observe(target, { childList: true, subtree: true });
}
