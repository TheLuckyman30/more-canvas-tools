import { Module } from "~src/canvas/interfaces";

export async function injectModuleIndicator(target: HTMLElement) {
  const token = GM_getValue("CANVAS_TOKEN");
  const info = await fetch(
    "https://canvas.instructure.com/api/v1/courses/14264155/modules",
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const modules: Module[] = await info.json();
  const unpublishedModules = modules.filter((m) => !m.published);

  const headers = unpublishedModules.map((m) => {
    return $(target).find(`#${m.id}`);
  });

  $(headers[0][0]).css("background-color", "red");
}
