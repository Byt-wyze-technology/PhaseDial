import { expect, test } from "playwright/test";

test("renders the default positive adjoint-unitary phase", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByLabel("Evolution time")).toHaveValue("3.2");
  await expect(page.locator(".energy b")).toHaveText("E = 0.785");
  await expect(page.locator(".phase-readout span")).toHaveText("φ₊ = Et / 2π");
  await expect(page.locator(".phase-readout b")).toHaveText("0.4000 turns");

  const precisionValues = page.locator(".precision-row > div > b");
  await expect(precisionValues.nth(0)).toHaveText("0.400000");
  await expect(precisionValues.nth(1)).toHaveText("0.375000");
  await expect(precisionValues.nth(2)).toHaveText("0.025000");
});

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
