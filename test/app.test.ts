// @vitest-environment happy-dom
import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
it("runs the add and status flow through the controller", async () => {
  const html = readFileSync("index.html", "utf8");
  document.body.innerHTML = html.slice(html.indexOf("<body>") + 6, html.indexOf("<script"));
  localStorage.clear();
  await import("../src/app");
  document.querySelector<HTMLInputElement>("#item-name")!.value = "Rye";
  document.querySelector<HTMLSelectElement>("#item-category")!.value = "Whiskey";
  document.querySelector<HTMLFormElement>("#add-form")!.requestSubmit();
  expect(document.querySelector(".bottle-row")?.textContent).toContain("Rye");
  document.querySelector<HTMLButtonElement>('[data-status="out"]')!.click();
  expect(JSON.parse(localStorage.getItem("amber-cabinet:v1")!)[0].status).toBe("out");
});
