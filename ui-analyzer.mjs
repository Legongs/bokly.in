import { chromium } from 'playwright';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

// Memuat variabel lingkungan dari file .env
dotenv.config();

// Menerima URL target dari argumen CLI
const targetUrl = process.argv[2];

async function analyzeUI() {
  if (!targetUrl) {
    console.error('❌ Harap berikan URL target. Contoh: node ui-analyzer.mjs https://example.com');
    process.exit(1);
  }

  let browser;

  try {
    console.log(`🚀 Memulai analisis UI untuk: ${targetUrl}`);

    // 1. Luncurkan Chromium dalam mode headless
    console.log('🌐 Meluncurkan browser...');
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // 2. Buka URL target dan tunggu hingga jaringan selesai (networkidle)
    console.log('⏳ Memuat halaman dan menunggu aktivitas jaringan selesai...');
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 60000 });

    // 3. Ambil tangkapan layar penuh dan ubah menjadi buffer Base64
    console.log('📸 Mengambil tangkapan layar (full page)...');
    const screenshotBuffer = await page.screenshot({ fullPage: true });
    const base64Image = screenshotBuffer.toString('base64');

    // 4. Inisialisasi SDK Gemini
    // Menggunakan API key sesuai dengan instruksi, dengan fallback ke variabel standar
    const apiKey = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6Ip4aIco2d7aPEMjlVWrzGwviZbjobPI0g7hbCZYqPHTg';
    
    if (!apiKey) {
      throw new Error('API Key tidak ditemukan.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    // 5. Siapkan prompt untuk bertindak sebagai UX Researcher
    console.log('🧠 Mengirim data ke Gemini 3.6 Flash untuk analisis...');
    const prompt = `Bertindaklah sebagai UX Researcher yang ahli. Analisis tangkapan layar situs web kompetitor ini dan ekstrak 4 hal berikut dalam format poin:
- Daftar Fitur Utama
- Alur Navigasi Booking
- Struktur Harga
- Kelemahan UX yang terlalu kaku untuk UMKM lokal`;

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: 'image/png',
      },
    };

    // Eksekusi prompt beserta gambar
    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();

    // 6. Cetak teks balasan langsung ke terminal
    console.log('\n================ HASIL ANALISIS UX ================');
    console.log(responseText);
    console.log('===================================================\n');

  } catch (error) {
    // 7. Blok try...catch untuk menangani error jaringan atau API
    console.error('\n❌ Terjadi kesalahan saat menjalankan UI Analyzer:');
    console.error(error.message);
  } finally {
    // Pastikan browser selalu ditutup meskipun terjadi error
    if (browser) {
      await browser.close();
      console.log('🚪 Browser ditutup.');
    }
  }
}

// Menjalankan fungsi utama
analyzeUI();
