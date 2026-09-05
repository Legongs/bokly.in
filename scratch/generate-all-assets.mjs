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

const FONT_HEAD = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap" rel="stylesheet">
`;

// Helper to write SVG files
function createSvg({
  width = 1080,
  height = 1080,
  bg = '#ffffff',
  text1 = 'bukly',
  color1 = '#14131f',
  text2 = '.id',
  color2 = '#4338ca',
  fontSize = 172,
  fontWeight = '700',
  letterSpacing = '-0.055em',
  yOffset = 20
}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700;800&amp;display=swap');
    .wordmark {
      font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: ${fontSize}px;
      font-weight: ${fontWeight};
      letter-spacing: ${letterSpacing};
    }
  </style>
  <rect width="${width}" height="${height}" fill="${bg}" />
  <text x="50%" y="${540 + yOffset}" text-anchor="middle" dominant-baseline="middle" class="wordmark">
    <tspan fill="${color1}">${text1}</tspan><tspan fill="${color2}">${text2}</tspan>
  </text>
</svg>`;
}

async function main() {
  console.log('🚀 Starting profile pictures and mockup generation...');
  const browser = await chromium.launch();

  // 1. Generate Individual Profile Pictures (1080x1080)
  const avatarConfigs = [
    {
      id: 'profile-bukly-white',
      title: 'Full Wordmark — Official White',
      subtitle: 'Standar resmi bukly.id untuk Instagram, Threads & Facebook',
      bg: '#ffffff',
      text1: 'bukly',
      color1: '#14131f',
      text2: '.id',
      color2: '#4338ca',
      fontSize: 172,
      fontWeight: '700',
      letterSpacing: '-0.055em',
      yOffset: 15
    },
    {
      id: 'profile-bukly-dark',
      title: 'Full Wordmark — Dark Charcoal',
      subtitle: 'Tampilan elegan dengan latar gelap stone-900',
      bg: '#14131f',
      text1: 'bukly',
      color1: '#ffffff',
      text2: '.id',
      color2: '#818cf8',
      fontSize: 172,
      fontWeight: '700',
      letterSpacing: '-0.055em',
      yOffset: 15
    },
    {
      id: 'profile-bukly-indigo',
      title: 'Full Wordmark — Brand Indigo',
      subtitle: 'Dominan warna identitas indigo-700 yang mencolok',
      bg: '#4338ca',
      text1: 'bukly',
      color1: '#ffffff',
      text2: '.id',
      color2: '#c7d2fe',
      fontSize: 172,
      fontWeight: '700',
      letterSpacing: '-0.055em',
      yOffset: 15
    },
    {
      id: 'profile-bid-white',
      title: 'Monogram b.id — Official White',
      subtitle: 'Format ringkas ultra-jelas untuk avatar kecil di komentar/DM',
      bg: '#ffffff',
      text1: 'b',
      color1: '#14131f',
      text2: '.id',
      color2: '#4338ca',
      fontSize: 320,
      fontWeight: '700',
      letterSpacing: '-0.06em',
      yOffset: 25
    },
    {
      id: 'profile-bid-dark',
      title: 'Monogram b.id — Dark Charcoal',
      subtitle: 'Format ringkas b.id latar gelap',
      bg: '#14131f',
      text1: 'b',
      color1: '#ffffff',
      text2: '.id',
      color2: '#818cf8',
      fontSize: 320,
      fontWeight: '700',
      letterSpacing: '-0.06em',
      yOffset: 25
    },
    {
      id: 'profile-bid-indigo',
      title: 'Monogram b.id — Brand Indigo',
      subtitle: 'Format ringkas b.id latar indigo',
      bg: '#4338ca',
      text1: 'b',
      color1: '#ffffff',
      text2: '.id',
      color2: '#c7d2fe',
      fontSize: 320,
      fontWeight: '700',
      letterSpacing: '-0.06em',
      yOffset: 25
    }
  ];

  const page = await browser.newPage({ viewport: { width: 1080, height: 1080 } });

  for (const cfg of avatarConfigs) {
    // Write SVG
    const svgContent = createSvg(cfg);
    const svgPathPublic = path.join(outDirPublic, `${cfg.id}.svg`);
    const svgPathBrain = path.join(outDirBrain, `${cfg.id}.svg`);
    fs.writeFileSync(svgPathPublic, svgContent, 'utf8');
    fs.writeFileSync(svgPathBrain, svgContent, 'utf8');

    // Render HTML & capture PNG
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  ${FONT_HEAD}
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      width: 1080px;
      height: 1080px;
      background: ${cfg.bg};
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Space Grotesk', sans-serif;
    }
    .wordmark {
      font-size: ${cfg.fontSize}px;
      font-weight: ${cfg.fontWeight};
      letter-spacing: ${cfg.letterSpacing};
      line-height: 1;
      display: flex;
      align-items: baseline;
      transform: translateY(${cfg.yOffset}px);
    }
    .c1 { color: ${cfg.color1}; }
    .c2 { color: ${cfg.color2}; }
  </style>
</head>
<body>
  <div class="wordmark">
    <span class="c1">${cfg.text1}</span><span class="c2">${cfg.text2}</span>
  </div>
</body>
</html>`;

    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(200);

    const pngPathPublic = path.join(outDirPublic, `${cfg.id}.png`);
    const pngPathBrain = path.join(outDirBrain, `${cfg.id}.png`);
    await page.screenshot({ path: pngPathPublic, type: 'png' });
    fs.copyFileSync(pngPathPublic, pngPathBrain);
    console.log(`✅ Saved: ${cfg.id}.png & .svg`);
  }

  // 2. Generate Social Media Realistic Mockup Showcase (1600x1000)
  const mockupPage = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  const showcaseHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  ${FONT_HEAD}
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      width: 1600px;
      height: 1000px;
      background: #0f172a;
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #f8fafc;
      padding: 50px 70px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding-bottom: 24px;
    }
    .title-box h1 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 34px;
      font-weight: 700;
      letter-spacing: -0.03em;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .title-box p {
      color: #94a3b8;
      font-size: 16px;
      margin-top: 6px;
    }
    .tag {
      background: rgba(67, 56, 202, 0.25);
      border: 1px solid rgba(99, 102, 241, 0.4);
      color: #a5b4fc;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 600;
    }
    
    .cards-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 32px;
      margin-top: 36px;
    }
    
    /* Social Mockup Card */
    .mock-card {
      background: #1e293b;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
      display: flex;
      flex-direction: column;
    }
    .mock-card-header {
      padding: 16px 20px;
      background: rgba(0,0,0,0.2);
      border-bottom: 1px solid rgba(255,255,255,0.05);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 14px;
      font-weight: 700;
    }
    .platform-badge {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .platform-badge svg {
      width: 20px;
      height: 20px;
    }
    .mock-body {
      padding: 28px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      flex: 1;
    }
    
    /* Avatar circular preview */
    .avatar-wrapper {
      position: relative;
      margin-bottom: 20px;
    }
    .avatar-circle {
      width: 130px;
      height: 130px;
      border-radius: 50%;
      overflow: hidden;
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      border: 3px solid #ffffff;
    }
    .avatar-circle.ig-gradient {
      padding: 4px;
      background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
    }
    .avatar-inner {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      letter-spacing: -0.055em;
    }
    .avatar-inner.bg-white {
      background: #ffffff;
      color: #14131f;
    }
    .avatar-inner.bg-dark {
      background: #14131f;
      color: #ffffff;
    }
    .avatar-inner.bg-indigo {
      background: #4338ca;
      color: #ffffff;
    }
    
    .account-name {
      font-size: 19px;
      font-weight: 700;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .verified-icon {
      color: #38bdf8;
      width: 17px;
      height: 17px;
      fill: #38bdf8;
    }
    .account-handle {
      font-size: 13px;
      color: #94a3b8;
      margin-top: 3px;
      font-weight: 500;
    }
    .account-bio {
      font-size: 13px;
      color: #cbd5e1;
      margin-top: 14px;
      line-height: 1.5;
      max-width: 90%;
    }
    .account-stats {
      display: flex;
      gap: 20px;
      margin-top: 18px;
      padding-top: 16px;
      border-top: 1px solid rgba(255,255,255,0.06);
      width: 100%;
      justify-content: center;
    }
    .stat-item {
      text-align: center;
    }
    .stat-num {
      font-weight: 700;
      font-size: 15px;
      color: #ffffff;
    }
    .stat-lbl {
      font-size: 11px;
      color: #94a3b8;
      margin-top: 2px;
    }
    
    .footer-bar {
      margin-top: 24px;
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 14px;
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      color: #94a3b8;
    }
    .footer-left {
      display: flex;
      gap: 24px;
    }
    .footer-item strong {
      color: #f1f5f9;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title-box">
      <h1>bukly<span style="color:#6366f1">.id</span> Profile Picture Showcase</h1>
      <p>Simulasi tampilan avatar lingkaran di Instagram, Threads, dan Facebook (1:1 High Resolution — 1080×1080)</p>
    </div>
    <div class="tag">100% Brand Compliant (logo_design.md)</div>
  </div>

  <div class="cards-row">
    <!-- Instagram Mockup -->
    <div class="mock-card">
      <div class="mock-card-header">
        <div class="platform-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="#e1306c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
          <span>Instagram Profile</span>
        </div>
        <span style="color:#94a3b8; font-size:12px;">Official White</span>
      </div>
      <div class="mock-body">
        <div class="avatar-wrapper">
          <div class="avatar-circle ig-gradient">
            <div class="avatar-inner bg-white">
              <span style="font-size: 24px;">bukly<span style="color:#4338ca;">.id</span></span>
            </div>
          </div>
        </div>
        <div class="account-name">bukly.id</div>
        <div class="account-handle">@bukly.id • Software & Jasa Booking</div>
        <div class="account-bio">
          Platform reservasi & booking jadwal otomatis untuk UMKM Indonesia 📅 Solusi barbershop, salon, klinik & jasa ⚡
        </div>
        <div class="account-stats">
          <div class="stat-item"><div class="stat-num">1.2K</div><div class="stat-lbl">Posts</div></div>
          <div class="stat-item"><div class="stat-num">24.8K</div><div class="stat-lbl">Followers</div></div>
          <div class="stat-item"><div class="stat-num">142</div><div class="stat-lbl">Following</div></div>
        </div>
      </div>
    </div>

    <!-- Threads Mockup -->
    <div class="mock-card">
      <div class="mock-card-header">
        <div class="platform-badge">
          <svg viewBox="0 0 24 24" fill="currentColor" color="#ffffff">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.84 13.52c-.68 1.15-1.74 1.88-3.08 2.05-1.72.22-3.18-.45-4.04-1.84-.71-1.15-.84-2.67-.34-4.27.67-2.14 2.37-3.66 4.43-4.01 1.76-.3 3.32.25 4.19 1.48.56.79.8 1.8.69 2.87-.04.42-.39.73-.81.71-.42-.02-.75-.36-.71-.78.07-.75-.08-1.44-.45-1.96-.58-.83-1.68-1.2-2.98-.98-1.57.27-2.91 1.5-3.44 3.19-.4 1.28-.29 2.47.28 3.39.63 1.02 1.73 1.52 3.03 1.35 1.04-.13 1.87-.71 2.39-1.59.21-.36.68-.48 1.04-.27.36.22.48.68.25 1.05z"/>
          </svg>
          <span>Threads Profile</span>
        </div>
        <span style="color:#94a3b8; font-size:12px;">Dark Charcoal</span>
      </div>
      <div class="mock-body">
        <div class="avatar-wrapper">
          <div class="avatar-circle" style="border: 3px solid #334155;">
            <div class="avatar-inner bg-dark">
              <span style="font-size: 24px;">bukly<span style="color:#818cf8;">.id</span></span>
            </div>
          </div>
        </div>
        <div class="account-name">bukly.id</div>
        <div class="account-handle">bukly.id • threads.net</div>
        <div class="account-bio">
          Bikin website reservasi usahamu sendiri dalam 1 menit. Tanpa ribet balas chat satu-satu 🚀 Pelanggan pesan 24/7.
        </div>
        <div class="account-stats">
          <div class="stat-item"><div class="stat-num">18.4K</div><div class="stat-lbl">Followers</div></div>
          <div class="stat-item"><div class="stat-num">bukly.id</div><div class="stat-lbl">Website</div></div>
        </div>
      </div>
    </div>

    <!-- Facebook Mockup -->
    <div class="mock-card">
      <div class="mock-card-header">
        <div class="platform-badge">
          <svg viewBox="0 0 24 24" fill="#1877f2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span>Facebook Page</span>
        </div>
        <span style="color:#94a3b8; font-size:12px;">Monogram b.id</span>
      </div>
      <div class="mock-body">
        <div class="avatar-wrapper">
          <div class="avatar-circle" style="border: 3px solid #1877f2;">
            <div class="avatar-inner bg-indigo">
              <span style="font-size: 38px;">b<span style="color:#c7d2fe;">.id</span></span>
            </div>
          </div>
        </div>
        <div class="account-name">bukly.id</div>
        <div class="account-handle">Halaman Bisnis • Perangkat Lunak</div>
        <div class="account-bio">
          Solusi digitalisasi pemesanan jadwal & reservasi online tanpa potongan komisi untuk UMKM di seluruh Indonesia.
        </div>
        <div class="account-stats">
          <div class="stat-item"><div class="stat-num">32K</div><div class="stat-lbl">Suka</div></div>
          <div class="stat-item"><div class="stat-num">35K</div><div class="stat-lbl">Pengikut</div></div>
          <div class="stat-item"><div class="stat-num">100%</div><div class="stat-lbl">Respons Cepat</div></div>
        </div>
      </div>
    </div>
  </div>

  <div class="footer-bar">
    <div class="footer-left">
      <div class="footer-item">Format: <strong>1080 × 1080 PNG & Vector SVG</strong></div>
      <div class="footer-item">Font: <strong>Space Grotesk (Weight 700)</strong></div>
      <div class="footer-item">Palet: <strong>#14131f (Charcoal) & #4338ca (Indigo)</strong></div>
    </div>
    <div>Aset siap diunduh & digunakan untuk seluruh profil media sosial resmi bukly.id</div>
  </div>
</body>
</html>`;

  await mockupPage.setContent(showcaseHtml, { waitUntil: 'networkidle' });
  await mockupPage.evaluate(() => document.fonts.ready);
  await mockupPage.waitForTimeout(300);

  const showcasePathPublic = path.join(outDirPublic, 'mockup-social-showcase.png');
  const showcasePathBrain = path.join(outDirBrain, 'mockup-social-showcase.png');
  await mockupPage.screenshot({ path: showcasePathPublic, type: 'png' });
  fs.copyFileSync(showcasePathPublic, showcasePathBrain);
  console.log('✅ Saved: mockup-social-showcase.png');

  await browser.close();
  console.log('🎉 All assets and mockups rendered successfully!');
}

main().catch(console.error);
