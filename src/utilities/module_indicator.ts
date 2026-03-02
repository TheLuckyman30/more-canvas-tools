import { Module } from "~src/canvas/interfaces";

function colorPublishedModules(
  publishedModules: Module[],
  moduleContainer: HTMLElement,
) {
  const headers = publishedModules.map((m) => {
    return $(moduleContainer).find(`#${m.id}`);
  });
  for (const header of headers) {
    $(header[0]).css("background-color", "green");
  }
}

function colorUnpublishedModules(
  unpublishedModules: Module[],
  moduleContainer: HTMLElement,
) {
  const headers = unpublishedModules.map((m) => {
    return $(moduleContainer).find(`#${m.id}`);
  });

  for (const header of headers) {
    $(header[0]).css("background-color", "red");
  }
}

export async function injectModuleIndicator(target: HTMLElement) {
  const token = GM_getValue("CANVAS_TOKEN");
  const response = await fetch(
    "https://canvas.instructure.com/api/v1/courses/14264155/modules",
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const allModules: Module[] = await response.json();
  const publishedModules: Module[] = [];
  const unpublishedModules = allModules.filter((m) => {
    if (!m.published) return m;
    publishedModules.push(m);
  });

  colorUnpublishedModules(unpublishedModules, target);
  colorPublishedModules(publishedModules, target);
}
