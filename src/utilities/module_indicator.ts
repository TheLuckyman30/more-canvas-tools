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

const UNPUBLISHED_INDICATOR_HTML = `
<div id="mct-unpublished-indicator" style="border-right: 1px solid gray;padding-left: 0.5rem; padding-right: 0.5rem; justify-content: start; display: flex;  text-shadow: 1px 1px 0 rgba(255, 255, 255, .5);"> 
  <b>Unpublished</b>
</div>
`;
const PUBLISHED_INDICATOR_HTML = `
<div id="mct-published-indicator" style="border-right: 1px solid gray; padding-left: 0.5rem; padding-right: 0.5rem; justify-content: start; display: flex;  text-shadow: 1px 1px 0 rgba(255, 255, 255, .5);"> 
  <b>Published</b>
</div>
`;

const WARNING_CHECKBOX_HTML = (defaultValue: boolean, moduleId: string) => `
<input id="mct-warning-checkbox-${moduleId}" type="checkbox" module-id="${moduleId}" ${defaultValue ? "checked" : ""} title= "Enable module indicator warnings" style="height: 1rem; width: 1rem; align-items: center; display: flex; "/>
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
          Assignment, <strong>${assignmentName}</strong>, is published. However it's module, <strong>${moduleName}</strong>, is unpublished.
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
  canNotify: boolean,
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
        assignmentName &&
        canNotify
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
  const moduleSettings = getModuleSettings();

  for (const module of modules) {
    const state = $(module).attr("data-workflow-state");
    const buttonArea = $(module).find(
      "div.module-publish-icon > span > span > button > span",
    );
    const moduleName =
      $(module).find("div.ig-header > span > span.name").attr("title") ?? "";
    const moduleId = $(module).attr("data-module-id") ?? "";
    const canNotify = moduleSettings.get(moduleId) ?? true;

    // Modify Module Header and label
    $(module).find("#mct-unpublished-indicator").remove();
    $(module).find("#mct-published-indicator").remove();
    $(module).find('[id*="mct-warning-checkbox"]').remove();
    $(module)
      .children(".ig-header")
      .css({
        "background-color": state === "active" ? PUBLISHED_COLOR : UNPUBLISHED_COLOR,
        "justify-content": "center",
        "align-items": "center"
      })

      .children(".prerequisites")
      .append(
        state === "active"
          ? PUBLISHED_INDICATOR_HTML
          : UNPUBLISHED_INDICATOR_HTML,
      )
      
      $(module)
        .find(".ig-header> div.module_header_items")
        .after(WARNING_CHECKBOX_HTML(canNotify, moduleId))


    // Modify publish icon bg color
    $(buttonArea).css(
      "background-color",
      state === "active" ? PUBLISHED_COLOR : UNPUBLISHED_COLOR,
    );

    const assignments = $(module)
      .find("div.content > ul.ig-list")
      .children("li");

    modifyAssignments(assignments, state, moduleName, canNotify, warnings);
  }
}

function getModuleSettings() {
  const moduleSettings: Map<string, boolean> = new Map(
    JSON.parse(localStorage.getItem("mct-module-settings") ?? "[]"),
  );

  return moduleSettings;
}

function setNewSetting(newSettings: Map<string, boolean>) {
  localStorage.setItem(
    "mct-module-settings",
    JSON.stringify(Array.from(newSettings.entries())),
  );
}

function initModuleSettings(modules: JQuery<HTMLElement>) {
  const moduleSettings = getModuleSettings();

  for (const key of moduleSettings.keys()) {
    if (!($(modules).attr("data-module-id") === key)) {
      moduleSettings.delete(key);
    }
  }

  for (const module of modules) {
    const moduleId = $(module).attr("data-module-id") ?? "";

    if (!moduleSettings.has(moduleId)) {
      moduleSettings.set(moduleId, true);
    }
  }
  setNewSetting(moduleSettings);
}

export function injectModuleIndicator(target: HTMLElement) {
  const warnings = new Map<string, Warning>();
  const observer = new MutationObserver(() => {
    observer.disconnect();

    const modules = $(target).children("[data-workflow-state]");
    initModuleSettings(modules);
    modifyModules(modules, warnings);

    const filteredWarnings = warnings
      .values()
      .filter((warning: Warning) => warning.showWarning)
      .toArray();
    $("#mct-warning-box").remove();
    if (filteredWarnings.length) {
      createWarningBox(warnings, filteredWarnings, 0, filteredWarnings.length);
    }

    $('[id*="mct-warning-checkbox"]').on("change", function () {
      const checked = $(this).is(":checked");
      const moduleId = $(this).attr("module-id") ?? "";
      const moduleSettings = getModuleSettings();
      moduleSettings.set(moduleId, checked);
      setNewSetting(moduleSettings);
    });

    observer.observe(target, { childList: true, subtree: true });
  });

  observer.observe(target, { childList: true, subtree: true });
}
