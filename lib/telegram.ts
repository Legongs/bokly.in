// Utility function untuk mengirim notifikasi ke Telegram menggunakan Bot API
// Sesuai dengan agen_rule.md: Jangan biarkan aplikasi crash jika gagal, cukup log warning.

export async function sendTelegramNotification(chatId: string, message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!token) {
    console.warn("Telegram bot token tidak ditemukan. Notifikasi dilewati.");
    return;
  }

  if (!chatId) {
    console.warn("Telegram Chat ID kosong. Notifikasi dilewati.");
    return;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      const errRes = await response.text();
      console.warn(`Gagal mengirim notifikasi Telegram ke ${chatId}:`, errRes);
    }
  } catch (error) {
    console.warn("Kesalahan koneksi saat mengirim notifikasi Telegram:", error);
  }
}
