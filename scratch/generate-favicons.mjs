import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const FONT_IMPORT = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&display=swap');
`;

function getHtml({ text1 = 'b', text2 = '.id', bg = '#ffffff', color1 = '#14131f', color2 = '#4338ca', fontSize = 180 }) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    ${FONT_IMPORT}
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      width: 512px;
      height: 512px;
      background: ${bg};
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Space Grotesk', sans-serif;
    }
    .mark {
      font-size: ${fontSize}px;
      font-weight: 800;
      letter-spacing: -0.06em;
      line-height: 1;
      display: flex;
      align-items: baseline;
      transform: translateY(12px);
    }
  </style>
</head>
<body>
  <div class="mark">
    <span style="color: ${color1}">${text1}</span><span style="color: ${color2}">${text2}</span>
  </div>
</body>
</html>`;
}

async function run() {
  console.log('Generating favicon and app icons...');
  const browser = await chromium.launch();
  
  // 512x512 icon
  const page512 = await browser.newPage({ viewport: { width: 512, height: 512 } });
  await page512.setContent(getHtml({ fontSize: 210 }), { waitUntil: 'networkidle' });
  await page512.evaluate(() => document.fonts.ready);
  await page512.waitForTimeout(200);

  const icon512Png = await page512.screenshot({ type: 'png' });
  fs.writeFileSync('public/icon.png', icon512Png);
  fs.writeFileSync('app/icon.png', icon512Png);
  console.log('✅ Generated public/icon.png & app/icon.png (512x512)');

  // 180x180 apple icon
  const page180 = await browser.newPage({ viewport: { width: 180, height: 180 } });
  await page180.setContent(getHtml({ fontSize: 75 }), { waitUntil: 'networkidle' });
  await page180.evaluate(() => document.fonts.ready);
  await page180.waitForTimeout(200);

  const applePng = await page180.screenshot({ type: 'png' });
  fs.writeFileSync('public/apple-icon.png', applePng);
  fs.writeFileSync('app/apple-icon.png', applePng);
  console.log('✅ Generated public/apple-icon.png & app/apple-icon.png (180x180)');

  // 48x48 / 32x32 for favicon.ico
  const page48 = await browser.newPage({ viewport: { width: 48, height: 48 } });
  await page48.setContent(getHtml({ fontSize: 20 }), { waitUntil: 'networkidle' });
  await page48.evaluate(() => document.fonts.ready);
  await page48.waitForTimeout(200);

  const fav48Png = await page48.screenshot({ type: 'png' });
  // In modern browsers, a PNG file saved as favicon.ico or favicon.png works universally
  fs.writeFileSync('public/favicon.ico', fav48Png);
  fs.writeFileSync('app/favicon.ico', fav48Png);
  console.log('✅ Generated public/favicon.ico & app/favicon.ico');

  // Also remove the old teal app/icon.jpg
  if (fs.existsSync('app/icon.jpg')) {
    fs.unlinkSync('app/icon.jpg');
    console.log('🗑️ Deleted old teal app/icon.jpg!');
  }

  await browser.close();
  console.log('🎉 Favicon generation complete!');
}

run().catch(console.error);
