import { chromium } from 'playwright';

const OUT_DIR = 'C:\\Users\\ADMINI~1\\AppData\\Local\\Temp\\claude\\c--Users-Administrador-OneDrive-Escritorio-Desarrollo-plantillas\\a8696d84-6e29-466c-a6ed-3dfc7d2be49d\\scratchpad';

const browser = await chromium.launch();

// ---------- Portal cliente (plantilla-nextjs-landing, :3002) ----------
const portalContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const portalPage = await portalContext.newPage();

try {
  await portalPage.goto('http://localhost:3002/es/login', { waitUntil: 'networkidle', timeout: 30000 });

  const acceptCookies = portalPage.locator('button:has-text("Aceptar todo")');
  if (await acceptCookies.count() > 0) await acceptCookies.click();

  await portalPage.fill('#taxId', '47464531Y');
  await portalPage.fill('#password', 'Admin12,.');
  await portalPage.click('button[type="submit"]:has-text("Iniciar sesión")');
  await portalPage.waitForTimeout(3000);
  await portalPage.screenshot({ path: `${OUT_DIR}\\portal-after-login.png` });
  console.log('Portal URL after login:', portalPage.url());

  await portalPage.goto('http://localhost:3002/es/area-privada/incidencias/cea3f129-58b1-4457-a54c-c12e77eac9e5', {
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  await portalPage.waitForTimeout(1500);
  await portalPage.screenshot({ path: `${OUT_DIR}\\portal-incident-detail.png`, fullPage: true });
  console.log('Portal incident detail screenshot saved, URL:', portalPage.url());
} catch (err) {
  console.error('Portal error:', err.message);
  await portalPage.screenshot({ path: `${OUT_DIR}\\portal-error.png` }).catch(() => {});
}

// ---------- Intranet (plantilla-nextjs, :3000) ----------
const intranetContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const intranetPage = await intranetContext.newPage();

try {
  await intranetPage.goto('http://localhost:3000/es/login', { waitUntil: 'networkidle', timeout: 30000 });

  const acceptCookies2 = intranetPage.locator('button:has-text("Aceptar todo")');
  if (await acceptCookies2.count() > 0) await acceptCookies2.click();

  await intranetPage.fill('input[name="identifier"]', 'admin@dev.local');
  await intranetPage.fill('input[name="password"]', 'Admin123!');
  await intranetPage.click('button[type="submit"]');
  await intranetPage.waitForTimeout(3000);
  await intranetPage.screenshot({ path: `${OUT_DIR}\\intranet-after-login.png` });
  console.log('Intranet URL after login:', intranetPage.url());

  await intranetPage.goto('http://localhost:3000/es/incidents/cea3f129-58b1-4457-a54c-c12e77eac9e5', {
    waitUntil: 'networkidle',
    timeout: 30000,
  });
  await intranetPage.waitForTimeout(1500);
  await intranetPage.screenshot({ path: `${OUT_DIR}\\intranet-incident-detail.png`, fullPage: true });
  console.log('Intranet incident detail screenshot saved, URL:', intranetPage.url());
} catch (err) {
  console.error('Intranet error:', err.message);
  await intranetPage.screenshot({ path: `${OUT_DIR}\\intranet-error.png` }).catch(() => {});
}

await browser.close();
console.log('Done');
