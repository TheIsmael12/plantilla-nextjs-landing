import { chromium } from "playwright";

const BASE = "http://localhost:4002";
const OUT =
  "C:/Users/Ismael/AppData/Local/Temp/claude/c--Users-Ismael-Desktop-Proyecto-Enova-Plantillas/60017696-bb62-47ac-a739-ce0280e43969/scratchpad/shots";

const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 1000 } })).newPage();

await page.goto(`${BASE}/iniciar-sesion`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1500);
const cookies = page.locator('button:has-text("Aceptar todo")');
if ((await cookies.count()) > 0) await cookies.first().click();
await page.fill("#taxId", "H28455901");
await page.fill("#password", "Admin12,.");
await page.click('button[type="submit"]');
await page.waitForURL(/area-privada/, { timeout: 60000 }).catch(() => {});

/** El detalle de una incidencia con conversación. */
await page.goto(`${BASE}/area-privada/incidencias/ba7775ec-7bca-4e20-9ed5-a8396fb94823`, {
  waitUntil: "domcontentloaded",
});
await page.waitForTimeout(4000);
await page.screenshot({ path: `${OUT}/110-detalle-actual.png`, fullPage: true });

/** Y el wizard en el paso del tipo, que es donde se apelotona. */
await page.goto(`${BASE}/area-privada/incidencias`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(3000);
await page.screenshot({ path: `${OUT}/111-lista-boton.png` });

await page.locator('button:has-text("Abrir la incidencia")').first().click();
await page.waitForTimeout(1200);
await page.locator(".incident-wizard label").first().click();
await page.waitForTimeout(400);
await page.locator(".incident-wizard__actions button:last-child").click();
await page.waitForTimeout(1000);
await page.screenshot({ path: `${OUT}/112-wizard-tipo-actual.png` });

/** Y en móvil, que es donde peor se ve todo lo apretado. */
await page.setViewportSize({ width: 420, height: 900 });
await page.waitForTimeout(900);
await page.screenshot({ path: `${OUT}/113-wizard-tipo-movil.png` });

await browser.close();
