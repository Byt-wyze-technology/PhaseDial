import { expect, test } from "playwright/test";

test("sums the probability invariant live rather than asserting it", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator(".invariant")).toHaveText(/NORM = 1\.000 ✓/);

  // The invariant must hold across ancilla sizes, not only the default.
  for (const bits of ["2", "5", "8"]) {
    await page.getByLabel("Ancilla qubits").fill(bits);
    await expect(page.locator(".invariant")).toHaveText(/NORM = 1\.000 ✓/);
  }
});

test("expands a lesson and applies its setup to the lab", async ({ page }) => {
  await page.goto("/");

  const lesson = page.getByRole("button", { name: /Precision and scale/ });
  await expect(lesson).toHaveAttribute("aria-expanded", "false");

  await lesson.click();
  await expect(lesson).toHaveAttribute("aria-expanded", "true");

  await page.getByRole("button", { name: /Read it with three helpers/ }).click();
  await expect(page.getByLabel("Ancilla qubits")).toHaveValue("3");
  await expect(page.getByLabel("Evolution time")).toHaveValue("3.2");
});

test("quotes peak probabilities the simulator actually renders", async ({ page }) => {
  await page.goto("/");

  // Lesson 10 states 87.7% on the peak at three bits and 57.4% at four.
  await page.getByLabel("Evolution time").fill("3.2");
  await page.getByLabel("Ancilla qubits").fill("3");
  await expect(page.locator(".bar-wrap").nth(3).locator(".bar span")).toHaveText("88%");

  await page.getByLabel("Ancilla qubits").fill("4");
  await expect(page.locator(".bar-wrap").nth(6).locator(".bar span")).toHaveText("57%");
});
