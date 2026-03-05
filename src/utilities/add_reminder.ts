const TIME_BUTTON_HTML = ``;

// Temp solution
function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function injectAddReminder() {
  await sleep(2000);
  const topMenu = $("span#top-menu");
  const section = $(topMenu).find(
    'span[data-testid="student-navigation-container"]',
  );
  $(section).css({ display: "flex", "align-items": "center", gap: "20px" });
  $(section).append("<div>Hello</div>");
}
