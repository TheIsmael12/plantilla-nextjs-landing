import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:3002/es/login', { waitUntil: 'networkidle' });
const inputs = await page.locator('input').all();
for (const input of inputs) {
  const name = await input.getAttribute('name');
  const id = await input.getAttribute('id');
  const type = await input.getAttribute('type');
  console.log(JSON.stringify({ name, id, type }));
}
const buttons = await page.locator('button').all();
for (const button of buttons) {
  const text = await button.innerText().catch(() => '');
  const type = await button.getAttribute('type');
  console.log('BUTTON:', JSON.stringify({ text, type }));
}
await browser.close();
