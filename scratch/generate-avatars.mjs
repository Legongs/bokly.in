import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outDirPublic = path.resolve('public', 'brand');
const outDirBrain = path.resolve('C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\ecfb8cbe-1010-4f2a-a631-a65afa8fc6c5', 'assets');

[outDirPublic, outDirBrain].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const FONT_IMPORT = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap');
`;

function getHtmlTemplate({
  bg = '#ffffff',
  text1 = 'bukly',
  color1 = '#14131f',
  text2 = '.id',
  color2 = '#4338ca',
  fontSize = '160px',
  fontWeight = '700',
  letterSpacing = '-0.055em',
  fontFamily = "'Space Grotesk', 'Plus Jakarta Sans', sans-serif",
  showCircleGuide = false
}) {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <style>
    ${FONT_IMPORT}
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: 1080px;
      height: 1080px;
      background-color: ${bg};
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      position: relative;
    }
    .logo-container {
      display: flex;
      align-items: baseline;
      justify-content: center;
      font-family: ${fontFamily};
      font-size: ${fontSize};
      font-weight: ${fontWeight};
      letter-spacing: ${letterSpacing};
      line-height: 1;
      user-select: none;
      /* optical center correction */
      transform: translateY(-4px);
    }
    .text-main {
      color: ${color1};
    }
    .text-accent {
      color: ${color2};
    }
    ${showCircleGuide ? `
    .circle-guide {
      position: absolute;
      top: 0;
      left: 0;
      width: 1080px;
      height: 1080px;
      border-radius: 50%;
      border: 3px dashed rgba(67, 56, 202, 0.4);
      pointer-events: none;
    }
    .safe-guide {
      position: absolute;
      top: 90px;
      left: 90px;
      width: 900px;
      height: 900px;
      border-radius: 50%;
      border: 1px solid rgba(67, 56, 202, 0.2);
      pointer-events: none;
    }
    ` : ''}
  </style>
</head>
<body>
  ${showCircleGuide ? '<div class="circle-guide"></div><div class="safe-guide"></div>' : ''}
  <div class="logo-container">
    <span class="text-main">${text1}</span><span class="text-accent">${text2}</span>
  </div>
</body>
</html>`;
}

async function run() {
  console.log('Launching browser...');
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1080, height: 1080 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  const configs = [
    // 1. Full Wordmark - Official White (Primary)
    {
      name: 'profile-bukly-white',
      bg: '#ffffff',
      text1: 'bukly',
      color1: '#14131f',
      text2: '.id',
      color2: '#4338ca',
      fontSize: '172px',
      fontWeight: '700',
      letterSpacing: '-0.055em'
    },
    // 2. Full Wordmark - Dark Charcoal
    {
      name: 'profile-bukly-dark',
      bg: '#14131f',
      text1: 'bukly',
      color1: '#ffffff',
      text2: '.id',
      color2: '#6366f1',
      fontSize: '172px',
      fontWeight: '700',
      letterSpacing: '-0.055em'
    },
    // 3. Full Wordmark - Brand Indigo
    {
      name: 'profile-bukly-indigo',
      bg: '#4338ca',
      text1: 'bukly',
      color1: '#ffffff',
      text2: '.id',
      color2: '#c7d2fe',
      fontSize: '172px',
      fontWeight: '700',
      letterSpacing: '-0.055em'
    },
    // 4. Monogram b.id - Official White
    {
      name: 'profile-bid-white',
      bg: '#ffffff',
      text1: 'b',
      color1: '#14131f',
      text2: '.id',
      color2: '#4338ca',
      fontSize: '320px',
      fontWeight: '700',
      letterSpacing: '-0.06em'
    },
    // 5. Monogram b.id - Dark Charcoal
    {
      name: 'profile-bid-dark',
      bg: '#14131f',
      text1: 'b',
      color1: '#ffffff',
      text2: '.id',
      color2: '#6366f1',
      fontSize: '320px',
      fontWeight: '700',
      letterSpacing: '-0.06em'
    },
    // 6. Monogram b.id - Brand Indigo
    {
      name: 'profile-bid-indigo',
      bg: '#4338ca',
      text1: 'b',
      color1: '#ffffff',
      text2: '.id',
      color2: '#c7d2fe',
      fontSize: '320px',
      fontWeight: '700',
      letterSpacing: '-0.06em'
    },
    // 7. Preview with Circular Crop Frame (Visual Safe Zone Guide)
    {
      name: 'preview-circle-crop-guide',
      bg: '#ffffff',
      text1: 'bukly',
      color1: '#14131f',
      text2: '.id',
      color2: '#4338ca',
      fontSize: '172px',
      fontWeight: '700',
      letterSpacing: '-0.055em',
      showCircleGuide: true
    }
  ];

  for (const cfg of configs) {
    const html = getHtmlTemplate(cfg);
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    // wait a small tick for font render
    await page.waitForTimeout(300);

    const publicPath = path.join(outDirPublic, `${cfg.name}.png`);
    const brainPath = path.join(outDirBrain, `${cfg.name}.png`);

    await page.screenshot({ path: publicPath, type: 'png' });
    fs.copyFileSync(publicPath, brainPath);
    console.log(`Generated: ${cfg.name}.png`);
  }

  await browser.close();
  console.log('All profile pictures generated successfully!');
}

run().catch(console.error);
