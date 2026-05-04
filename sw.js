// v48-push: Service Worker do GMAX LEAGUE
// Recebe push notifications do backend e abre/foca a aba certa no click.

self.addEventListener('install', (event) => {
  // Ativa imediatamente sem esperar tabs antigas fecharem
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Toma controle de clientes existentes
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'GMAX LEAGUE', body: event.data ? event.data.text() : '' };
  }
  const title = data.title || 'GMAX LEAGUE';
  const opts = {
    body: data.body || '',
    icon: data.icon || '/gmax-league-logo.png',
    badge: data.badge || '/gmax-league-logo.png',
    tag: data.tag || 'gmax-default',
    data: { url: data.url || '/lobbies.html' },
    requireInteraction: !!data.requireInteraction,
    renotify: true,
    // vibrate: padrao curto
    vibrate: [100, 50, 100],
  };
  event.waitUntil(self.registration.showNotification(title, opts));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/lobbies.html';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      // Procura uma aba do nosso domínio já aberta
      for (const client of clientsArr) {
        try {
          const u = new URL(client.url);
          if (u.hostname === self.location.hostname) {
            // Foca + navega pra URL alvo
            return client.focus().then(() => {
              if (client.navigate) return client.navigate(targetUrl);
            });
          }
        } catch {}
      }
      // Senão, abre nova aba
      return self.clients.openWindow(targetUrl);
    })
  );
});
