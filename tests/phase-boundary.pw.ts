import { expect, test } from "playwright/test";

test("reports circular phase error when the estimate wraps to zero", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Ancilla qubits").fill("3");
  await page.getByLabel("Evolution time").fill("7.92");

  const precisionValues = page.locator(".precision-row > div > b");
  await expect(precisionValues.nth(0)).toHaveText("0.990000");
  await expect(precisionValues.nth(1)).toHaveText("0.000000");
  await expect(precisionValues.nth(2)).toHaveText("0.010000");

  await page.getByRole("button", { name: /Measure phase/ }).click();
  await expect(page.getByRole("button", { name: /Measure again/ })).toBeVisible();
  await page.getByRole("button", { name: /Measure again/ }).click();
  await expect(page.locator(".measurement b")).toHaveText(/^[01]{3}$/);
});
