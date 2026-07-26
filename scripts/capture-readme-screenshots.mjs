import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { preview } from "vite";

const outputDirectory = resolve("images");
await mkdir(outputDirectory, { recursive: true });

const server = await preview({
  preview: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true
  }
});

const url = server.resolvedUrls?.local[0] ?? "http://127.0.0.1:4173";
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1
});

try {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(() => document.fonts.ready);

  await page.locator(".hero").screenshot({
    path: resolve(outputDirectory, "phasedial_overview.png"),
    animations: "disabled"
  });

  await page.locator(".timeline button").nth(2).click();
  await page.locator("#lab").screenshot({
    path: resolve(outputDirectory, "qpe_guided_lab.png"),
    animations: "disabled"
  });

  await page.locator(".result-section").screenshot({
    path: resolve(outputDirectory, "phase_measurement.png"),
    animations: "disabled"
  });
} finally {
  await browser.close();
  await server.httpServer.close();
}
