import { test, expect } from "@playwright/test";
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=",
  "base64",
);
async function fresh(page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Start your own" }).click();
  await page.getByRole("button", { name: "Start my journal" }).click();
  await expect(page.getByText("EXAMPLE JOURNAL", { exact: true })).toHaveCount(
    0,
  );
}
async function fillSession(page) {
  await page.getByRole("button", { name: "New entry", exact: true }).click();
  await page.getByLabel("Net P&L ($)", { exact: true }).fill("250.50");
  await page.getByLabel("Total trades", { exact: true }).fill("3");
  await page.getByLabel("Winning trades", { exact: true }).fill("2");
  await page.getByRole("button", { name: "Focused", exact: true }).click();
  await page.getByRole("button", { name: "Pullback", exact: true }).click();
  await page.getByLabel("Respected my risk limit", { exact: true }).check();
  await page.getByLabel("Waited for my setup", { exact: true }).check();
  await page
    .getByLabel("Lessons & takeaways", { exact: true })
    .fill("Wait for confirmation and stay patient.");
}
test("saves journal, image, tags and rules across reload; weekly review reflects them", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await fresh(page);
  await fillSession(page);
  await page
    .locator("#chart-upload")
    .setInputFiles({ name: "chart.png", mimeType: "image/png", buffer: png });
  await expect(page.getByAltText("chart.png")).toBeVisible();
  await page.getByRole("button", { name: "Save entry", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await expect(page.getByText("+$250.50").first()).toBeVisible();
  await page
    .getByRole("button", { name: "Weekly review", exact: true })
    .click();
  await page.getByRole("button", { name: "Today", exact: true }).click();
  await expect(
    page.getByText("Wait for confirmation and stay patient.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("50%", { exact: true })).toBeVisible();
  await expect(
    page.locator(".insights-grid li").filter({ hasText: "Pullback" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Focused.*confirmation/ }).click();
  await expect(page.getByLabel("Lessons & takeaways")).toHaveValue(
    "Wait for confirmation and stay patient.",
  );
  await expect(page.getByAltText("chart.png")).toBeVisible();
  await expect(page.getByLabel("Waited for my setup")).toBeChecked();
  expect(errors).toEqual([]);
});
test("validates totals and protects unsaved changes; deletion persists", async ({
  page,
}) => {
  await fresh(page);
  await fillSession(page);
  await page.getByLabel("Winning trades", { exact: true }).fill("4");
  await page.getByRole("button", { name: "Save entry", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Winning trades cannot exceed",
  );
  await page.getByLabel("Winning trades", { exact: true }).fill("2");
  await page.getByRole("button", { name: "Save entry", exact: true }).click();
  await page.getByRole("button", { name: "New entry", exact: true }).click();
  await page.getByLabel("Pre-market plan").fill("Unsaved");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(page.getByText("Leave without saving?")).toBeVisible();
  await page.getByRole("button", { name: "Discard changes" }).click();
  await page.getByRole("button", { name: "New entry", exact: true }).click();
  await expect(page.getByLabel("Pre-market plan")).toHaveValue("");
  await page.getByRole("button", { name: "Delete entry", exact: true }).click();
  await page
    .getByRole("button", { name: "Delete entry", exact: true })
    .last()
    .click();
  await page.reload();
  await expect(page.getByRole("button", { name: /\+\$250.50/ })).toHaveCount(0);
});
test("backup exports and restores notes and images; malformed files preserve existing data", async ({
  page,
}) => {
  await fresh(page);
  await fillSession(page);
  await page
    .locator("#chart-upload")
    .setInputFiles({ name: "chart.png", mimeType: "image/png", buffer: png });
  await page.getByRole("button", { name: "Save entry", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export journal" }).click();
  const download = await downloadPromise;
  const path = await download.path();
  await page.getByRole("button", { name: "New entry", exact: true }).click();
  await page.getByRole("button", { name: "Delete entry", exact: true }).click();
  await page
    .getByRole("button", { name: "Delete entry", exact: true })
    .last()
    .click();
  await page
    .locator('input[accept=".json,application/json"]')
    .setInputFiles(path);
  await page
    .getByRole("button", { name: "Restore entries", exact: true })
    .click();
  await page.getByRole("button", { name: "New entry", exact: true }).click();
  await expect(page.getByLabel("Lessons & takeaways")).toHaveValue(
    "Wait for confirmation and stay patient.",
  );
  await expect(page.getByAltText("chart.png")).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page
    .locator('input[accept=".json,application/json"]')
    .setInputFiles({
      name: "bad.json",
      mimeType: "application/json",
      buffer: Buffer.from('{"entries": {"bad": {}}}'),
    });
  await expect(page.getByRole("status")).toContainText(
    "not a valid Day 1 backup",
  );
  await expect(page.getByText("+$250.50").first()).toBeVisible();
});
test("month navigation, week navigation and mobile fit", async ({ page }) => {
  await page.goto("/");
  const heading = await page.locator(".period-title h2").textContent();
  await page.getByRole("button", { name: "Next month" }).click();
  await expect(page.locator(".period-title h2")).not.toHaveText(heading);
  await page.getByRole("button", { name: "Previous month" }).click();
  await expect(page.locator(".period-title h2")).toHaveText(heading);
  await page.screenshot({
    path: "test-results/daymark-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("button", { name: "Weekly review", exact: true })
    .click();
  const week = await page.locator(".period-title h2").textContent();
  await page.getByRole("button", { name: "Next week" }).click();
  await expect(page.locator(".period-title h2")).not.toHaveText(week);
  await page.getByRole("button", { name: "Previous week" }).click();
  await expect(page.locator(".period-title h2")).toHaveText(week);
  await expect(page.locator(".weekly-day")).toHaveCount(7);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.screenshot({
    path: "test-results/daymark-mobile.png",
    fullPage: true,
  });
});
test("invalid uploads show errors and do not attach files", async ({
  page,
}) => {
  await fresh(page);
  await page.getByRole("button", { name: "New entry", exact: true }).click();
  await page
    .locator("#chart-upload")
    .setInputFiles({
      name: "bad.svg",
      mimeType: "image/svg+xml",
      buffer: Buffer.from("<svg/>"),
    });
  await expect(page.getByRole("alert")).toContainText("Please choose PNG");
  await expect(page.locator(".image-item")).toHaveCount(0);
});
