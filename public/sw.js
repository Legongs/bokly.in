self.addEventListener("install", (event) => {
  // Langsung aktifkan SW tanpa nunggu tab di-reload
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // SW langsung control semua client yang terbuka
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || "Notifikasi Baru";
    const options = {
      body: data.body || "Cek pembaruan terbaru kamu di bukly.id.",
      icon: "/icon.png",
      badge: "/icon.png",
      data: {
        url: data.url || "/",
      },
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (error) {
    console.error("Error parsing push payload:", error);
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data.url;

  // Fokus tab yang sudah ada kalau URL-nya sama, atau buka tab baru
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        let matchingClient = null;

        for (let i = 0; i < windowClients.length; i++) {
          const windowClient = windowClients[i];
          if (windowClient.url === urlToOpen) {
            matchingClient = windowClient;
            break;
          }
        }

        if (matchingClient) {
          return matchingClient.focus();
        } else {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});
