import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();

await page.goto('http://localhost:3002/es/login', { waitUntil: 'networkidle' });
const accept = page.locator('button:has-text("Aceptar todo")');
if (await accept.count() > 0) await accept.click();
await page.fill('#taxId', '47464531Y');
await page.fill('#password', 'Admin12,.');
await page.click('button[type="submit"]:has-text("Iniciar sesión")');
await page.waitForTimeout(2000);

await page.goto('http://localhost:3002/es/area-privada/incidencias/cea3f129-58b1-4457-a54c-c12e77eac9e5', {
  waitUntil: 'networkidle',
});
await page.waitForTimeout(1000);

const layout = await page.locator('.incident-detail__layout').count();
console.log('incident-detail__layout count:', layout);

const layoutStyles = await page.locator('.incident-detail__layout').evaluate((el) =>
  el ? getComputedStyle(el).display + ' | ' + getComputedStyle(el).gridTemplateColumns : 'not found'
).catch((e) => e.message);
console.log('layout computed style:', layoutStyles);

const avatarCount = await page.locator('.avatar').count();
console.log('avatar count:', avatarCount);

const avatarStyles = await page.locator('.avatar').first().evaluate((el) =>
  el ? getComputedStyle(el).borderRadius + ' | ' + getComputedStyle(el).backgroundColor : 'not found'
).catch((e) => e.message);
console.log('avatar computed style:', avatarStyles);

const bubbleCount = await page.locator('.incident-detail__thread-bubble').count();
console.log('bubble count:', bubbleCount);

const bubbleStyles = await page.locator('.incident-detail__thread-bubble').first().evaluate((el) =>
  el ? getComputedStyle(el).backgroundColor + ' | padding: ' + getComputedStyle(el).padding : 'not found'
).catch((e) => e.message);
console.log('bubble computed style:', bubbleStyles);

await browser.close();
